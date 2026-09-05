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
  /** CRM inbound endpoint, e.g. https://crm.airsonde.com/api/inbound (Pages secret). */
  CRM_INBOUND_URL?: string;
  /** Shared secret for the CRM inbound endpoint (Pages secret, never in the repo). */
  CRM_INBOUND_TOKEN?: string;
}

const ALLOWED_ORIGIN = 'https://airsonde.com';
const MAX = { name: 200, company: 200, email: 254, phone: 50, message: 3000 } as const;
/** must match CONTACT_FORM.inquiryOptions in src/data/site.ts */
const INQUIRY_TYPES = ['OEM / ODM', 'White-label', 'General'];

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

/**
 * Forward the enquiry to the CRM (contract §2/§4, `docs/官网询盘接入契约-2026-08-12.md`).
 *
 * Lark is the PRIMARY delivery; the CRM is a copy. This hop must never change what
 * the visitor sees — an enquiry that reached Lark has not been lost, and telling the
 * visitor "failed" because a secondary system is down would make them give up.
 *
 * Deliberate choices, each one load-bearing:
 *  - Runs regardless of whether Lark succeeded. The contract's §4 is explicit
 *    ("推 Lark 成功与否都转发；两条通道互不拖累"): if Lark rejected the message,
 *    the CRM copy is the only surviving record, so skipping it loses the lead twice.
 *  - `x-idempotency-key` is REQUIRED by the contract — missing it is a hard 400,
 *    not a silent degrade. A per-request UUID is what §4 specifies (there is no
 *    retry logic here yet; if one is ever added the key must be minted OUTSIDE it).
 *  - A timeout, because "must not affect the visitor" is not satisfied by try/catch
 *    alone: a CRM that accepts the connection and never answers would stall the
 *    response indefinitely. 5s is far above a healthy round trip.
 *  - Half-configured is LOUD. `if (url && token)` alone would skip silently, and a
 *    silent skip looks exactly like a working integration that no one is using.
 */
async function forwardToCrm(
  env: Env,
  payload: Record<string, unknown>,
): Promise<void> {
  const url = env.CRM_INBOUND_URL;
  const token = env.CRM_INBOUND_TOKEN;
  if (!url && !token) return; // not wired up at all — nothing to say
  if (!url || !token) {
    console.error(
      `contact: CRM forward skipped — half configured (url=${url ? 'set' : 'MISSING'}, token=${token ? 'set' : 'MISSING'})`,
    );
    return;
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-inbound-token': token,
        'x-idempotency-key': crypto.randomUUID(),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    // The CRM answers 400/401/503/429 with a body; log enough to act on, never throw.
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error(`contact: CRM forward failed ${res.status} ${detail.slice(0, 200)}`);
    }
  } catch (e) {
    console.error(`contact: CRM forward threw — ${String(e).slice(0, 200)}`);
  }
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
  const phone = field('phone'); // W10-B: optional
  const inquiryType = field('inquiry_type'); // W10-B: optional, allowlisted

  if (!name || !company || !email || !message) return reply(400, false);
  if (
    name.length > MAX.name ||
    company.length > MAX.company ||
    email.length > MAX.email ||
    phone.length > MAX.phone ||
    message.length > MAX.message
  )
    return reply(400, false);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(400, false);
  if (inquiryType !== '' && !INQUIRY_TYPES.includes(inquiryType)) return reply(400, false);

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
        ...(phone ? [`Phone: ${phone}`] : []),
        ...(inquiryType ? [`Inquiry type: ${inquiryType}`] : []),
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

  // CRM copy (contract §4). Field names go through verbatim — the contract says the
  // form's own names are the wire names, so there is no mapping layer to drift.
  await forwardToCrm(env, {
    company,
    name,
    email,
    phone,
    inquiry_type: inquiryType,
    message,
    source_form: 'website_contact',
  });

  return delivered ? reply(200, true) : reply(502, false);
};
