/**
 * MediaFire Player - Cloudflare Worker
 * 
 * Architecture (Bandwidth-Efficient):
 * - The Worker only scrapes the MediaFire page (~5KB per request)
 * - The frontend plays media directly from the MediaFire link (0 Worker bandwidth)
 * - A proxy endpoint is available as a fallback when direct playback fails (CORS)
 * - With this setup, playing a 500MB video uses ~5KB of Worker bandwidth, not 500MB
 */

import { getHTML } from './frontend/html.js';

const NO_INDEX_HEADERS = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
};

const PAGE_HEADERS = {
  'Content-Type': 'text/html;charset=UTF-8',
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  'Content-Language': 'en',
  'X-Robots-Tag': 'index, follow',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://*.mediafire.com; media-src 'self' https://*.mediafire.com; connect-src 'self' https://*.mediafire.com https://cloudflareinsights.com; frame-ancestors 'none';",
};

function getApiHeaders(customHeaders = {}) {
  return {
    'Content-Type': 'application/json;charset=UTF-8',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Cache-Control': 'private, no-store',
    ...NO_INDEX_HEADERS,
    ...customHeaders,
  };
}

function getCloudflareBlockResponse(request) {
  const rayId = request.headers.get('cf-ray') || 'N/A';
  const clientIp = request.headers.get('CF-Connecting-IP') || 'N/A';
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Access denied | yourdomain.com used Cloudflare to restrict access</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f9fafb; color: #1f2937; margin: 0; padding: 2rem; display: flex; align-items: center; justify-content: center; min-height: 80vh; }
    .card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 2rem; max-width: 550px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    h1 { font-size: 1.75rem; color: #ef4444; margin-top: 0; margin-bottom: 0.75rem; }
    p { font-size: 0.95rem; line-height: 1.6; color: #4b5563; margin-bottom: 1.5rem; }
    .details { background: #f3f4f6; border-radius: 8px; padding: 1rem; font-family: monospace; font-size: 0.85rem; color: #374151; }
    .details div { margin-bottom: 0.5rem; }
    .details div:last-child { margin-bottom: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Access Denied (Error 1020)</h1>
    <p>This API resource is protected by Cloudflare security rules. Direct access, embedding, or automated queries from unauthorized origins are restricted.</p>
    <div class="details">
      <div><strong>Security Provider:</strong> Cloudflare WAF</div>
      <div><strong>Client IP:</strong> ${clientIp}</div>
      <div><strong>Ray ID:</strong> ${rayId}</div>
      <div><strong>Status:</strong> Forbidden (403)</div>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 403,
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Cache-Control': 'private, no-store',
    }
  });
}

const SESSION_COOKIE_NAME = 'mfp_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const STREAM_TOKEN_TTL_SECONDS = 60 * 60 * 4;
const SITEMAP_LASTMOD = '2026-06-09';
const textEncoder = new TextEncoder();
const hmacKeyCache = new Map();

function getSiteUrl(origin) {
  return `${origin}/`;
}

function buildRobotsTxt(origin) {
  const siteUrl = getSiteUrl(origin);
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${siteUrl}sitemap.xml`,
  ].join('\n');
}

function buildSitemapXml(origin) {
  const siteUrl = getSiteUrl(origin);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <lastmod>${SITEMAP_LASTMOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
}

// MIME type mapping
const MIME_TYPES = {
  // Video
  mp4: 'video/mp4', webm: 'video/webm', mkv: 'video/x-matroska',
  avi: 'video/x-msvideo', mov: 'video/quicktime', flv: 'video/x-flv',
  wmv: 'video/x-ms-wmv', m4v: 'video/x-m4v', '3gp': 'video/3gpp',
  // Audio
  mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
  flac: 'audio/flac', aac: 'audio/aac', wma: 'audio/x-ms-wma',
  m4a: 'audio/mp4', opus: 'audio/opus',
  // Image
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
  bmp: 'image/bmp', ico: 'image/x-icon',
};

const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv', 'm4v', '3gp'];
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'wma', 'm4a', 'opus'];
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];

function toBase64Url(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function importHmacKey(secret) {
  if (hmacKeyCache.has(secret)) return hmacKeyCache.get(secret);

  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );

  hmacKeyCache.set(secret, key);
  return key;
}

async function signValue(value, secret) {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(value));
  return toBase64Url(signature);
}

async function hashValue(value) {
  const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(value));
  return toBase64Url(digest);
}

async function createSignedToken(payload, secret) {
  const encodedPayload = toBase64Url(textEncoder.encode(JSON.stringify(payload)));
  const signature = await signValue(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

async function readSignedToken(token, secret) {
  if (!token || !secret) return null;

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;

  const expectedSignature = await signValue(encodedPayload, secret);
  if (signature !== expectedSignature) return null;

  try {
    const json = new TextDecoder().decode(fromBase64Url(encodedPayload));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getCookieValue(cookieHeader, name) {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [rawName, ...rawValue] = cookie.trim().split('=');
    if (rawName === name) {
      return rawValue.join('=');
    }
  }

  return null;
}

function createSessionId() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return toBase64Url(bytes);
}

function buildSessionCookie(token, ttlSeconds, isSecure = true) {
  const cookieParts = [
    `${SESSION_COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${ttlSeconds}`,
  ];

  if (isSecure) {
    cookieParts.push('Secure');
  }

  return cookieParts.join('; ');
}

function getSecuritySecret(env) {
  return env.STREAM_TOKEN_SECRET || env.SECRET_KEY || null;
}

async function getOrCreateSession(request, env) {
  const secret = getSecuritySecret(env);
  if (!secret) {
    throw new Error('STREAM_TOKEN_SECRET is not configured');
  }

  const existingToken = getCookieValue(request.headers.get('Cookie'), SESSION_COOKIE_NAME);
  const existingSession = await readSignedToken(existingToken, secret);
  const now = Math.floor(Date.now() / 1000);

  if (existingSession?.sid && existingSession?.exp > now) {
    return { sid: existingSession.sid, setCookie: null };
  }

  const sid = createSessionId();
  const exp = now + SESSION_TTL_SECONDS;
  const token = await createSignedToken({ sid, exp }, secret);

  const isSecure = new URL(request.url).protocol === 'https:';

  return {
    sid,
    setCookie: buildSessionCookie(token, SESSION_TTL_SECONDS, isSecure),
  };
}

async function validateSession(request, env) {
  const secret = getSecuritySecret(env);
  if (!secret) return null;

  const token = getCookieValue(request.headers.get('Cookie'), SESSION_COOKIE_NAME);
  const session = await readSignedToken(token, secret);
  const now = Math.floor(Date.now() / 1000);

  if (!session?.sid || session.exp <= now) {
    return null;
  }

  return session;
}

function getAllowedOrigin(requestUrl) {
  return `${requestUrl.protocol}//${requestUrl.host}`;
}

function isSameOriginRequest(request, allowedOrigin) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== allowedOrigin) return false;

  const referer = request.headers.get('Referer');
  if (referer && referer !== allowedOrigin && !referer.startsWith(`${allowedOrigin}/`)) return false;

  return true;
}

