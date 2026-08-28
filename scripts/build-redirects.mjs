/**
 * Generates the product-URL block of dist/_redirects, after `astro build` has
 * copied public/_redirects across and before check-dist.mjs verifies it.
 *
 * Two inputs, both committed, both outside the thing they describe:
 *   · src/data/slug-migration.json — the one-off W29 move, frozen, never grows
 *   · src/data/model-renames.json  — every model rename since, append-only
 *
 * 🔴 Chains are resolved here, so the shipped file never contains one. Rename
 * AK19→AK20→AK21 and the output is /ak19/→/ak21/ and /ak20/→/ak21/, not a
 * hop through /ak20/. The ledger keeps the history; this keeps the shortest
 * path to today's address.
 */
import { readFile, writeFile } from 'node:fs/promises';

const DIST_FILE = 'dist/_redirects';

/**
 * ⚠️ Both forms of every old URL, on purpose. Measured on production
 * 2026-08-28: `_redirects` is matched BEFORE Cloudflare's own trailing-slash
 * normalisation (`/products/geiger-counter` has a bare rule and answers 301
 * directly, while `/products/ak19` has none and answers 308). So with only the
 * slash form, a bare inbound link pays a 308 and then the 301 — two hops.
 *
 * 🔴 Set this to false to halve the rule count, which doubles the rename
 * budget from ~27 to ~54 (see the cap note in public/_redirects).
 *
 * ⚠️ WHEN to flip it, because otherwise this is a switch nobody knows the
 * reason for: the cost of dropping the bare form is one extra hop for inbound
 * links that omit the trailing slash. Today that cost is ~zero — Search
 * Console shows no product page is indexed yet, so there are essentially no
 * external links to the old addresses. Once they ARE indexed that stops being
 * true. So the trade reverses over time: cheap to drop now, expensive later,
 * while the rule budget only ever gets tighter. Flip it when the budget gate
 * starts warning, not before, and re-measure the hop count first — the
 * two-hop conclusion above is deduced from two measurements, not directly
 * observed on a slash-only rule.
 */
const EMIT_BARE_FORM = true;

const migration = JSON.parse(await readFile('src/data/slug-migration.json', 'utf8'));
const renames = JSON.parse(await readFile('src/data/model-renames.json', 'utf8'));

/**
 * rename edges: old address -> new address, carrying their position in the
 * ledger. The ledger is append-only, so the index IS the order in time.
 */
const edge = new Map();
renames.routes.forEach((r, index) => {
  if (edge.has(r.from)) {
    throw new Error(
      `[redirects] model-renames.json has two entries leaving ${r.from} ` +
        `(-> ${edge.get(r.from).to} and -> ${r.to}). An address can only be renamed to one thing.`,
    );
  }
  edge.set(r.from, { to: r.to, index });
});

/**
 * 🔴 Renaming a model BACK to an earlier value is a legitimate thing to do,
 * and it puts a cycle in the ledger: ak19->ak20 and later ak20->ak19. Walking
 * that naively either loops forever or reports an error on a correct history.
 * Neither is right — measured while testing this, which is why the test
 * existed.
 *
 * The ledger alone cannot say which address is live, because the cycle is
 * symmetric. What breaks the tie is time: the LATER rename supersedes the
 * earlier one. So the oldest edge in a cycle is dropped, which leaves ak19
 * with no outgoing edge (it is live again) and ak20 pointing at it.
 */
const superseded = [];
for (;;) {
  let cycle = null;
  for (const start of edge.keys()) {
    const path = [start];
    let at = start;
    while (edge.has(at)) {
      at = edge.get(at).to;
      if (path.includes(at)) {
        cycle = path.slice(path.indexOf(at));
        break;
      }
      path.push(at);
    }
    if (cycle) break;
  }
  if (!cycle) break;
  const oldest = cycle.reduce((a, b) => (edge.get(a).index <= edge.get(b).index ? a : b));
  superseded.push(`${oldest} -> ${edge.get(oldest).to}`);
  edge.delete(oldest);
}

/** Follow the rename chain to where the address lives today. */
const resolve = (start) => {
  let at = start;
  const guard = new Set([start]);
  while (edge.has(at)) {
    at = edge.get(at).to;
    // Cycles were broken above; this only fires if that failed, which would be
    // a bug in this file rather than in the data.
    if (guard.has(at)) throw new Error(`[redirects] unresolved loop at ${at} — cycle breaking failed`);
    guard.add(at);
  }
  return at;
};

const rules = [];
const dropped = [];
for (const { from, to } of [...migration.routes, ...renames.routes]) {
  const target = resolve(to);
  // ⚠️ A model renamed away and then back resolves to itself. Emitting that is
  // an infinite redirect, so it is dropped — and reported, because a silently
  // absent rule is the thing this whole batch exists to prevent.
  if (target === from) {
    dropped.push(from);
    continue;
  }
  rules.push({ from, to: target });
}

const lines = [
  '',
  '# ---------------------------------------------------------------------------',
  '# W29 (2026-08-28): product URLs moved from the record slug to the model.',
  '# Generated from src/data/slug-migration.json, which is the frozen baseline',
  '# the build gate checks this file against. Both forms are listed: without',
  '# them the bare path would take a 308 to the trailing-slash form first and',
  '# only then this 301 — two hops for every inbound link that omits the slash.',
  '# ---------------------------------------------------------------------------',
];
for (const r of rules) {
  if (EMIT_BARE_FORM) lines.push(`${r.from.replace(/\/$/, '')} ${r.to} 301`);
  lines.push(`${r.from} ${r.to} 301`);
}

const existing = await readFile(DIST_FILE, 'utf8');
// ⚠️ The file is CRLF; matching it keeps the byte comparison meaningful.
const eol = existing.includes('\r\n') ? '\r\n' : '\n';
await writeFile(DIST_FILE, existing.replace(/\s*$/, eol) + lines.join(eol) + eol);

const active = (await readFile(DIST_FILE, 'utf8'))
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#')).length;

console.log(
  `  redirects generated: ${rules.length} product rule(s) × ${EMIT_BARE_FORM ? 2 : 1} form(s), ` +
    `${renames.routes.length} rename(s) in the ledger, ${superseded.length} superseded by a later rename, ${dropped.length} self-redirect(s) dropped` +
    `${dropped.length ? `: ${dropped.join(', ')}` : ''} -> ${active} active rule(s) total`,
);
