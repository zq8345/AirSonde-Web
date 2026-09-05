/**
 * Build gate. Runs after `astro build` and fails the build — locally and on
 * Cloudflare Pages — if anything that must never ship has shipped.
 *
 * Contract C1 hard rule 1: supplierRef and draft products must not appear in
 * the build output. Grepping dist/ is the only check that cannot be fooled by
 * the source looking right.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const run = promisify(execFile);

const DIST = 'dist';
const CONTENT = 'src/content/products';

// ⚠️ 口径: these are NARROW claim-word checks (exact substrings). A stem-wide
// sweep (e.g. /certif/i) will hit legitimate topical mentions in guides copy —
// wide-scan hits need human qualification, they are not automatically failures.
const BANNED_SUBSTRINGS = ['alibaba.com', 'alicdn.com', 'supplierRef'];

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const files = await walk(DIST);
const textFiles = files.filter((f) => /\.(html|css|js|json|xml|txt|svg|map)$/i.test(f));

const failures = [];

// 1. supplier fingerprints must not appear anywhere in dist
for (const file of textFiles) {
  const body = await readFile(file, 'utf8');
  for (const needle of BANNED_SUBSTRINGS) {
    if (body.includes(needle)) failures.push(`${file}: contains "${needle}"`);
  }
}

// 2. every draft slug must be absent from dist entirely — filenames included
const draftSlugs = [];
for (const name of await readdir(CONTENT)) {
  if (!name.endsWith('.json')) continue;
  const record = JSON.parse(await readFile(path.join(CONTENT, name), 'utf8'));
  if (record.status === 'draft') draftSlugs.push(record.slug);
}

// 🔴 **整词匹配，不是裸子串**（2026-09-04 真栽过，整站因此停止部署）：
//    `hcho-desktop-monitor` 今天被翻成 draft，而它是 **published** 产品
//    `co2-tvoc-hcho-desktop-monitor` 的**子串** ⇒ 那个在线产品的 37 张图 + 2 个 guides 页
//    全部被判成"草稿泄漏"，构建退出码 1，官网从此不再部署。
//    ⚠️ 命中的 40 条**没有一条是真泄漏** —— 一个只认得字面量的判据，认得几种错法就只能查出几种，
//       而它顺带把正确的东西也一起判错了。
//    ⇒ slug 由 `[a-z0-9-]` 组成 ⇒ 前后不能再是这类字符。`co2-tvoc-` 末尾那个 `-` 落在排除类里。
// ⛔ 修的是**匹配方式**，不是把闸放宽：⛔ 没有跳过整类文件，⛔ 没有降级成 warning。
const slugRe = (slug) =>
  new RegExp(`(^|[^a-z0-9-])${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9-]|$)`);

// 🔴 诊断文件要跳过，而且这是**另一条独立的病**：`build-diagnostics.json` 的**职责**
//    就是点名被跳过的草稿（`skips[].slug`、`danglingRedirects`）—— 闸在扫自己的体检报告。
//    ⚠️ 单做这一条**不够**：实测 46 → 45，只掉一条。两条都要，缺一条构建仍然红。
const isDiagnostics = (f) => path.basename(f) === 'build-diagnostics.json';

for (const slug of draftSlugs) {
  const re = slugRe(slug);
  for (const file of files) {
    if (isDiagnostics(file)) continue;
    // ⚠️ 用相对路径匹配：绝对路径里可能含开发机目录名，那不是产物的一部分。
    const rel = path.relative(DIST, file).split(path.sep).join('/');
    if (re.test(rel)) failures.push(`${file}: filename contains draft slug "${slug}"`);
  }
  for (const file of textFiles) {
    if (isDiagnostics(file)) continue;
    const body = await readFile(file, 'utf8');
    if (re.test(body)) failures.push(`${file}: body contains draft slug "${slug}"`);
  }
}

// 2b. positioning words must stay on the crawlable homepage (W6③ baseline:
//     counts may fall with copy edits, but never to zero — the words are the
//     positioning itself, W1 §定位文案).
{
  const home = await readFile('dist/index.html', 'utf8');
  for (const word of ['OEM', 'ODM', 'white-label', 'IAQ']) {
    const count = home.split(word).length - 1;
    if (count === 0) failures.push(`dist/index.html: positioning word "${word}" count is 0`);
  }
}

// 2c. certification names are allowed in exactly two places (总工 2026-09-05, lifting the
//     2026-08-12 red line with a boundary): the About page's compliance cards, and a
//     product page's spec rows — the <dl class="as-spec"> plus the same row's machine form,
//     the JSON-LD "Certification" PropertyValue. Anywhere else, CE / FCC / RoHS / UN38.3
//     is a claim without a document behind it and fails the build.
//     Whole-word match (\bCE\b will not fire inside "SINCE"); tags stripped so class names
//     and URLs do not count; build-diagnostics.json is not HTML and is not scanned.
{
  const CERT_RE = /\b(CE|FCC|RoHS|ROHS|UN38\.3)\b/g;
  for (const file of files.filter((f) => f.endsWith('.html'))) {
    const rel = path.relative(DIST, file).split(path.sep).join('/');
    let body = await readFile(file, 'utf8');
    if (rel === 'about/index.html') {
      body = body.replace(/<div class="certs">[\s\S]*?<div class="audit">/, '<div class="audit">');
    }
    if (/^products\/[^/]+\/index\.html$/.test(rel)) {
      // product-detail-v1 (2026-09-05): the spec table is <div class="glance"> … <table> … </table></div>
      body = body.replace(/<div class="glance">[\s\S]*?<\/table>\s*<\/div>/g, '');
      body = body.replace(/\{"@type":"PropertyValue","name":"Certification","value":"[^"]*"\}/g, '');
    }
    const text = body.replace(/<[^>]+>/g, ' ');
    const hits = [...text.matchAll(CERT_RE)].map((m) => m[1]);
    if (hits.length > 0) {
      failures.push(`${file}: certification name(s) outside the allowed places: ${[...new Set(hits)].join(', ')} (${hits.length})`);
    }
  }
}

// 3. every page needs a unique title and description, and the sitemap must
//    list exactly the indexable pages — no more, no fewer.
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const titles = new Map();
const descriptions = new Map();
let indexable = 0;

for (const file of htmlFiles) {
  const body = await readFile(file, 'utf8');
  const title = body.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim();
  const description = body
    .match(/<meta name="description" content="([\s\S]*?)"/)?.[1]
    ?.trim();

  if (!title) failures.push(`${file}: no <title>`);
  if (!description) failures.push(`${file}: no meta description`);

  if (title) {
    if (titles.has(title)) failures.push(`${file}: <title> duplicates ${titles.get(title)}`);
    else titles.set(title, file);
  }
  if (description) {
    if (descriptions.has(description))
      failures.push(`${file}: description duplicates ${descriptions.get(description)}`);
    else descriptions.set(description, file);
  }

  if (!/<meta name="robots" content="noindex/.test(body)) indexable += 1;
}

const sitemapFiles = files.filter((f) => /sitemap-\d+\.xml$/.test(f));
if (sitemapFiles.length === 0) {
  failures.push('no sitemap-N.xml emitted');
} else {
  let urls = 0;
  for (const file of sitemapFiles) {
    urls += (await readFile(file, 'utf8')).match(/<loc>/g)?.length ?? 0;
  }
  if (urls !== indexable) {
    failures.push(`sitemap lists ${urls} URL(s) but ${indexable} page(s) are indexable`);
  }
  console.log(`  sitemap: ${urls} URL(s) == ${indexable} indexable page(s)`);
}

/**
 * A .png dropped in with no .webp beside it, in a directory where .png is
 * gitignored — src/assets/photos/ and design/.
 *
 * ⚠️ This exists because .gitignore hides src/assets/photos/*.png and
 * design/*.png. Ignoring them stops multi-MB files entering the repo for no
 * shipped byte, but it also means a png-only drop would be committed by nobody
 * and noticed by nobody — the person who added it would just see the site
 * unchanged and wonder. That silence is the thing the ignore would otherwise
 * buy at too high a price.
 *
 * 🔴 The predicate is "git does not track it AND no .webp beside it", NOT
 * "no .webp beside it". design/ holds 10 tracked logo/favicon .png files that
 * legitimately have no .webp; the naive rule warns about all ten, every build,
 * and its own message ("they are gitignored") would be false about them. A
 * warning that is wrong ten times out of ten is a warning nobody reads.
 * Tracked-ness is asked of `git ls-files`, not inferred from the path.
 *
 * ⚠️ It can only fire where the .png actually is, which is a working copy.
 * CI never sees an ignored file, so this is a local net, not a CI one — say so
 * rather than let someone assume the build is watching for them.
 *
 * ⛔ Warns, never fails: an unused source file is not a reason to stop a
 * deployment.
 */
{
  const PNG_DIRS = ['src/assets/photos', 'design'];

  let tracked = new Set();
  try {
    const { stdout } = await run('git', ['ls-files', '-z'], { maxBuffer: 1 << 24 });
    tracked = new Set(stdout.split('\0').filter(Boolean));
  } catch {
    // Not a working copy (a CI tarball, a vendored export). With no index to
    // ask, every .png reads as untracked; say so instead of warning falsely.
    console.log('  png/webp: skipped (no git index here — this net is local only)');
    tracked = null;
  }

  if (tracked) {
    for (const dir of PNG_DIRS) {
      let entries = [];
      try {
        entries = await readdir(dir);
      } catch {
        continue;
      }
      const pngs = entries.filter((name) => /\.png$/i.test(name));
      const orphans = pngs
        .filter((name) => !entries.includes(name.replace(/\.png$/i, '.webp')))
        .filter((name) => !tracked.has(`${dir}/${name}`));
      if (orphans.length > 0) {
        console.warn(
          `  ⚠ ${orphans.length} file(s) in ${dir}/ are an untracked .png with no .webp beside them, so nothing can import them and git cannot see them: ${orphans.join(', ')}`,
        );
      }
      const trackedPngs = pngs.filter((name) => tracked.has(`${dir}/${name}`)).length;
      console.log(
        `  png/webp ${dir}/: ${pngs.length} png (${trackedPngs} tracked, ${pngs.length - trackedPngs} ignored), ${orphans.length} untracked without a webp`,
      );
    }
  }
}

