const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) console.warn('confirm-transaction: missing SUPABASE_URL or SUPABASE_SERVICE_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function jsonResponse(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'Method not allowed' });

  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth || !auth.startsWith('Bearer ')) return jsonResponse(res, 401, { error: 'Missing Authorization header' });
  const accessToken = auth.split(' ')[1];

  let body = {};
  try {
    body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(await getRawBody(req));
  } catch (e) {
    return jsonResponse(res, 400, { error: 'Invalid JSON body' });
  }

  const { transaction_id } = body || {};
  if (!transaction_id) return jsonResponse(res, 400, { error: 'Missing transaction_id' });

  try {
    // verify token -> ensure admin
    const { data: userData, error: userErr } = await supabase.auth.getUser(accessToken);
    if (userErr || !userData || !userData.user) return jsonResponse(res, 401, { error: 'Invalid token' });
    const admin = userData.user;

    // basic check: role claim
    const role = admin?.user_metadata?.role || (admin?.app_metadata && admin.app_metadata.role) || null;
    if (role !== 'admin') {
      return jsonResponse(res, 403, { error: 'Not an admin' });
    }

    // call RPC to process transaction to COMPLETED
    const rpcParams = {
      p_txn_id: transaction_id,
      p_new_status: 'COMPLETED',
      p_processed_by: admin.id,
      p_metadata: {}
    };

    const { error: rpcErr } = await supabase.rpc('process_transaction_update', rpcParams);
    if (rpcErr) {
      console.error('confirm-transaction rpc error', rpcErr);
      return jsonResponse(res, 500, { error: 'RPC failed' });
    }

    return jsonResponse(res, 200, { success: true });
  } catch (e) {
    console.error('confirm-transaction exception', e);
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
