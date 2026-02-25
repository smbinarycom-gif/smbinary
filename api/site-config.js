const { createClient } = require('@supabase/supabase-js');

// Serverless endpoint to update site config securely.
// Expects POST with JSON { siteName, logoText, logoUrl }
// Requires Authorization: Bearer <access_token> header.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ADMIN_EMAILS = (process.env.SITE_ADMIN_EMAILS || '').split(',').map(s => s.trim()).filter(Boolean);

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('site-config API: missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function jsonResponse(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { error: 'Method not allowed' });
  }

  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return jsonResponse(res, 401, { error: 'Missing Authorization header' });
  }
  const accessToken = auth.split(' ')[1];

  // Validate body
  let body = {};
  try {
    body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(await getRawBody(req));
  } catch (e) {
    return jsonResponse(res, 400, { error: 'Invalid JSON body' });
  }

  const { siteName, logoText, logoUrl } = body || {};
  if (!siteName || typeof siteName !== 'string' || siteName.trim().length < 2 || siteName.trim().length > 120) {
    return jsonResponse(res, 400, { error: 'Invalid siteName' });
  }
  if (!logoText || typeof logoText !== 'string' || logoText.trim().length < 1 || logoText.trim().length > 8) {
    return jsonResponse(res, 400, { error: 'Invalid logoText' });
  }
  if (logoUrl && typeof logoUrl !== 'string') {
    return jsonResponse(res, 400, { error: 'Invalid logoUrl' });
  }

  try {
    // Verify user using service role key
    const { data: userData, error: userErr } = await supabase.auth.getUser(accessToken);
    if (userErr || !userData || !userData.user) {
      return jsonResponse(res, 401, { error: 'Invalid or expired token' });
    }
    const user = userData.user;

    // Authorization: allow if email in ADMIN_EMAILS or user metadata indicates admin
    const email = user.email || '';
    const isAdminByMetadata = !!(user.user_metadata && (user.user_metadata.is_admin || user.user_metadata.role === 'admin'));
    const isAdminByAppMeta = !!(user.app_metadata && (user.app_metadata.role === 'admin'));
    const isAdminByList = ADMIN_EMAILS.includes(email);

    if (!isAdminByMetadata && !isAdminByAppMeta && !isAdminByList) {
      return jsonResponse(res, 403, { error: 'Not authorized' });
    }

    // Upsert sanitized values
    const payload = {
      id: 'default',
      site_name: siteName.trim(),
      logo_text: logoText.trim(),
      logo_url: logoUrl && logoUrl.trim() ? logoUrl.trim() : null,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertErr } = await supabase.from('site_config').upsert(payload, { returning: 'minimal' });
    if (upsertErr) {
      console.error('site-config upsert error', upsertErr);
      return jsonResponse(res, 500, { error: 'Failed to save site config' });
    }

    return jsonResponse(res, 200, { success: true });
  } catch (e) {
    console.error('site-config exception', e);
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
