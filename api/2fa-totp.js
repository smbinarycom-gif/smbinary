const { createClient } = require('@supabase/supabase-js');
const { authenticator } = require('otplib');
const { encryptString } = require('./_crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function jsonResponse(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'Method not allowed' });

    const path = (req.url || '').split('/').pop();
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth || !auth.startsWith('Bearer ')) return jsonResponse(res, 401, { error: 'Missing Authorization header' });
    const accessToken = auth.split(' ')[1];

    const { data: userData, error: userErr } = await supabase.auth.getUser(accessToken);
    if (userErr || !userData || !userData.user) return jsonResponse(res, 401, { error: 'Invalid token' });
    const user = userData.user;

    let body = {};
    try {
      body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(await getRawBody(req));
    } catch (e) {
      return jsonResponse(res, 400, { error: 'Invalid JSON body' });
    }

    if (path === 'generate') {
      // Generate a secret and return an otpauth URL (do not persist yet)
      const secret = authenticator.generateSecret();
      const label = `${process.env.SITE_NAME || 'SMBinary'}:${user.email || user.id}`;
      const otpauth = authenticator.keyuri(user.email || user.id, process.env.SITE_NAME || 'SMBinary', secret);
      return jsonResponse(res, 200, { secret, otpauth_url: otpauth });
    }

    if (path === 'verify') {
      const { secret, token, persist } = body || {};
      if (!secret || !token) return jsonResponse(res, 400, { error: 'Missing secret or token' });

      const ok = authenticator.check(String(token), String(secret));
      if (!ok) return jsonResponse(res, 400, { error: 'Invalid token' });

      if (persist) {
        try {
          const encrypted = encryptString(secret);
          // Store versioned encrypted payload in two_factor_secret_encrypted column; keep flag on
          const payloadToStore = encrypted.version === 'plain' ? { two_factor_enabled: true, two_factor_secret: encrypted.payload } : { two_factor_enabled: true, two_factor_secret_encrypted: encrypted.payload };
          const { error: updateErr } = await supabase.from('users').update(payloadToStore).eq('id', user.id);
          if (updateErr) {
            console.error('2fa persist error', updateErr);
            return jsonResponse(res, 500, { error: 'Failed to persist 2FA' });
          }
        } catch (e) {
          console.error('2fa persist exception', e);
          return jsonResponse(res, 500, { error: 'Failed to persist 2FA' });
        }
      }

      return jsonResponse(res, 200, { success: true });
    }

    return jsonResponse(res, 404, { error: 'Unknown action' });
  } catch (e) {
    console.error('2fa exception', e);
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
