/**
 * 产品图规范化 (总工七条之一): every product photo becomes OUR photo —
 * border-connected flood fill lifts the product off whatever background the
 * supplier shot it on (watermarks and baked marketing text live in that
 * background and vanish with it), then the cutout lands centred on a uniform
 * light-grey stage with a soft contact shadow.
 *
 * Sample mode:  node scripts/build-product-stage.mjs <slug>
 *   → writes src/assets/products/_staged/<slug>.webp for one product only
 * Batch mode comes after the sample is approved (总工: 先样板).
 *
 * Products whose cutout is NOT clean (transparent parts, reflections eating
 * into the silhouette) must be REPORTED, not shipped dirty — the checker
 * prints coverage numbers for that call.
 */
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';

const WHITE = 244;
const STAGE = { r: 244, g: 245, b: 247 }; // --as-tile #f4f5f7
const OUT_SIZE = 800;
const PRODUCT_FRAC = 0.8; // product occupies ≤80% of the stage each axis

async function cutout(path) {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const nearWhite = (i) => data[i] >= WHITE && data[i + 1] >= WHITE && data[i + 2] >= WHITE;
  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, 0, x, h - 1);
  for (let y = 0; y < h; y++) stack.push(0, y, w - 1, y);
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const p = y * w + x;
    if (seen[p]) continue;
    seen[p] = 1;
    const i = p * c;
    if (!nearWhite(i)) continue;
    data[i + 3] = 0;
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }
  // bbox of remaining opaque pixels + coverage stats for the clean/dirty call
  let minX = w, minY = h, maxX = 0, maxY = 0, opaque = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * c + 3] > 0) {
        opaque++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (opaque === 0) throw new Error('cutout removed everything');
  const buf = await sharp(data, { raw: { width: w, height: h, channels: c } })
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .png()
    .toBuffer();
  return { buf, coverage: opaque / (w * h), bbox: { w: maxX - minX + 1, h: maxY - minY + 1 } };
}

export async function stageOne(slug) {
  const src = `src/assets/products/${slug}.webp`;
  if (!existsSync(src)) throw new Error(`no such product image: ${src}`);
  const { buf, coverage, bbox } = await cutout(src);

  const maxSide = Math.round(OUT_SIZE * PRODUCT_FRAC);
  const scale = Math.min(maxSide / bbox.w, maxSide / bbox.h);
  const pw = Math.round(bbox.w * scale);
  const ph = Math.round(bbox.h * scale);
  const prod = await sharp(buf).resize({ width: pw, height: ph }).toBuffer();

  const left = Math.round((OUT_SIZE - pw) / 2);
  const baseY = Math.round(OUT_SIZE / 2 + ph / 2); // product vertically centred; shadow at its base

  const shW = Math.round(pw * 1.12);
  const shH = Math.max(14, Math.round(ph * 0.07));
  const shadow = await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${shW}" height="${shH}"><ellipse cx="${shW / 2}" cy="${shH / 2}" rx="${shW * 0.46}" ry="${shH * 0.38}" fill="rgba(16,20,24,0.16)"/></svg>`,
    ),
  )
    .blur(9)
    .png()
    .toBuffer();

  if (!existsSync('src/assets/products/_staged')) mkdirSync('src/assets/products/_staged');
  const out = `src/assets/products/_staged/${slug}.webp`;
  await sharp({
    create: { width: OUT_SIZE, height: OUT_SIZE, channels: 3, background: STAGE },
  })
    .composite([
      { input: shadow, left: Math.round(OUT_SIZE / 2 - shW / 2), top: baseY - Math.round(shH / 2) },
      { input: prod, left, top: baseY - ph },
    ])
    .webp({ quality: 86 })
    .toFile(out);
  console.log(`${out}  coverage=${(coverage * 100).toFixed(1)}%  product=${pw}x${ph}`);
  return out;
}

const slug = process.argv[2];
if (slug) await stageOne(slug);
else console.log('usage: node scripts/build-product-stage.mjs <slug>');
