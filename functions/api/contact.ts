/**
 * W7: /api/contact — the enquiry form's only backend. Pushes straight to
 * Joe's Lark group via a custom-bot webhook (no Web3Forms, per Joe).
 *
 * Env (Cloudflare Pages project settings, never in the repo):
 *   LARK_CONTACT_WEBHOOK     — bot webhook URL (required to deliver)
 *   LARK_CONTACT_SIGN_SECRET — if set, requests are signed (Lark 签名校验)
 *
 * Fail-closed: any missing env / Lark error returns ok:false so the page
 * shows the "email us instead" line — a silently swallowed enquiry is the
 * most expensive possible failure. No KV, no rate limiting: Origin check +
 * honeypot until spam proves more is needed.
 */

interface Env {
  LARK_CONTACT_WEBHOOK?: string;
  LARK_CONTACT_SIGN_SECRET?: string;
}

const ALLOWED_ORIGIN = 'https://airsonde.com';
const MAX = { name: 200, company: 200, email: 254, message: 3000 } as const;

const reply = (status: number, ok: boolean) =>
  new Response(JSON.stringify({ ok }), {
    status,
    headers: { 'content-type': 'application/json' },
  });

/** Lark custom-bot signature: HMAC-SHA256 keyed with `${timestamp}\n${secret}`
 *  over an EMPTY message, base64 — that inversion is Lark's spec, not a bug. */
async function larkSign(secret: string, timestamp: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`${timestamp}\n${secret}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new Uint8Array(0));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

export const onRequest = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;
  if (request.method !== 'POST') return reply(405, false);
  if (request.headers.get('origin') !== ALLOWED_ORIGIN) return reply(403, false);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply(400, false);
  }
  const field = (name: string) => String(form.get(name) ?? '').trim();

  // Honeypot: scripts fill every field. Claim success, deliver nothing.
  if (field('website') !== '') return reply(200, true);

  const name = field('name');
  const company = field('company');
  const email = field('email');
  const message = field('message');

  if (!name || !company || !email || !message) return reply(400, false);
  if (
    name.length > MAX.name ||
    company.length > MAX.company ||
    email.length > MAX.email ||
    message.length > MAX.message
  )
    return reply(400, false);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(400, false);

  const webhook = env.LARK_CONTACT_WEBHOOK;
  if (!webhook) return reply(500, false);

  const body: Record<string, unknown> = {
    msg_type: 'text',
    content: {
      text: [
        'New enquiry — airsonde.com/contact',
        `Name: ${name}`,
        `Company: ${company}`,
        `Email: ${email}`,
        '',
        message,
      ].join('\n'),
    },
  };
  if (env.LARK_CONTACT_SIGN_SECRET) {
    const timestamp = String(Math.floor(Date.now() / 1000));
    body.timestamp = timestamp;
    body.sign = await larkSign(env.LARK_CONTACT_SIGN_SECRET, timestamp);
  }

  let res: Response;
  try {
    res = await fetch(webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return reply(502, false);
  }
  if (!res.ok) return reply(502, false);

  // Lark answers HTTP 200 even for rejections (bad sign = code 19021); only
  // code 0 (or legacy StatusCode 0) is a delivered message.
  const data = (await res.json().catch(() => null)) as {
    code?: number;
    StatusCode?: number;
  } | null;
  const delivered =
    data !== null && (data.code === 0 || (data.code === undefined && data.StatusCode === 0));
  return delivered ? reply(200, true) : reply(502, false);
};
