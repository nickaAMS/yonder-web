const tokenPattern = /^[A-Za-z0-9_-]{20,128}$/;

// The renderer stays with the story service, where the private Firestore
// share snapshot already lives. Vercel owns the public URL and can move to a
// canonical domain without changing tokens or mobile code.
const fallbackStoryShareServiceUrl =
  'https://yonder-tts-rzkvefqkrq-ez.a.run.app';

function serviceUrl() {
  return (process.env.STORY_SHARE_SERVICE_URL || fallbackStoryShareServiceUrl)
    .replace(/\/+$/, '');
}

function unavailable(res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Referrer-Policy', 'no-referrer');
  return res.status(404).send(
    '<!doctype html><title>Story unavailable · Namesake</title><meta name="robots" content="noindex,nofollow,noarchive"><p>This story is unavailable.</p>',
  );
}

function requestOrigin(req) {
  const forwardedHost = req.headers['x-forwarded-host'];
  const host = Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : forwardedHost || req.headers.host;
  return `https://${host}`;
}

function imageUrlFromHtml(html) {
  const match = html.match(
    /<meta\s+property="og:image"\s+content="([^"]+)"/i,
  );
  return match?.[1]
    ?.replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'") ?? null;
}

async function upstreamStoryHtml(token, { viewerUserAgent, purpose } = {}) {
  // The story service counts opens. It cannot see the visitor's real user
  // agent through this proxy, so forward it, and flag our own cover sub-fetch
  // so it is never counted as a page view.
  const headers = { Accept: 'text/html' };
  if (viewerUserAgent) headers['x-share-viewer-ua'] = String(viewerUserAgent);
  if (purpose) headers['x-share-purpose'] = purpose;
  return fetch(`${serviceUrl()}/s/${encodeURIComponent(token)}`, { headers });
}

async function serveCover(req, res, token) {
  try {
    const storyResponse = await upstreamStoryHtml(token, { purpose: 'cover' });
    if (!storyResponse.ok) return unavailable(res);
    const coverUrl = imageUrlFromHtml(await storyResponse.text());
    if (!coverUrl) return unavailable(res);

    const coverResponse = await fetch(coverUrl, {
      headers: { Accept: 'image/avif,image/webp,image/*,*/*;q=0.8' },
    });
    const contentType = coverResponse.headers.get('content-type') || '';
    if (!coverResponse.ok || !contentType.startsWith('image/')) {
      return unavailable(res);
    }

    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Type', contentType);
    return res.status(200).send(Buffer.from(await coverResponse.arrayBuffer()));
  } catch {
    return unavailable(res);
  }
}

export default async function handler(req, res) {
  const token = Array.isArray(req.query.token) ? req.query.token[0] : req.query.token;
  if (req.method !== 'GET' || !tokenPattern.test(String(token || ''))) {
    return unavailable(res);
  }

  if (req.query.asset === 'cover') {
    return serveCover(req, res, token);
  }

  try {
    const upstream = await upstreamStoryHtml(token, {
      viewerUserAgent: req.headers['user-agent'],
    });
    const body = await upstream.text();
    const coverUrl = `${requestOrigin(req)}/s/${encodeURIComponent(token)}/cover`;
    const html = body.replace(
      /(<meta\s+property="og:image"\s+content=")[^"]*(")/i,
      `$1${coverUrl}$2`,
    );

    // These make revocation effective at the public domain even if Vercel's
    // defaults change. The response deliberately contains no user identifier.
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(upstream.status).send(html);
  } catch {
    return unavailable(res);
  }
}
