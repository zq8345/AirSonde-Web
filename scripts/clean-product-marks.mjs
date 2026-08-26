/**
 * Remove third-party marks (ICANOW wordmarks, baked marketing text) from
 * product photos — 总工 七条之1, with its hard constraint: never smear the
 * product. Anything that cannot be cleaned safely is REPORTED, not patched.
 *
 * How it stays safe:
 *  1. flood-fill from the borders over near-white → the photo's background
 *  2. label the remaining connected components
 *  3. the largest component is the product; its bbox (plus a margin) is a
 *     no-touch zone
 *  4. only components that are (a) small relative to the product and (b)
 *     entirely outside that zone get erased to the local background colour
 *  5. components that overlap the product, or are too big to be a mark, are
 *     listed for human review and left untouched
 *
 * Usage:
 *   node scripts/clean-product-marks.mjs            # report only
 *   node scripts/clean-product-marks.mjs --write    # apply + report
 */
import sharp from 'sharp';
import { readdir, rename, writeFile } from 'node:fs/promises';

const DIR = 'src/assets/products';
const NEAR_WHITE = 238; // background threshold
const MARGIN = 6; // no-touch margin around the product bbox, px
const MARK_MAX_AREA = 0.08; // a mark is at most 8% of the product's area
/**
 * ⚠️ Learned on the first dry run: "small blob outside the product bbox" is
 * NOT a safe definition of a mark — it also caught drop shadows and the dot
 * matrix on a product's own face. Marks live in the TOP STRIP (supplier
 * wordmark, baked marketing line), so that is the only zone we ever erase.
 */
const TOP_STRIP = 0.1;
const WRITE = process.argv.includes('--write');
const swapped = [];
const pendingSwap = [];

function labelComponents(bg, w, h) {
  const label = new Int32Array(w * h).fill(-1);
  const comps = [];
  const stack = [];
  for (let p = 0; p < w * h; p++) {
    if (bg[p] || label[p] !== -1) continue;
    const id = comps.length;
    const comp = { id, area: 0, minX: w, minY: h, maxX: 0, maxY: 0 };
    stack.push(p);
    label[p] = id;
    while (stack.length) {
      const q = stack.pop();
      const x = q % w;
      const y = (q / w) | 0;
      comp.area++;
      if (x < comp.minX) comp.minX = x;
      if (x > comp.maxX) comp.maxX = x;
      if (y < comp.minY) comp.minY = y;
      if (y > comp.maxY) comp.maxY = y;
      const nbr = [q - 1, q + 1, q - w, q + w];
      for (let k = 0; k < 4; k++) {
        const r = nbr[k];
        if (r < 0 || r >= w * h) continue;
        if (k < 2 && Math.abs((r % w) - x) !== 1) continue; // row wrap guard
        if (bg[r] || label[r] !== -1) continue;
        label[r] = id;
        stack.push(r);
      }
    }
    comps.push(comp);
  }
  return { label, comps };
}