function isTrustedBrowserRequest(request, allowedSites) {
  const site = request.headers.get('Sec-Fetch-Site');
  if (!site) return true; // Fallback for browsers that do not support or send Sec-Fetch-Site
  return allowedSites.includes(site);
}

function isValidMediaFireUrl(value) {
  if (!value) return false;

  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;

    const host = parsed.hostname.toLowerCase();
    return host === 'mediafire.com' || host.endsWith('.mediafire.com');
  } catch {
    return false;
  }
}

async function buildProtectedProxyUrl(requestUrl, directLink, sessionId, env) {
  const secret = getSecuritySecret(env);
  if (!secret) {
    throw new Error('STREAM_TOKEN_SECRET is not configured');
  }

  const exp = Math.floor(Date.now() / 1000) + STREAM_TOKEN_TTL_SECONDS;
  const urlHash = await hashValue(directLink);
  const token = await createSignedToken({ sid: sessionId, exp, urlHash }, secret);

  return `${requestUrl.origin}/api/stream?url=${encodeURIComponent(directLink)}&token=${encodeURIComponent(token)}`;
}

/**
 * Determine media type from file extension
 */
function getMediaType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (VIDEO_EXTENSIONS.includes(ext)) return 'video';
  if (AUDIO_EXTENSIONS.includes(ext)) return 'audio';
  if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
  return 'unknown';
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return null;

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const decimals = unitIndex === 0 ? 0 : size >= 100 ? 0 : size >= 10 ? 1 : 2;
  return `${size.toFixed(decimals)} ${units[unitIndex]}`;
}