/**
 * Internal links must carry the trailing slash.
 *
 * ⚠️ Measured 2026-08-28: 426 of them did not, and the host answered each with
 * a 308 to the slash form — a redirect on every nav click on every page. They
 * live in templates, so one authoring slip puts hundreds back.
 *
 * 🔴 The TOTAL is asserted before the bare count, and both are printed. A
 * change that deleted the navigation would also drive "bare = 0", and only the
 * total would show it.
 *
 * ⛔ Exempt, and each for a reason rather than by pattern-matching convenience:
 * external URLs (not ours to normalise), mailto:/tel: (not paths), "#id"
 * (same page), "/" (already canonical), and anything ending in a file
 * extension (a file, not a directory route — /favicon.svg must not become
 * /favicon.svg/).
 */
const linkTotals = { total: 0, sitePaths: 0, withSlash: 0, bare: [] };
for (const file of htmlFiles) {
  const body = await readFile(file, 'utf8');
  for (const match of body.matchAll(/href="([^"]*)"/g)) {
    const href = match[1];
    linkTotals.total += 1;
    if (
      /^(https?:\/\/|mailto:|tel:|#)/i.test(href) ||
      href === '/' ||
      !href.startsWith('/') ||
      /\.[a-z0-9]{2,5}(\?|$)/i.test(href)
    ) {
      continue;
    }
    linkTotals.sitePaths += 1;
    if (href.endsWith('/')) linkTotals.withSlash += 1;
    else linkTotals.bare.push(`${file}: ${href}`);
  }
}
if (linkTotals.bare.length) {
  const distinct = [...new Set(linkTotals.bare.map((b) => b.split(': ')[1]))];
  failures.push(
    `${linkTotals.bare.length} internal link(s) miss the trailing slash and would each cost a 308: ${distinct.slice(0, 6).join(', ')}${distinct.length > 6 ? ' …' : ''}`,
  );
}
console.log(
  `  links: ${linkTotals.total} href(s) total, ${linkTotals.sitePaths} site path(s) — ` +
    `${linkTotals.withSlash} with trailing slash, ${linkTotals.bare.length} bare`,
);

