export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { email, platform, referral = '' } = req.body || {};
  if (!/^\S+@\S+\.\S+$/.test(String(email)) || !['iPhone', 'Android', 'Both'].includes(platform)) {
    return res.status(400).json({ error: 'Please enter an email address and choose a phone.' });
  }
  if (!process.env.GOOGLE_APPS_SCRIPT_URL) {
    return res.status(503).json({ error: 'Preview requests are not configured yet.' });
  }

  try {
    const response = await fetch(process.env.GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, platform, referral, source: 'yonder-web' }),
    });
    if (!response.ok) throw new Error(`Google Apps Script returned ${response.status}`);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Preview request failed', error);
    return res.status(502).json({ error: 'We could not save that request. Please try again.' });
  }
}