function normalizeFileSize(value) {
  if (!value) return null;

  const normalized = value
    .trim()
    .replace(/,/g, '.')
    .replace(/\s+/g, ' ')
    .replace(/^(\d+(?:\.\d+)?)\s*([KMGT]?B)$/i, '$1 $2');

  return normalized || null;
}

function extractTotalBytes(headers) {
  const contentRange = headers.get('content-range');
  if (contentRange) {
    const match = contentRange.match(/\/(\d+)$/);
    if (match) return Number.parseInt(match[1], 10);
  }

  const contentLength = headers.get('content-length');
  if (contentLength) {
    const parsed = Number.parseInt(contentLength, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  return null;
}

async function fetchFileSizeFromDirectLink(directLink) {
  const baseHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Referer': 'https://www.mediafire.com/',
  };

  const attempts = [
    { method: 'HEAD', headers: baseHeaders },
    { method: 'GET', headers: { ...baseHeaders, Range: 'bytes=0-0' } },
  ];

  for (const attempt of attempts) {
    try {
      const response = await fetch(directLink, {
        method: attempt.method,
        headers: attempt.headers,
        redirect: 'follow',
      });

      if (!response.ok && response.status !== 206) {
        continue;
      }

      const totalBytes = extractTotalBytes(response.headers);
      const formatted = formatBytes(totalBytes);
      if (formatted) return formatted;
    } catch {
      // Ignore fallback errors and keep trying other strategies.
    }
  }

  return null;
}

function extractMediaFireKey(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
    const pathParts = parsed.pathname.split('/').filter(Boolean);

    // Check if it's the ?key format
    const search = parsed.search.replace(/^\?/, '');
    if (search && search.match(/^[a-zA-Z0-9]+$/) && search.length >= 7) {
      return search;
    }

    // Check path parts
    const fileIndex = pathParts.indexOf('file');
    if (fileIndex !== -1 && pathParts[fileIndex + 1]) {
      return pathParts[fileIndex + 1];
    }

    const downloadIndex = pathParts.indexOf('download');
    if (downloadIndex !== -1 && pathParts[downloadIndex + 1]) {
      return pathParts[downloadIndex + 1];
    }

    // Fallback: search for any 7-20 character alphanumeric key in the path
    for (const part of pathParts) {
      if (part.match(/^[a-zA-Z0-9]{7,20}$/)) {
        return part;
      }
    }
  } catch {
    const match = url.match(/([a-zA-Z0-9]{7,20})/);
    if (match) return match[1];
  }

  return null;
}

/**
 * Scrape MediaFire page to extract direct download link and file info
 */
