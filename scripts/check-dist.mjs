/**
 * Build gate. Runs after `astro build` and fails the build — locally and on
 * Cloudflare Pages — if anything that must never ship has shipped.
 *
 * Contract C1 hard rule 1: supplierRef and draft products must not appear in
 * the build output. Grepping dist/ is the only check that cannot be fooled by
 * the source looking right.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const DIST = 'dist';
const CONTENT = 'src/content/products';

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

for (const slug of draftSlugs) {
  for (const file of files) {
    if (file.includes(slug)) failures.push(`${file}: filename contains draft slug "${slug}"`);
  }
  for (const file of textFiles) {
    const body = await readFile(file, 'utf8');
    if (body.includes(slug)) failures.push(`${file}: body contains draft slug "${slug}"`);
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
