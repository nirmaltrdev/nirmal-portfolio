/**
 * POST /api/chat: server-side proxy to Google Gemini for the portfolio chatbot.
 *
 * The Gemini API key lives only in the GEMINI_API_KEY environment variable on Vercel
 * (or in a git-ignored .env file for `vercel dev`). The browser never sees it.
 *
 * Request:  { "messages": [{ "role": "user" | "assistant", "text": "..." }, ...] }   (latest last)
 * Response: { "reply": "..." }  or  { "error": "friendly message" } with a 4xx/5xx status.
 *
 * Protection: POST only, Origin allow-list, JSON only, message length limits,
 * and a best-effort in-memory per-IP rate limit (see RATE_LIMITS).
 */

const SYSTEM_PROMPT = require('./_prompt.js');

const MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const MAX_USER_MESSAGE_CHARS = 1000; // the UI itself caps input at 500
const MAX_ASSISTANT_MESSAGE_CHARS = 2000; // older bot replies are trimmed, not rejected
const MAX_HISTORY_MESSAGES = 6; // same window the frontend used before
const GEMINI_TIMEOUT_MS = 9000;

/**
 * In-memory limits per client IP. Each serverless instance keeps its own counters and they
 * reset on a cold start, so this stops casual abuse rather than a determined attacker.
 */
const RATE_LIMITS = [
  { windowMs: 60 * 1000, max: 10 }, // 10 requests per minute
  { windowMs: 24 * 60 * 60 * 1000, max: 100 } // 100 requests per day
];
const hits = new Map(); // ip -> array of request timestamps (ms)

const PRODUCTION_ORIGIN = 'https://nirmaltr.vercel.app';

function allowedOrigins() {
  const list = new Set([PRODUCTION_ORIGIN]);
  // The deployment's own URLs (preview deployments), provided by Vercel at runtime
  for (const v of ['VERCEL_URL', 'VERCEL_BRANCH_URL', 'VERCEL_PROJECT_PRODUCTION_URL']) {
    if (process.env[v]) list.add(`https://${process.env[v]}`);
  }
  return list;
}

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (allowedOrigins().has(origin)) return true;
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/.test(origin);
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.headers['x-real-ip'] || (req.socket && req.socket.remoteAddress) || 'unknown';
}

/** Returns seconds to wait if the IP is over a limit, otherwise records the hit and returns 0. */
function rateLimit(ip, now = Date.now()) {
  const longest = Math.max(...RATE_LIMITS.map(l => l.windowMs));
  const times = (hits.get(ip) || []).filter(t => now - t < longest);
  for (const { windowMs, max } of RATE_LIMITS) {
    const inWindow = times.filter(t => now - t < windowMs);
    if (inWindow.length >= max) {
      const retryMs = windowMs - (now - inWindow[0]);
      hits.set(ip, times);
      return Math.max(1, Math.ceil(retryMs / 1000));
    }
  }
  times.push(now);
  hits.set(ip, times);
  // Keep memory bounded: occasionally drop IPs with no recent activity
  if (hits.size > 5000) {
    for (const [key, list] of hits) {
      if (!list.length || now - list[list.length - 1] > longest) hits.delete(key);
    }
  }
  return 0;
}

function send(res, status, body, extraHeaders = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
}

/** Validates the body and returns { messages } or { error, status }. */
function parseBody(raw) {
  let body = raw;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return { status: 400, error: 'Invalid request.' };
    }
  }
  const list = body && Array.isArray(body.messages) ? body.messages : null;
  if (!list || list.length === 0 || list.length > 20) {
    return { status: 400, error: 'Invalid request.' };
  }

  const messages = [];
  for (const m of list.slice(-MAX_HISTORY_MESSAGES)) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.text !== 'string') {
      return { status: 400, error: 'Invalid request.' };
    }
    const text = m.text.trim();
    if (m.role === 'user' && text.length > MAX_USER_MESSAGE_CHARS) {
      return { status: 413, error: `Message too long. Please keep it under ${MAX_USER_MESSAGE_CHARS} characters.` };
    }
    messages.push({ role: m.role, text: m.role === 'assistant' ? text.slice(0, MAX_ASSISTANT_MESSAGE_CHARS) : text });
  }

  const last = messages[messages.length - 1];
  if (last.role !== 'user' || !last.text) {
    return { status: 400, error: 'Invalid request.' };
  }
  return { messages };
}

/** Same prompt layout the frontend used before the move to the server. */
function buildPrompt(messages) {
  let history = '';
  for (const m of messages) {
    history += `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}\n`;
  }
  return `${SYSTEM_PROMPT}\n\nRecent Conversation History:\n${history}\nAssistant:`;
}

async function callGemini(apiKey, prompt, fetchImpl = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    const response = await fetchImpl(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey // header, not query string, so the key never appears in URLs/logs
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7,
          // No hidden "thinking" tokens: keeps replies fast and stops them using up maxOutputTokens
          thinkingConfig: { thinkingBudget: 0 }
        }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      return { ok: false, status: response.status };
    }
    const data = await response.json();
    const parts = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
    const text = Array.isArray(parts) ? parts.map(p => (p && typeof p.text === 'string' ? p.text : '')).join('').trim() : '';
    return text ? { ok: true, text } : { ok: false, status: 502 };
  } catch (err) {
    return { ok: false, status: err && err.name === 'AbortError' ? 504 : 502 };
  } finally {
    clearTimeout(timer);
  }
}

async function handler(req, res, deps = {}) {
  if (req.method !== 'POST') {
    return send(res, 405, { error: 'Method not allowed.' }, { Allow: 'POST' });
  }

  if (!isAllowedOrigin(req.headers.origin)) {
    return send(res, 403, { error: 'Forbidden.' });
  }

  const contentType = String(req.headers['content-type'] || '');
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return send(res, 415, { error: 'Please send JSON.' });
  }

  const retryAfter = rateLimit(clientIp(req));
  if (retryAfter) {
    return send(res, 429, { error: 'Too many messages. Please wait a moment and try again.' }, { 'Retry-After': String(retryAfter) });
  }

  const parsed = parseBody(req.body);
  if (parsed.error) {
    return send(res, parsed.status, { error: parsed.error });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return send(res, 503, { error: 'The chat assistant is not available right now.' });
  }

  const result = await callGemini(apiKey, buildPrompt(parsed.messages), deps.fetch);
  if (!result.ok) {
    // Log only the status, never the key or the upstream body
    console.error(`[api/chat] Gemini request failed with status ${result.status}`);
    const status = result.status === 429 ? 503 : result.status === 504 ? 504 : 502;
    return send(res, status, { error: 'The chat assistant is not available right now.' });
  }

  return send(res, 200, { reply: result.text });
}

module.exports = handler;
// Exposed for local tests only
module.exports._internal = { buildPrompt, parseBody, rateLimit, isAllowedOrigin, hits, RATE_LIMITS };