async function scrapeMediaFire(url) {
  // Normalize URL
  let normalizedUrl = url;
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  // Validate URL
  if (!isValidMediaFireUrl(normalizedUrl)) {
    throw new Error('URL is not a valid MediaFire link');
  }

  const key = extractMediaFireKey(normalizedUrl);
  if (!key) {
    throw new Error('Could not extract file key from MediaFire link');
  }

  // 1. Fetch metadata from official API (never blocked, returns 200)
  let fileName = 'unknown';
  let fileSize = 'Unknown';
  let mimeType = 'application/octet-stream';
  let mediaType = 'unknown';
  let ext = 'unknown';

  try {
    const apiRes = await fetch(`https://www.mediafire.com/api/1.4/file/get_info.php?quick_key=${key}&response_format=json`);
    if (apiRes.ok) {
      const apiData = await apiRes.json();
      const fileInfo = apiData?.response?.file_info;
      if (fileInfo) {
        fileName = fileInfo.filename || fileName;
        const sizeBytes = Number.parseInt(fileInfo.size, 10);
        fileSize = formatBytes(sizeBytes) || fileInfo.size || fileSize;
        mimeType = fileInfo.mimetype || mimeType;
        mediaType = fileInfo.filetype || mediaType;
        ext = fileName.split('.').pop().toLowerCase();
      }
    }
  } catch (apiErr) {
    console.error('API metadata fetch error:', apiErr);
  }

  // 2. Fetch direct download link from the unblocked /download/ page
  const downloadPageUrl = `https://www.mediafire.com/download/${key}`;
  const response = await fetch(downloadPageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': 'https://www.mediafire.com/',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Failed to retrieve data from MediaFire: ${response.status}`);
  }

  const html = await response.text();

  // Try to extract the direct download link
  let directLink = null;
  const downloadPatterns = [
    /href="(https?:\/\/download\d*\.mediafire\.com\/[^"]+)"/i,
    /href='(https?:\/\/download\d*\.mediafire\.com\/[^']+)'/i,
    /"(https?:\/\/download\d*\.mediafire\.com\/[^"]+)"/i,
  ];

  for (const pattern of downloadPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      directLink = match[1];
      break;
    }
  }

  if (!directLink) {
    throw new Error('Direct download link not found. The file may have been deleted, set to private, or MediaFire has changed its download page layout.');
  }

  // If filename/size wasn't retrieved by the API, extract from HTML or URL
  if (fileName === 'unknown') {
    const urlPath = new URL(directLink).pathname;
    fileName = decodeURIComponent(urlPath.split('/').pop()) || 'unknown';
  }
  if (ext === 'unknown') {
    ext = fileName.split('.').pop().toLowerCase();
  }
  if (mediaType === 'unknown') {
    mediaType = getMediaType(fileName);
  }
  if (mimeType === 'application/octet-stream') {
    mimeType = MIME_TYPES[ext] || 'application/octet-stream';
  }

  return {
    directLink,
    fileName: fileName || 'unknown',
    fileSize: fileSize || 'Unknown',
    mediaType,
    mimeType,
    extension: ext,
  };
}

/**
 * Proxy the media file with proper streaming support (Range requests)
 */
