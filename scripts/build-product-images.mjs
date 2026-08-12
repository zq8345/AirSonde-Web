/**
 * One-shot: convert the supplier source photos in
 * src/assets/products/originals/ into the WebP files the product records
 * reference. Originals stay in the repo untouched; they are never imported by
 * a page, so they never reach dist/.
 *
 * Run: pnpm images:build
 */
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'src/assets/products/originals';
const OUT = 'src/assets/products';
const MAX_WIDTH = 1400;

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

/** Output basenames that belong to draft records. */
const DRAFT = new Set([
  '7in-desktop-air-quality-monitor',
  'mini-co2-desktop-monitor',
  'co2-desktop-monitor',
  'compact-9in1-desktop-monitor',
  'wifi-9in1-desktop-monitor',
  'wall-mount-co2-tvoc-monitor',
  'wbgt-heat-index-monitor',
  'pump-breathalyser',
  'portable-breathalyser',
  'app-breathalyser',
  'geiger-counter',
]);

await mkdir(OUT, { recursive: true });
await mkdir(path.join(OUT, '_draft'), { recursive: true });
const files = await readdir(SRC);

let done = 0;
const unmapped = [];

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
  await sharp(trimmed)
    .resize({ width: Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH), withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(target);
  const { size } = await stat(target);
  const orig = await sharp(path.join(SRC, file)).metadata();
  console.log(
    `${file}  ->  ${path.basename(target)}  ${orig.width}x${orig.height} -> ${meta.width}x${meta.height}  (${Math.round(size / 1024)} KB)`,
  );
  done += 1;
}

console.log(`\nconverted ${done} file(s)`);
if (unmapped.length) {
  console.log(`skipped (no mapping, intentional): ${unmapped.join(', ')}`);
}