/**
 * W29 gate — every URL that was live before the slug→model move must still
 * have a redirect rule.
 *
 * 🔴 The baseline is src/data/slug-migration.json, which is COMMITTED, and is
 * deliberately not rebuilt here from src/content/products/. A gate that
 * regenerates its own baseline from the thing it measures cannot fail: delete
 * a record and the record leaves the criterion with it. The baseline has to
 * sit outside the thing being measured.
 *
 * Missing rule => failure (that is a developer slip, and it is the only
 * warning anyone gets — the site has no 404 telemetry, so a missed redirect
 * would otherwise surface as visitors hitting a hard 404).
 * Target page gone => warning, not failure. That happens when a model is
 * renamed from the admin, and an admin edit must never stop the site building.
 */
const migration = JSON.parse(await readFile('src/data/slug-migration.json', 'utf8'));
const renames = JSON.parse(await readFile('src/data/model-renames.json', 'utf8'));
// ⚠️ Reads the SHIPPED file, not public/_redirects: the product block is
// generated during the build, so the source no longer contains it. The thing
// worth asserting on is the artefact that actually gets served.
const redirectsText = await readFile(`${DIST}/_redirects`, 'utf8');
const redirectRules = redirectsText
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const [from, to, code] = l.split(/\s+/);
    return { from, to, code };
  });