async function proxyMedia(directLink, request) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Referer': 'https://www.mediafire.com/',
  };

  // Forward Range header for streaming support
  const rangeHeader = request.headers.get('Range');
  if (rangeHeader) {
    headers['Range'] = rangeHeader;
  }

  const response = await fetch(directLink, {
    headers,
    redirect: 'follow',
  });

  // Build response headers
  const responseHeaders = new Headers();

  // Pass through important headers
  const passHeaders = [
    'content-length', 'content-range',
    'accept-ranges', 'last-modified', 'etag',
  ];

  for (const h of passHeaders) {
    const val = response.headers.get(h);
    if (val) responseHeaders.set(h, val);
  }

  let contentType = response.headers.get('content-type');
  if (!contentType || contentType === 'application/octet-stream') {
    const ext = new URL(directLink).pathname.split('.').pop().toLowerCase();
    contentType = MIME_TYPES[ext] || 'video/mp4';
  }
  responseHeaders.set('content-type', contentType);

  // Ensure accept-ranges is set
  responseHeaders.set('Accept-Ranges', 'bytes');

  // CORS headers
  responseHeaders.set('X-Robots-Tag', 'noindex, nofollow, noarchive');

  // Private response because access is tied to a short-lived token + session.
  responseHeaders.set('Cache-Control', 'private, no-store');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const allowedOrigin = getAllowedOrigin(url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: getApiHeaders() });
    }

    try {


      // API: Scrape MediaFire link
      if (url.pathname === '/api/get') {
        const mediaFireUrl = url.searchParams.get('url');
        if (!mediaFireUrl) {
          return Response.json(
            { error: 'The "url" parameter is required' },
            { status: 400, headers: getApiHeaders() }
          );
        }

        if (
          !isTrustedBrowserRequest(request, ['same-origin', 'none']) ||
          !isSameOriginRequest(request, allowedOrigin)
        ) {
          return getCloudflareBlockResponse(request);
        }

        const session = await getOrCreateSession(request, env);
        const result = await scrapeMediaFire(mediaFireUrl);
        const proxyUrl = await buildProtectedProxyUrl(url, result.directLink, session.sid, env);
        
        const customHeaders = {};
        if (session.setCookie) {
          customHeaders['Set-Cookie'] = session.setCookie;
        }

        return Response.json({
          success: true,
          data: {
            ...result,
            streamUrl: result.directLink,     // Primary: direct playback from MediaFire
            proxyUrl,                         // Fallback: exposed, but still gated by token + session
          },
        }, {
          headers: getApiHeaders(customHeaders),
        });
      }

      if (url.pathname === '/api/fallback') {
        if (
          !isTrustedBrowserRequest(request, ['same-origin', 'none']) ||
          !isSameOriginRequest(request, allowedOrigin)
        ) {
          return getCloudflareBlockResponse(request);
        }

        const session = await validateSession(request, env);
        if (!session) {
          return Response.json(
            { error: 'Fallback session is invalid or has expired' },
            { status: 403, headers: getApiHeaders() }
          );
        }

        const directLink = url.searchParams.get('url');
        if (!directLink) {
          return Response.json(
            { error: 'The "url" parameter is required' },
            { status: 400, headers: getApiHeaders() }
          );
        }

        if (!isValidMediaFireUrl(directLink)) {
          return Response.json(
            { error: 'Fallback URL is invalid' },
            { status: 403, headers: getApiHeaders() }
          );
        }

        const proxyUrl = await buildProtectedProxyUrl(url, directLink, session.sid, env);

        return Response.json({
          success: true,
          data: {
            proxyUrl,
            expiresIn: STREAM_TOKEN_TTL_SECONDS,
          },
        }, {
          headers: getApiHeaders(),
        });
      }

      // API: Stream/proxy media file
      if (url.pathname === '/api/stream') {
        const streamUrl = url.searchParams.get('url');
        const token = url.searchParams.get('token');
        if (!streamUrl) {
          return Response.json(
            { error: 'The "url" parameter is required' },
            { status: 400, headers: getApiHeaders() }
          );
        }

        if (!token) {
          return Response.json(
            { error: 'A stream token is required' },
            { status: 403, headers: getApiHeaders() }
          );
        }

        if (
          !isTrustedBrowserRequest(request, ['same-origin', 'none']) ||
          !isSameOriginRequest(request, allowedOrigin)
        ) {
          return getCloudflareBlockResponse(request);
        }

        // Only allow MediaFire download URLs
        if (!isValidMediaFireUrl(streamUrl)) {
          return Response.json(
            { error: 'Stream URL is invalid' },
            { status: 403, headers: getApiHeaders() }
          );
        }

        const signedToken = await readSignedToken(token, getSecuritySecret(env));
        if (!signedToken) {
          return Response.json(
            { error: 'Stream token is invalid' },
            { status: 403, headers: getApiHeaders() }
          );
        }

        const now = Math.floor(Date.now() / 1000);
        if (signedToken.exp <= now) {
          return Response.json(
            { error: 'Stream token has expired' },
            { status: 403, headers: getApiHeaders() }
          );
        }

        const expectedUrlHash = await hashValue(streamUrl);
        if (signedToken.urlHash !== expectedUrlHash) {
          return Response.json(
            { error: 'Stream token URL mismatch' },
            { status: 403, headers: getApiHeaders() }
          );
        }

        return await proxyMedia(streamUrl, request);
      }

      if (url.pathname === '/robots.txt') {
        return new Response(buildRobotsTxt(url.origin), {
          headers: {
            'Content-Type': 'text/plain;charset=UTF-8',
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          },
        });
      }

      if (url.pathname === '/sitemap.xml') {
        return new Response(buildSitemapXml(url.origin), {
          headers: {
            'Content-Type': 'application/xml;charset=UTF-8',
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          },
        });
      }

      // Serve frontend
      if (url.pathname === '/' || url.pathname === '') {
        return new Response(getHTML({ origin: url.origin }), {
          headers: PAGE_HEADERS,
        });
      }

      // 404
      return new Response('Not Found', {
        status: 404,
        headers: getApiHeaders(),
      });

    } catch (err) {
      console.error('API Error:', err);
      const isClientSafe = err.message && (
        err.message.includes('not a valid MediaFire link') || 
        err.message.includes('Not found') ||
        err.message.includes('Failed to retrieve data')
      );
      
      return Response.json(
        { error: isClientSafe ? err.message : 'An internal server error occurred' },
        {
          status: 500,
          headers: getApiHeaders(),
        }
      );
    }
  },
};
