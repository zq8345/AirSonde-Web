// 官网询盘 → CRM 转发的自检（契约 `../airsonde-crm/docs/官网询盘接入契约-2026-08-12.md` §2/§4）。
//
// 🔴 **真跑 `onRequest` 本身**，⛔ 不读代码断言、⛔ 不发任何真请求：
//    全局 fetch 换成记录器，飞书与 CRM 两跳都被拦下来逐字检查。
//    ⇒ 这套判据能回答的是"它发出去的那一条到底长什么样"，而不是"我以为它会发什么"。
//
// ⚠️ ⛔ 绝不打生产 CRM：下面没有任何一条真实网络请求（fetch 全程是替身）。

const SRC = new URL('../functions/api/', import.meta.url).href;
const { onRequest } = await import(SRC + 'contact.ts');

let pass = 0, fail = 0;
const ck = (n, ok, d = '') => { if (ok) pass++; else fail++; console.log(`${ok ? '✅' : '🔴'} ${n}${d ? '\n     ' + d : ''}`); };

const FIELDS = {
  name: 'Jane Doe', company: 'Acme Ltd', email: 'jane@acme.com',
  phone: '+1 555 0100', inquiry_type: 'OEM / ODM', message: 'Need 500 units.',
};

function makeRequest() {
  const fd = new FormData();
  for (const [k, v] of Object.entries(FIELDS)) fd.set(k, v);
  return new Request('https://airsonde.com/api/contact', {
    method: 'POST', headers: { origin: 'https://airsonde.com' }, body: fd,
  });
}

/** 换掉全局 fetch：飞书按 `larkOk` 回，CRM 按 `crmMode` 回。返回抓到的调用。 */
function install({ larkOk = true, crmMode = 'ok' } = {}) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    const u = String(url);
    calls.push({ url: u, init });
    if (u.includes('crm')) {
      if (crmMode === 'throw') throw new Error('CRM unreachable');
      if (crmMode === 'hang') return new Promise((_, rej) => {
        // 模拟"连上了但不回" —— 由被测代码自己的 AbortSignal.timeout 来救场
        init?.signal?.addEventListener('abort', () => rej(new Error('aborted')));
      });
      if (crmMode === '400') return new Response(JSON.stringify({ ok: false, error: 'missing key' }), { status: 400 });
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }
    // 飞书
    return new Response(JSON.stringify(larkOk ? { code: 0 } : { code: 19021 }), { status: 200 });
  };
  return calls;
}

const ENV = {
  LARK_CONTACT_WEBHOOK: 'https://open.larksuite.example/hook',
  CRM_INBOUND_URL: 'https://crm.airsonde.com/api/inbound',
  CRM_INBOUND_TOKEN: 'test-token-123',
};

// ══════ ① 正对照：一条完整询盘 ⇒ CRM 那跳逐字对契约 ══════
{
  const calls = install();
  const res = await onRequest({ request: makeRequest(), env: { ...ENV } });
  const body = await res.json();
  ck('① 访客收到 ok', res.status === 200 && body.ok === true, JSON.stringify(body));

  const crm = calls.find((c) => c.url.includes('crm'));
  ck('① CRM 那跳真的发出去了', !!crm, `共 ${calls.length} 次调用：${calls.map((c) => c.url).join(' , ')}`);
  ck('① URL 取自 CRM_INBOUND_URL', crm?.url === ENV.CRM_INBOUND_URL, crm?.url);
  ck('① method = POST', crm?.init?.method === 'POST');

  const h = crm?.init?.headers || {};
  ck('① content-type: application/json', h['content-type'] === 'application/json', JSON.stringify(h));
  ck('① 带 x-inbound-token 且值就是 env 里那个', h['x-inbound-token'] === ENV.CRM_INBOUND_TOKEN);
  // 🔴 契约：缺 x-idempotency-key 一律 400（⛔ 不静默降级）。派单没提这条 —— 读契约才有。
  ck('① 🔴 带 x-idempotency-key（契约：缺了必 400）', typeof h['x-idempotency-key'] === 'string' && h['x-idempotency-key'].length > 0, h['x-idempotency-key']);
  ck('① 幂等键符合契约字符集与长度（≤80，[A-Za-z0-9_.:-]）',
    /^[A-Za-z0-9_.:-]{1,80}$/.test(h['x-idempotency-key'] || ''), h['x-idempotency-key']);

  const sent = JSON.parse(crm?.init?.body || '{}');
  ck('① body 字段逐字对上契约 §2',
    sent.company === FIELDS.company && sent.name === FIELDS.name && sent.email === FIELDS.email
    && sent.phone === FIELDS.phone && sent.inquiry_type === FIELDS.inquiry_type
    && sent.message === FIELDS.message && sent.source_form === 'website_contact',
    JSON.stringify(sent));
  // ⚠️ 反向：⛔ 不许多带契约里没有的字段（多带的会被服务端忽略或拒，而且没人会发现）
  ck('① ⛔ 没有多带契约外的字段',
    Object.keys(sent).sort().join(',') === 'company,email,inquiry_type,message,name,phone,source_form',
    Object.keys(sent).sort().join(','));
}

