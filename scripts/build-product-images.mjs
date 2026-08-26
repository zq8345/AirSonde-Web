/**
 * One-shot: convert the supplier source photos in
 * src/assets/products/originals/ into the WebP files the product records
 * reference. Originals stay in the repo untouched; they are never imported by
 * a page, so they never reach dist/.
 *
 * Run: pnpm images:build          (never overwrites anything it did not write)
 *      pnpm images:build --force  (overwrites, printing every file it replaces)
 *
 * 🔴 OUT is the same directory the admin uploads into. A product photo Joe
 * reviewed and uploaded himself must never be silently replaced by the
 * supplier original this script starts from — so the decision is made on
 * CONTENT, not on filenames or timestamps:
 *   missing          → write
 *   byte-identical   → already current, nothing happens
 *   present, differs → SKIP and list it (someone else owns that file now)
 * Only --force overrides that, and then every replacement is printed.
 */
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'src/assets/products/originals';
const OUT = 'src/assets/products';
const MAX_WIDTH = 1400;
const FORCE = process.argv.includes('--force') || process.env.ALLOW_OVERWRITE === '1';

/** original filename prefix -> output webp basename */
const MAP = {
  // --- published ---
  '01-': 'co2-tvoc-hcho-desktop-monitor',
  '02-': 'co2-tvoc-hcho-desktop-monitor-2',
  '05-': 'co2-tvoc-hcho-desktop-monitor-3',
  '07-': 'co2-tvoc-hcho-desktop-monitor-4',
  '20-': 'co2-tvoc-hcho-desktop-monitor-5',
  '08-': 'wide-screen-co2-monitor',
  '12-': '9in1-desktop-air-quality-monitor',
  '30-': '9in1-desktop-air-quality-monitor-2',
  '15-': '16in1-large-display-monitor',
  '16-': 'oval-wifi-air-quality-monitor',
  '19-': '8in1-desktop-monitor',
  '23-': 'hcho-desktop-monitor',
  '34-': 'compact-square-air-quality-monitor',
  '31-': 'compact-square-air-quality-monitor-2',
  '32-': 'wifi-widescreen-air-quality-monitor',
  '33-': 'wifi-widescreen-air-quality-monitor-2',
  '35-': 'portrait-aqi-desktop-monitor',
  '36-': 'portrait-aqi-desktop-monitor-2',
  '14-': 'handheld-air-quality-analyser',
  '18-': 'portable-co-alarm',
  '28-': 'portable-co-alarm-2',
  // --- draft: written to products/_draft/ so the published glob cannot see
  // them, which is what keeps draft slugs out of dist/ entirely ---
  '13-': '7in-desktop-air-quality-monitor',
  '03-': 'mini-co2-desktop-monitor',
  '26-': 'co2-desktop-monitor',
  '27-': 'compact-9in1-desktop-monitor',
  '29-': 'wifi-9in1-desktop-monitor',
  '38-': 'wall-mount-co2-tvoc-monitor',
  '10-': 'wbgt-heat-index-monitor',
  '11-': 'pump-breathalyser',
  '24-': 'portable-breathalyser',
  '25-': 'app-breathalyser',
  '17-': 'geiger-counter',
};

/**
 * Draft membership is read from the product records themselves. It used to be
 * a hardcoded list, which went stale when 11 products were published
 * (04f82b0): a run would have written their images into _draft/, where no
 * page looks for them.
 */
const CONTENT = 'src/content/products';
const DRAFT = new Set();
for (const name of await readdir(CONTENT)) {
  if (!name.endsWith('.json')) continue;
  const record = JSON.parse(await readFile(path.join(CONTENT, name), 'utf8'));
  if (record.status === 'draft') DRAFT.add(record.slug);
}

await mkdir(OUT, { recursive: true });
await mkdir(path.join(OUT, '_draft'), { recursive: true });
const files = await readdir(SRC);

let written = 0;
let current = 0;
const protectedFiles = [];
const overwritten = [];
const unmapped = [];

const readIfExists = async (file) => {
  try {
    return await readFile(file);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
};

for (const file of files) {
  const key = Object.keys(MAP).find((prefix) => file.startsWith(prefix));
  if (!key) {
    unmapped.push(file);
    continue;
  }
  const name = MAP[key];
  const target = path.join(OUT, DRAFT.has(name) ? '_draft' : '', `${name}.webp`);
  // W6①: listing photos carry huge blank margins, which is what produced the
  // picture-in-picture look on cards. Trim to the product's bounding box at
  // build time (originals stay untouched); the card CSS then scales the
  // product to fill its media area.
  const trimmed = await sharp(path.join(SRC, file)).trim({ threshold: 12 }).toBuffer();
  const meta = await sharp(trimmed).metadata();
  // Render to a buffer first: the decision to write is made by comparing the
  // bytes we would produce against the bytes already on disk.
  const next = await sharp(trimmed)
    .resize({ width: Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH), withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toBuffer();

  const existing = await readIfExists(target);
  const label = path.basename(target);
  const dims = `${meta.width}x${meta.height}`;
  const kb = `${Math.round(next.length / 1024)} KB`;

  if (existing && existing.equals(next)) {
    current += 1;
    continue;
  }
  if (existing && !FORCE) {
    // Someone else owns this file now — most likely an upload from the admin.
    protectedFiles.push(label);
    continue;
  }
  await writeFile(target, next);
  if (existing) {
    overwritten.push(label);
    console.log(`OVERWRITTEN (--force)  ${file}  ->  ${label}  ${dims}  (${kb})`);
  } else {
    console.log(`written                ${file}  ->  ${label}  ${dims}  (${kb})`);
  }
  written += 1;
}

const handled = written + current + protectedFiles.length + unmapped.length;
console.log(
  `\nwritten ${written} · already current ${current} · ` +
    `🔴 skipped (changed since this script wrote them) ${protectedFiles.length} · ` +
    `unmapped ${unmapped.length}   = ${handled} of ${files.length} source file(s)`,
);
if (protectedFiles.length) {
  console.log(
    `\n🔴 NOT overwritten — these differ from what this script produces, so they are\n` +
      `   assumed to be uploads or hand-edits. Re-run with --force to replace them:`,
  );
  for (const name of protectedFiles) console.log(`   - ${name}`);
}
if (overwritten.length) {
  console.log(`\n--force replaced ${overwritten.length} file(s): ${overwritten.join(', ')}`);
}
if (unmapped.length) {
  console.log(`\nno mapping, intentionally ignored: ${unmapped.join(', ')}`);
}
