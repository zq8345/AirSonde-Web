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

if (failures.length) {
  console.error(`\n✗ dist check failed (${failures.length}):`);
  for (const line of failures.slice(0, 40)) console.error(`  - ${line}`);
  process.exit(1);
}

console.log(
  `✓ dist check passed — ${textFiles.length} text file(s) scanned, ` +
    `${draftSlugs.length} draft slug(s) confirmed absent`,
);