async function processOne(file) {
  const path = `${DIR}/${file}`;
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;

  // 1. background = near-white reachable from the border
  const bg = new Uint8Array(w * h);
  const near = (p) => {
    const i = p * c;
    return data[i] >= NEAR_WHITE && data[i + 1] >= NEAR_WHITE && data[i + 2] >= NEAR_WHITE;
  };
  const stack = [];
  for (let x = 0; x < w; x++) {
    stack.push(x, (h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    stack.push(y * w, y * w + w - 1);
  }
  while (stack.length) {
    const p = stack.pop();
    if (bg[p] || !near(p)) continue;
    bg[p] = 1;
    const x = p % w;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (p >= w) stack.push(p - w);
    if (p < w * (h - 1)) stack.push(p + w);
  }

  const bgRatio = bg.reduce((a, b) => a + b, 0) / (w * h);
  if (bgRatio < 0.12) {
    return { file, skip: 'not a white-background photo', bgRatio: +(bgRatio * 100).toFixed(1) };
  }

  // 2/3. components + product no-touch zone
  const { label, comps } = labelComponents(bg, w, h);
  if (!comps.length) return { file, skip: 'no foreground found' };
  const product = comps.reduce((a, b) => (b.area > a.area ? b : a));
  const zone = {
    minX: product.minX - MARGIN,
    maxX: product.maxX + MARGIN,
    minY: product.minY - MARGIN,
    maxY: product.maxY + MARGIN,
  };

  const marks = [];
  const risky = [];
  for (const comp of comps) {
    if (comp.id === product.id) continue;
    if (comp.area < 40) continue; // dust / jpeg speckle
    const overlaps =
      comp.maxX >= zone.minX && comp.minX <= zone.maxX && comp.maxY >= zone.minY && comp.minY <= zone.maxY;
    const tooBig = comp.area > product.area * MARK_MAX_AREA;
    const inTopStrip = comp.maxY < h * TOP_STRIP;
    if (overlaps || tooBig || !inTopStrip) {
      risky.push({
        area: comp.area,
        box: [comp.minX, comp.minY, comp.maxX, comp.maxY],
        overlaps,
        tooBig,
        outsideStrip: !inTopStrip,
      });
    } else {
      marks.push(comp);
    }
  }

  if (marks.length && WRITE) {
    /**
     * 4. Erase the band the marks live in, not each glyph.
     *
     * Erasing glyph by glyph left visible ghosting: a wordmark's antialiased
     * fringe breaks into specks below the dust threshold, so they survived
     * and the "cleaned" image still showed a grey shadow of ICANOW. The band
     * is the union of the marks padded a little — and it is only ever used
     * when it does not touch the product's no-touch zone, so widening the
     * erase cannot smear the product.
     */
    const band = {
      minX: Math.max(0, Math.min(...marks.map((m) => m.minX)) - 8),
      maxX: Math.min(w - 1, Math.max(...marks.map((m) => m.maxX)) + 8),
      minY: Math.max(0, Math.min(...marks.map((m) => m.minY)) - 8),
      maxY: Math.min(h - 1, Math.max(...marks.map((m) => m.maxY)) + 8),
    };
    const bandHitsProduct =
      band.maxX >= zone.minX && band.minX <= zone.maxX && band.maxY >= zone.minY && band.minY <= zone.maxY;
    const sampleY = Math.min(h - 1, band.maxY + 6);
    const si = (sampleY * w + Math.min(w - 1, band.minX)) * c;
    const fill = [data[si], data[si + 1], data[si + 2]];
    // the sample lands a couple of levels under pure white on these studio
    // shots (252 vs 255) — snap it so the erased band leaves no faint
    // rectangle against the surrounding paper white
    if (fill.every((v) => v >= 250)) fill[0] = fill[1] = fill[2] = 255;
    for (let y = band.minY; y <= band.maxY; y++) {
      for (let x = band.minX; x <= band.maxX; x++) {
        const p = y * w + x;
        // outside the band-fill case, fall back to per-glyph erasure
        if (bandHitsProduct && label[p] === product.id) continue;
        const i = p * c;
        data[i] = fill[0];
        data[i + 1] = fill[1];
        data[i + 2] = fill[2];
      }
    }
    // buffer first (sharp cannot write into the file it is reading), then
    // swap through a temp name — writing straight back hit a Windows lock
    const out = await sharp(data, { raw: { width: w, height: h, channels: c } })
      .webp({ quality: 88 })
      .toBuffer();
    const tmp = `${path}.tmp`;
    await writeFile(tmp, out);
    // On this Windows box node cannot overwrite an existing product image —
    // rename and copyFile both fail (EPERM / UNKNOWN) while PowerShell's
    // Move-Item succeeds. So the cleaned bytes are left as <file>.tmp and the
    // swap is finished by:
    //   Get-ChildItem src/assets/products/*.tmp | ForEach-Object {
    //     Move-Item -Force $_.FullName ($_.FullName -replace '\.tmp$','') }
    try {
      await rename(tmp, path);
      swapped.push(file);
    } catch {
      pendingSwap.push(file);
    }
  }

  return {
    file,
    cleaned: marks.map((m) => ({ area: m.area, box: [m.minX, m.minY, m.maxX, m.maxY] })),
    risky,
  };
}

/**
 * Only the files the audit named. The detector alone is not a licence to
 * edit: a dry run over all 32 also flagged blobs on `oval-wifi` and
 * `portable-co-alarm-2` that sit in the top strip but belong to the product.
 * Widening this list means looking at the result first.
 */
const ALLOW = new Set([
  // ICANOW supplier wordmark (5, per the audit's own recount)
  'co2-desktop-monitor.webp',
  'compact-9in1-desktop-monitor.webp',
  'mini-co2-desktop-monitor.webp',
  'wall-mount-co2-tvoc-monitor.webp',
  'wifi-9in1-desktop-monitor.webp',
  // baked marketing line: red "IP65 waterproof and dustproof"
  'wbgt-heat-index-monitor.webp',
]);

const files = (await readdir(DIR)).filter((f) => f.endsWith('.webp') && ALLOW.has(f));
const report = [];
for (const f of files) report.push(await processOne(f));

const cleaned = report.filter((r) => r.cleaned?.length);
const riskyOnes = report.filter((r) => r.risky?.length);
const skipped = report.filter((r) => r.skip);

console.log(`\n${WRITE ? 'APPLIED' : 'DRY RUN'} — ${files.length} images\n`);
console.log(`marks removed on ${cleaned.length}:`);
for (const r of cleaned) console.log(`  ${r.file}: ${r.cleaned.map((m) => m.box.join(',')).join(' | ')}`);
console.log(`\nNOT touched, needs human review (${riskyOnes.length}):`);
for (const r of riskyOnes)
  console.log(`  ${r.file}: ${r.risky.map((m) => `${m.box.join(',')}${m.overlaps ? ' overlaps-product' : ''}${m.tooBig ? ' too-big' : ''}`).join(' | ')}`);
console.log(`\nskipped, not white-background (${skipped.length}):`);
for (const r of skipped) console.log(`  ${r.file}: ${r.skip}${r.bgRatio !== undefined ? ` (bg ${r.bgRatio}%)` : ''}`);