const ruleFor = new Map(redirectRules.map((r) => [r.from, r]));

/**
 * W30-A budget gate. ⚠️ Counts ACTIVE RULE ORDINALS, not file lines: the
 * measured truncation on wanew.com cut at roughly the 100th active rule, and
 * deleting comments did not move it. See the note at the top of
 * public/_redirects for both the documented quota and the measured behaviour.
 */
const RULE_BUDGET_WARN = 85;
const RULE_BUDGET_FAIL = 100;
if (redirectRules.length >= RULE_BUDGET_FAIL) {
  failures.push(
    `${redirectRules.length} active redirect rules — at or past the measured truncation point (~${RULE_BUDGET_FAIL}). ` +
      `Rules beyond it are silently ignored and 404. Halve the count by dropping the bare form ` +
      `(EMIT_BARE_FORM in scripts/build-redirects.mjs), or move older ones to Bulk Redirects.`,
  );
} else if (redirectRules.length >= RULE_BUDGET_WARN) {
  console.warn(
    `  ⚠ ${redirectRules.length} active redirect rules — approaching the measured ceiling of ~${RULE_BUDGET_FAIL}. ` +
      `About ${Math.floor((RULE_BUDGET_FAIL - redirectRules.length) / 2)} more rename(s) fit.`,
  );
}

/**
 * Where an address lives today, following the rename ledger.
 * ⚠️ Deliberately implemented here rather than imported from
 * build-redirects.mjs. Sharing the resolver would mean a bug in it produced
 * the same wrong answer on both sides and this gate would agree with the
 * mistake. Two independent walks of the same committed data disagree when one
 * of them is wrong, which is the entire point of having a gate.
 */
const renameEdge = new Map(renames.routes.map((r, index) => [r.from, { to: r.to, index }]));
// ⚠️ Same SEMANTICS as the generator — a model renamed back to an earlier
// value leaves a cycle, and the later rename supersedes the earlier one — but
// written independently. Sharing the code would let one bug produce the same
// wrong answer twice; sharing only the rule lets the two disagree when either
// is wrong. (They did disagree the first time, which is how the missing
// supersede rule here was found.)
for (;;) {
  let cycle = null;
  for (const start of renameEdge.keys()) {
    const path = [start];
    let at = start;
    while (renameEdge.has(at)) {
      at = renameEdge.get(at).to;
      if (path.includes(at)) {
        cycle = path.slice(path.indexOf(at));
        break;
      }
      path.push(at);
    }
    if (cycle) break;
  }
  if (!cycle) break;
  renameEdge.delete(cycle.reduce((a, b) => (renameEdge.get(a).index <= renameEdge.get(b).index ? a : b)));
}
const resolveAddress = (start) => {
  const seen = new Set([start]);
  let at = start;
  while (renameEdge.has(at)) {
    at = renameEdge.get(at).to;
    if (seen.has(at)) return null; // cycle breaking failed — a bug, not data
    seen.add(at);
  }
  return at;
};

/**
 * The rename ledger's own three assertions.
 * ⚠️ Its baseline cannot be regenerated from the products — it records what a
 * model used to be, which today's data no longer contains. That is what makes
 * it usable as a baseline at all.
 */
const renameMissing = [];
const renameStillLive = [];
const renameLiveAgain = [];
for (const route of renames.routes) {
  // ⚠️ An address renamed away and later renamed back is live again: it must
  // NOT have a rule (that would be a redirect to itself) and it SHOULD serve a
  // page. Both of the assertions below would be exactly backwards for it.
  if (resolveAddress(route.from) === route.from) {
    renameLiveAgain.push(route.from);
    continue;
  }
  for (const form of [route.from, route.from.replace(/\/$/, '')]) {
    if (!ruleFor.get(form)) renameMissing.push(form);
  }
  // A "renamed" address that still serves a page was not a rename.
  const page = `${DIST}${route.from}index.html`.replace(/\/+/g, '/');
  if (files.some((f) => f.replace(/\\/g, '/') === page)) renameStillLive.push(route.from);
}
if (renameMissing.length) {
  failures.push(
    `${renameMissing.length} renamed URL(s) from model-renames.json have no rule: ${renameMissing.slice(0, 6).join(', ')}`,
  );
}
if (renameStillLive.length) {
  failures.push(
    `${renameStillLive.length} address(es) in model-renames.json still serve a page, so they were not renamed: ${renameStillLive.join(', ')}`,
  );
}
const selfRedirects = redirectRules.filter((r) => r.from === r.to || `${r.from}/` === r.to);
if (selfRedirects.length) {
  failures.push(
    `${selfRedirects.length} rule(s) redirect to themselves (an infinite loop): ${selfRedirects.map((r) => r.from).slice(0, 4).join(', ')}`,
  );
}
console.log(
  `  renames: ${renames.routes.length} in the ledger — ${renameMissing.length} without a rule, ` +
    `${renameStillLive.length} still serving, ${selfRedirects.length} self-redirect(s)`,
);