// ══════ ② 🔴 反向判据：CRM 那跳挂掉 ⇒ 访客照样 ok ══════
for (const mode of ['throw', '400', 'hang']) {
  const calls = install({ crmMode: mode });
  const t0 = Date.now();
  // ⚠️ 仪器修正：`AbortSignal.timeout()` 的定时器是 unref 的，**不保持事件循环存活** ——
  //    没有这根续命定时器时 Node 会直接把进程排空，报 "unsettled top-level await"，
  //    看起来像"超时没生效"，其实是**测试架子先退场了**。⛔ 别把它当成被测代码的缺陷。
  const keepAlive = setInterval(() => {}, 250);
  const res = await onRequest({ request: makeRequest(), env: { ...ENV } });
  clearInterval(keepAlive);
  const body = await res.json();
  const ms = Date.now() - t0;
  ck(`② CRM ${mode} ⇒ 访客仍收到 ok（飞书主投递不受影响）`, res.status === 200 && body.ok === true,
    `status=${res.status} body=${JSON.stringify(body)}`);
  if (mode === 'hang') {
    // 🔴 「不影响访客」光靠 try/catch 是不够的：连上了不回会一直挂着 ⇒ 必须有超时
    ck('② 🔴 CRM 连上却不回 ⇒ 被超时救下（≤8s），⛔ 不无限等', ms < 8000, `实测 ${ms}ms`);
  }
}

// ══════ ③ 飞书失败时也要转发（契约 §4：两条通道互不拖累）══════
{
  const calls = install({ larkOk: false });
  const res = await onRequest({ request: makeRequest(), env: { ...ENV } });
  ck('③ 飞书失败 ⇒ 访客收到 502（原有行为一个字没变）', res.status === 502);
  ck('③ 🔴 但 CRM 那跳照样发（飞书拒了的话，CRM 那份是唯一幸存的记录）',
    calls.some((c) => c.url.includes('crm')));
}

// ══════ ④ 没配 / 半配 ══════
{
  const calls = install();
  await onRequest({ request: makeRequest(), env: { LARK_CONTACT_WEBHOOK: ENV.LARK_CONTACT_WEBHOOK } });
  ck('④ 两个变量都没配 ⇒ 不发 CRM，也不报错（还没接线）', !calls.some((c) => c.url.includes('crm')));
}
{
  const calls = install();
  const errs = [];
  const oe = console.error; console.error = (m) => errs.push(String(m));
  await onRequest({ request: makeRequest(), env: { LARK_CONTACT_WEBHOOK: ENV.LARK_CONTACT_WEBHOOK, CRM_INBOUND_TOKEN: 'x' } });
  console.error = oe;
  ck('④ 🔴 只配了 token 没配 URL ⇒ **吼一声**，⛔ 不静默跳过',
    errs.some((m) => /half configured/i.test(m)), JSON.stringify(errs));
  ck('④ 且这种情况下不发 CRM 请求', !calls.some((c) => c.url.includes('crm')));
}

// ══════ ⑤ 蜜罐/校验那些原有闸一个字没动（反向自证：我没改坏别的）══════
{
  const calls = install();
  const fd = new FormData();
  for (const [k, v] of Object.entries(FIELDS)) fd.set(k, v);
  fd.set('website', 'bot');   // 蜜罐
  const res = await onRequest({
    request: new Request('https://airsonde.com/api/contact', { method: 'POST', headers: { origin: 'https://airsonde.com' }, body: fd }),
    env: { ...ENV },
  });
  ck('⑤ 蜜罐命中 ⇒ 假装成功且**一条都不投递**（含 CRM）',
    res.status === 200 && calls.length === 0, `发了 ${calls.length} 次`);
}
{
  const calls = install();
  const res = await onRequest({
    request: new Request('https://airsonde.com/api/contact', { method: 'POST', headers: { origin: 'https://evil.example' }, body: new FormData() }),
    env: { ...ENV },
  });
  ck('⑤ Origin 不对 ⇒ 403 且一条都不投递', res.status === 403 && calls.length === 0);
}

console.log(`\n${pass} 通过 / ${fail} 失败`);
process.exit(fail === 0 ? 0 : 1);
