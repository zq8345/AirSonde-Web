/**
 * Verifies every active rule in the SHIPPED _redirects actually reaches where
 * it says, on production.
 *
 * 🔴 Why this exists rather than a rule-count limit: measured on wanew.com
 * (2026-07-26/27, also Cloudflare Pages), processing stopped at roughly the
 * 100th ACTIVE RULE — pos 100 answered 301, pos 103 answered 404 — and
 * deleting comments did not move the boundary. Nothing failed the build; the
 * only symptom was visitors hitting 404, and caching hid it for a while.
 *
 * A budget gate guesses where the ceiling is. This does not care: whatever the
 * real number turns out to be, the first rule that stops working fails here,
 * and the ACTIVE ORDINAL is printed alongside it — so truncation is legible on
 * sight (the failures are the highest ordinals, contiguously).
 *
 *   node scripts/verify-redirects.mjs [origin]
 *
 * ⚠️ Run it AFTER confirming the deploy is live — poll /build.json until its
 * sha matches the commit under test. "Active" is not "live" on this project.
 */
const ORIGIN = process.argv[2] ?? 'https://airsonde.com';
const REDIRECTS = 'dist/_redirects';

const { readFile } = await import('node:fs/promises');

const rules = (await readFile(REDIRECTS, 'utf8'))
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((line, i) => {
    const [from, to, code] = line.split(/\s+/);
    return { ordinal: i + 1, from, to, code };
  });

const bad = [];
const unreachable = [];
let checked = 0;

/**
 * ⚠️ curl, not Node's fetch. Measured while writing this: the first fetch
 * succeeds and every successive one fails with an AggregateError — reproduced
 * with a 200ms gap between requests, with `Connection: close`, and with a
 * single-connection undici dispatcher. curl did 5/5 in the same shell. Node
 * fetch here reports the environment as if the rules were broken, and a
 * checker that cries wolf is a checker people stop reading.
 *
 * ⚠️ Retries too: the first version of this reported three "failures" that
 * were transient. A request that still fails after three tries is reported
 * separately from a rule that answered and answered wrongly — different
 * problems, and only the second one is about redirects.
 */
const { execFile } = await import('node:child_process');
const { promisify } = await import('node:util');
const run = promisify(execFile);

const headOnce = async (url) => {
  const { stdout } = await run('curl', ['-sI', '--max-time', '20', url], { maxBuffer: 1 << 20 });
  const status = Number(stdout.split('\n')[0].split(/\s+/)[1]);
  const location = (stdout.match(/^location:\s*(.+)$/im)?.[1] ?? '').trim();
  if (!status) throw new Error('no status line');
  return { status, location };
};

const fetchWithRetry = async (url) => {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await headOnce(url);
    } catch (error) {
      lastError = error;
      await new Promise((r) => setTimeout(r, attempt * 400));
    }
  }
  throw lastError;
};

for (const rule of rules) {
  // ⚠️ Splat rules need a concrete path to request; `*` matching nothing is
  // the case that is actually in this file (/capabilities/* ).
  const url = `${ORIGIN}${rule.from.replace('*', '')}?cb=${rule.ordinal}-${Date.now()}`;
  let response;
  try {
    response = await fetchWithRetry(url);
  } catch (error) {
    unreachable.push(`#${rule.ordinal} ${rule.from} — request failed 3x: ${error.message}`);
    continue;
  }
  checked += 1;
  const location = response.location.split('?')[0];
  // The first hop must be the rule's own, and land exactly on its target.
  // ⛔ Not "a 301 happened" — a 301 to the wrong place is the failure this is
  // looking for.
  if (String(response.status) !== rule.code || location !== rule.to) {
    bad.push(`#${rule.ordinal} ${rule.from} -> got ${response.status} ${location || '(no Location)'}, expected ${rule.code} ${rule.to}`);
  }
}

console.log(`checked ${checked}/${rules.length} active rule(s) against ${ORIGIN}`);
if (unreachable.length) {
  console.error(`\n✗ ${unreachable.length} rule(s) could not be reached at all (network, not routing):`);
  for (const line of unreachable) console.error(`  - ${line}`);
}
if (bad.length) {
  console.error(`\n✗ ${bad.length} rule(s) did not reach their target:`);
  for (const line of bad) console.error(`  - ${line}`);
  const ordinals = bad.map((b) => Number(b.match(/^#(\d+)/)[1]));
  const lowest = Math.min(...ordinals);
  if (lowest > rules.length - bad.length) {
    console.error(
      `\n⚠ The failures are the highest ordinals (from #${lowest} to #${rules.length}), which is what ` +
        `rule-list truncation looks like. Reduce the active rule count.`,
    );
  }
  process.exit(1);
}
if (unreachable.length) process.exit(1);
console.log('✓ every active redirect reaches its stated target');