const missingRules = [];
const wrongTarget = [];
const danglingTarget = [];
for (const route of migration.routes) {
  const expected = resolveAddress(route.to);
  if (expected === null) {
    failures.push(`model-renames.json loops while resolving ${route.to}`);
    continue;
  }
  // A frozen route whose product was later renamed back onto its own old
  // address resolves to itself; the generator drops that rule, so the gate
  // must not then demand it.
  if (expected === route.from) continue;
  for (const form of [route.from, route.from.replace(/\/$/, '')]) {
    const rule = ruleFor.get(form);
    if (!rule) {
      missingRules.push(form);
      continue;
    }
    if (rule.to !== expected) wrongTarget.push(`${form} -> ${rule.to} (expected ${expected})`);
    if (rule.code !== '301') wrongTarget.push(`${form} has code ${rule.code}, expected 301`);
  }
  // ⚠️ Against the RESOLVED target, not the frozen one: after a rename the
  // frozen address is expected to be gone, and complaining about that would
  // make this warning fire on every correctly-handled rename.
  const page = `${DIST}${expected}index.html`.replace(/\/+/g, '/');
  if (!files.some((f) => f.replace(/\\/g, '/') === page)) danglingTarget.push(`${route.from} -> ${expected} (no page built)`);
}
if (missingRules.length) {
  failures.push(
    `${missingRules.length} frozen URL(s) have no rule in public/_redirects: ${missingRules.slice(0, 6).join(', ')}${missingRules.length > 6 ? ' …' : ''}`,
  );
}
if (wrongTarget.length) {
  failures.push(`${wrongTarget.length} redirect rule(s) disagree with the frozen list: ${wrongTarget.slice(0, 4).join('; ')}`);
}
if (danglingTarget.length) {
  console.warn(
    `  ⚠ ${danglingTarget.length} redirect(s) point at a page that is no longer built ` +
      `(a model was probably renamed): ${danglingTarget.slice(0, 4).join('; ')}`,
  );
}
// ⚠️ Say what was actually found. An "all present" line printed above a
// failure is a line nobody can trust again.
console.log(
  `  redirects: ${migration.routes.length} frozen URL(s) × 2 forms — ` +
    `${missingRules.length} missing, ${wrongTarget.length} mismatched, ${danglingTarget.length} dangling`,
);

// Merge the dangling list into the diagnostics the build wrote. This is the
// only step that knows what the redirect targets resolved to, and a warning
// that lives only in this log is a warning nobody reads.
const diagnosticsPath = `${DIST}/build-diagnostics.json`;
try {
  const diagnostics = JSON.parse(await readFile(diagnosticsPath, 'utf8'));
  diagnostics.danglingRedirects = danglingTarget;
  await writeFile(diagnosticsPath, `${JSON.stringify(diagnostics, null, 2)}\n`);
  console.log(
    `  diagnostics: ${diagnostics.skippedProducts} skipped product(s), ` +
      `${diagnostics.skippedCuratedRefs ?? 0} dangling curated ref(s), ` +
      `${danglingTarget.length} dangling redirect(s) -> ${diagnosticsPath}`,
  );
} catch (error) {
  failures.push(`could not merge dangling redirects into ${diagnosticsPath}: ${error.message}`);
}

if (failures.length) {
  console.error(`\n✗ dist check failed (${failures.length}):`);
  for (const line of failures.slice(0, 40)) console.error(`  - ${line}`);
  process.exit(1);
}

console.log(
  `✓ dist check passed — ${textFiles.length} text file(s) scanned, ` +
    `${draftSlugs.length} draft slug(s) confirmed absent, ` +
    `${titles.size} unique title(s) across ${htmlFiles.length} page(s)`,
);
