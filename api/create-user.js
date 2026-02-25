const { createClient } = require('@supabase/supabase-js');

// Serverless endpoint to create/upsert a users row using the service role key.
// Expects POST with JSON { id, email, full_name, phone, referral, gender }
// Requires Authorization: Bearer <access_token> header (the user's access token).

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('create-user API: missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
}

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

  const { id, email, full_name, phone, referral, gender } = body || {};
  if (!id || typeof id !== 'string') return jsonResponse(res, 400, { error: 'Invalid id' });
  if (!email || typeof email !== 'string') return jsonResponse(res, 400, { error: 'Invalid email' });

  try {
    // Verify the token corresponds to the same user (or is valid)
    const { data: userData, error: userErr } = await supabase.auth.getUser(accessToken);
    if (userErr || !userData || !userData.user) return jsonResponse(res, 401, { error: 'Invalid or expired token' });
    const authUser = userData.user;
    if (authUser.id !== id && authUser.email !== email) {
      return jsonResponse(res, 403, { error: 'Token does not match payload' });
    }

    const payload = {
      id,
      email: (email || '').toLowerCase(),
      full_name: full_name ? String(full_name).trim() : null,
      phone: phone ? String(phone).trim() : null,
      referral: referral ? String(referral).trim() : null,
      gender: gender ? String(gender).trim() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Upsert into users table using service role key
    const { error: upsertErr } = await supabase.from('users').upsert(payload, { returning: 'minimal' });
    if (upsertErr) {
      console.error('create-user upsert error', upsertErr);
      return jsonResponse(res, 500, { error: 'Failed to create user record' });
    }

    return jsonResponse(res, 200, { success: true });
  } catch (e) {
    console.error('create-user exception', e);
    return jsonResponse(res, 500, { error: 'Server error' });
  }
};

// Helper to read raw body for environments where `req.body` isn't parsed
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
    req.on('error', err => reject(err));
  });
}
