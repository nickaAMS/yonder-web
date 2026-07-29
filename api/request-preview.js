export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { email, platform, referral = '' } = req.body || {};
  if (!/^\S+@\S+\.\S+$/.test(String(email)) || !['iPhone', 'Android', 'Both'].includes(platform)) {
    return res.status(400).json({ error: 'Please enter an email address and choose a phone.' });
  }
  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const appsScriptToken = process.env.GOOGLE_APPS_SCRIPT_TOKEN;
  const leadStoreUrl = process.env.PREVIEW_LEADS_URL;
  const leadStoreSecret = process.env.PREVIEW_LEADS_SHARED_SECRET;
  if (!appsScriptUrl || !appsScriptToken || !leadStoreUrl || !leadStoreSecret) {
    return res.status(503).json({ error: 'Preview requests are not configured yet.' });
  }

  try {
    const ipAddress = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const city = decodeURIComponent(String(req.headers['x-vercel-ip-city'] || '')).trim();
    const country = decodeURIComponent(String(req.headers['x-vercel-ip-country'] || '')).trim();
    const lead = { email: String(email).trim(), platform, referral, ipAddress, city, country };
    const stored = await fetch(leadStoreUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-yonder-preview-key': leadStoreSecret },
      body: JSON.stringify(lead),
    });
    if (!stored.ok) throw new Error(`Lead storage returned ${stored.status}`);

    const emailUrl = new URL(appsScriptUrl);
    emailUrl.searchParams.set('token', appsScriptToken);
    const response = await fetch(emailUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...lead, source: 'yonder-web' }),
    });
    if (!response.ok) throw new Error(`Google Apps Script returned ${response.status}`);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Preview request failed', error);
    return res.status(502).json({ error: 'We could not save that request. Please try again.' });
  }
}
