const { createClient } = require('@supabase/supabase-js');

// Endpoint: POST /api/kyc-upload
// Body: { fileName, fileBase64 } and Authorization: Bearer <access_token>

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

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

  const { fileName, fileBase64 } = body || {};
  if (!fileName || !fileBase64) return jsonResponse(res, 400, { error: 'Missing fileName or fileBase64' });

  try {
    const { data: userData, error: userErr } = await supabase.auth.getUser(accessToken);
    if (userErr || !userData || !userData.user) return jsonResponse(res, 401, { error: 'Invalid token' });
    const user = userData.user;

    const buffer = Buffer.from(fileBase64, 'base64');
    const path = `kyc/${user.id}/${Date.now()}_${fileName}`;

    const { error: uploadErr } = await supabase.storage.from('kyc').upload(path, buffer, { contentType: 'image/jpeg', upsert: false });
    if (uploadErr) {
      console.error('kyc upload error', uploadErr);
      return jsonResponse(res, 500, { error: 'Failed to upload' });
    }

    const { data: publicUrlData } = supabase.storage.from('kyc').getPublicUrl(path);
    const publicUrl = publicUrlData?.publicUrl || null;

    const { error: updateErr } = await supabase.from('users').update({ kyc_status: 'PENDING', kyc_url: publicUrl }).eq('id', user.id);
    if (updateErr) {
      console.error('kyc update error', updateErr);
      return jsonResponse(res, 500, { error: 'Failed to update user record' });
    }

    return jsonResponse(res, 200, { success: true, url: publicUrl });
  } catch (e) {
    console.error('kyc exception', e);
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
