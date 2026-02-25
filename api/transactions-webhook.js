const { createClient } = require('@supabase/supabase-js');

// Server webhook/processor for deposit/withdrawal events.
// Expects POST JSON with { event: 'deposit.requested'|'deposit.updated'|'withdrawal.requested'|'withdrawal.updated', data: { ... } }
// Uses SUPABASE_SERVICE_KEY env var.

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('transactions-webhook: missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function jsonResponse(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

// simple idempotency helper: try to find by reference
async function findTransactionByReference(reference) {
  if (!reference) return null;
  const { data, error } = await supabase.from('transactions').select('*').eq('reference', reference).limit(1).maybeSingle();
  if (error) return null;
  return data;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'Method not allowed' });

  let body = {};
  try {
    // optional signature verification
    const sigHeader = req.headers['x-signature'] || req.headers['x-hub-signature'] || req.headers['signature'];
    const webhookSecret = process.env.TRANSACTIONS_WEBHOOK_SECRET;
    if (webhookSecret) {
      const crypto = require('crypto');
      const bodyRaw = typeof req.body === 'string' ? req.body : JSON.stringify(body);
      const hmac = crypto.createHmac('sha256', webhookSecret).update(bodyRaw).digest('hex');
      if (!sigHeader || !sigHeader.includes(hmac)) {
        console.warn('transactions-webhook: signature mismatch');
        return jsonResponse(res, 401, { error: 'Invalid signature' });
      }
    }
    body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(await getRawBody(req));
  } catch (e) {
    return jsonResponse(res, 400, { error: 'Invalid JSON body' });
  }

  const { event, data } = body || {};
  if (!event || !data) return jsonResponse(res, 400, { error: 'Missing event or data' });

  try {
    if (event === 'deposit.requested' || event === 'withdrawal.requested') {
      // create transaction (idempotent by reference)
      const existing = await findTransactionByReference(data.reference);
      if (existing) {
        return jsonResponse(res, 200, { success: true, note: 'already exists', id: existing.id });
      }

      const payload = {
        user_id: data.user_id,
        type: event.startsWith('deposit') ? 'DEPOSIT' : 'WITHDRAWAL',
        method: data.method || null,
        amount: data.amount || 0,
        currency: data.currency || 'USD',
        reference: data.reference || null,
        status: data.status || 'REQUESTED',
        metadata: data.metadata || null,
        balance_before: data.balance_before || null,
        balance_after: data.balance_after || null,
      };

      const { data: inserted, error: insertErr } = await supabase.from('transactions').insert(payload).select().single();
      if (insertErr) {
        console.error('transactions-webhook insert error', insertErr);
        return jsonResponse(res, 500, { error: 'Insert failed' });
      }

      // audit
      await supabase.from('transaction_audit').insert({ transaction_id: inserted.id, actor_id: null, action: 'CREATE', payload: body });

      return jsonResponse(res, 200, { success: true, id: inserted.id });
    }

    if (event === 'deposit.updated' || event === 'withdrawal.updated') {
      // update transaction by id or reference
      let txn = null;
      if (data.transaction_id) {
        const { data: t } = await supabase.from('transactions').select('*').eq('id', data.transaction_id).limit(1).maybeSingle();
        txn = t;
      } else if (data.reference) {
        txn = await findTransactionByReference(data.reference);
      }

      if (!txn) return jsonResponse(res, 404, { error: 'Transaction not found' });

      // allow only valid status transitions server-side; minimal check here
      const allowedStatuses = ['REQUESTED','PENDING','PROCESSING','COMPLETED','FAILED','CANCELLED'];
      const newStatus = (data.status || '').toUpperCase();
      if (newStatus && !allowedStatuses.includes(newStatus)) {
        return jsonResponse(res, 400, { error: 'Invalid status' });
      }

      const updates = {};
      if (newStatus) updates.status = newStatus;
      if (data.receipt_url) updates.receipt_url = data.receipt_url;
      if (data.metadata) updates.metadata = { ...(txn.metadata || {}), ...(data.metadata || {}) };
      if (data.processed_by) updates.processed_by = data.processed_by;
      if (typeof data.balance_after !== 'undefined') updates.balance_after = data.balance_after;

      // if COMPLETED and balance adjustments are needed, server should update user balance inside a DB transaction
      // If status change requires balance processing, call stored procedure for atomicity
      if (newStatus === 'COMPLETED') {
        try {
          const rpcParams = {
            p_txn_id: txn.id,
            p_new_status: newStatus,
            p_processed_by: data.processed_by || null,
            p_metadata: data.metadata || null
          };
          const { error: rpcErr } = await supabase.rpc('process_transaction_update', rpcParams);
          if (rpcErr) {
            console.error('transactions-webhook rpc error', rpcErr);
            return jsonResponse(res, 500, { error: 'Process rpc failed' });
          }
          return jsonResponse(res, 200, { success: true });
        } catch (e) {
          console.error('transactions-webhook rpc exception', e);
          return jsonResponse(res, 500, { error: 'Process rpc exception' });
        }
      }

      const { error: updErr } = await supabase.from('transactions').update(updates).eq('id', txn.id);
      if (updErr) {
        console.error('transactions-webhook update error', updErr);
        return jsonResponse(res, 500, { error: 'Update failed' });
      }

      await supabase.from('transaction_audit').insert({ transaction_id: txn.id, actor_id: data.processed_by || null, action: 'UPDATE', payload: body });

      return jsonResponse(res, 200, { success: true });
    }

    return jsonResponse(res, 400, { error: 'Unhandled event type' });
  } catch (e) {
    console.error('transactions-webhook exception', e);
    return jsonResponse(res, 500, { error: 'Server error' });
  }
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
    req.on('error', err => reject(err));
  });
}
