/**
 * One-shot: convert the supplier source photos in
 * src/assets/products/originals/ into the WebP files the product records
 * reference. Originals stay in the repo untouched; they are never imported by
 * a page, so they never reach dist/.
 *
 * Run: pnpm images:build
 */
import { mkdir, readdir, readFile, stat } from 'node:fs/promises';
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

/**
 * W17 step 1 — crops applied BEFORE the trim, as fractions of the original
 * frame. This is the durable half of the children-photo fix: the supplier's
 * listing photo for 13- shows two identifiable children and a dog with no
 * release on file, so the pipeline ships the device only. Fixing just the
 * .webp would be undone the next time this script runs.
 */
const CROP = {
  '13-': { left: 0.1533, top: 0.3633, width: 0.7333, height: 0.5867 },
};

/**
 * Draft membership is read from the product records themselves — it used to
 * be a hardcoded list, which went stale when 11 products were published
 * (04f82b0) and would have written their images into _draft/ where no page
 * looks for them.
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
  const crop = CROP[key];
  let source = sharp(path.join(SRC, file));
  if (crop) {
    const dims = await source.metadata();
    source = sharp(
      await sharp(path.join(SRC, file))
        .extract({
          left: Math.round(dims.width * crop.left),
          top: Math.round(dims.height * crop.top),
          width: Math.round(dims.width * crop.width),
          height: Math.round(dims.height * crop.height),
        })
        .toBuffer(),
    );
  }
  const trimmed = await source.trim({ threshold: 12 }).toBuffer();
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
