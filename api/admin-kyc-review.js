const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ADMIN_EMAILS = (process.env.SITE_ADMIN_EMAILS || '').split(',').map(s => s.trim()).filter(Boolean);

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
  try { body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(await getRawBody(req)); } catch (e) { return jsonResponse(res, 400, { error: 'Invalid JSON body' }); }

  const { userId, action, reason } = body || {};
  if (!userId || !action) return jsonResponse(res, 400, { error: 'Missing userId or action' });
  if (!['approve','reject'].includes(action)) return jsonResponse(res, 400, { error: 'Invalid action' });

  try {
    const { data: adminData, error: adminErr } = await supabase.auth.getUser(accessToken);
    if (adminErr || !adminData || !adminData.user) return jsonResponse(res, 401, { error: 'Invalid token' });
    const admin = adminData.user;

    const email = admin.email || '';
    const isAdminByList = ADMIN_EMAILS.includes(email);
    const isAdminByMeta = !!(admin.user_metadata && (admin.user_metadata.is_admin || admin.user_metadata.role === 'admin')) || !!(admin.app_metadata && admin.app_metadata.role === 'admin');
    if (!isAdminByList && !isAdminByMeta) return jsonResponse(res, 403, { error: 'Not authorized' });

    const payload = {};
    if (action === 'approve') {
      payload.kyc_status = 'VERIFIED';
      payload.kyc_reviewed_by = admin.id;
      payload.kyc_reviewed_at = new Date().toISOString();
    } else if (action === 'reject') {
      payload.kyc_status = 'REJECTED';
      payload.kyc_reviewed_by = admin.id;
      payload.kyc_reviewed_at = new Date().toISOString();
      if (reason) payload.kyc_reject_reason = reason;
    }

    const { error: updateErr } = await supabase.from('users').update(payload).eq('id', userId);
    if (updateErr) {
      console.error('kyc review update error', updateErr);
      return jsonResponse(res, 500, { error: 'Failed to update user' });
    }

    return jsonResponse(res, 200, { success: true });
  } catch (e) {
    console.error('kyc review exception', e);
    return jsonResponse(res, 500, { error: 'Server error' });
  }
}

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
    req.on('error', err => reject(err));
  });
}
