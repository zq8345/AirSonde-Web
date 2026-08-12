/**
 * Paint out the text baked into the upper-left of Joe's hero banner
 * (hero-joe-workspace). The area is flat wall with a soft gradient, so each
 * row is filled by interpolating between the wall colour sampled LEFT of the
 * text and RIGHT of it — horizontal + vertical gradients both survive. A
 * light blur pass over the patch hides any residual seam.
 *
 * Run: node scripts/clean-hero-banner.mjs
 * In:  src/assets/photos/hero-joe-workspace.webp   (original, kept)
 * Out: src/assets/photos/hero-joe-workspace-clean.webp
 */
import sharp from 'sharp';

const SRC = 'src/assets/photos/hero-joe-workspace.webp';
const OUT = 'src/assets/photos/hero-joe-workspace-clean.webp';

// text bbox with padding; sample strips must be clean wall on the same rows
const REGION = { x0: 55, x1: 545, y0: 140, y1: 340 };
const LEFT_STRIP = { x0: 15, x1: 45 };
const RIGHT_STRIP = { x0: 560, x1: 620 };

const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const { width: w, channels: c } = info;

const rowAvg = (y, x0, x1) => {
  const sum = [0, 0, 0];
  for (let x = x0; x < x1; x++) {
    const i = (y * w + x) * c;
    sum[0] += data[i];
    sum[1] += data[i + 1];
    sum[2] += data[i + 2];
  }
  const n = x1 - x0;
  return [sum[0] / n, sum[1] / n, sum[2] / n];
};

for (let y = REGION.y0; y < REGION.y1; y++) {
  const L = rowAvg(y, LEFT_STRIP.x0, LEFT_STRIP.x1);
  const R = rowAvg(y, RIGHT_STRIP.x0, RIGHT_STRIP.x1);
  for (let x = REGION.x0; x < REGION.x1; x++) {
    const t = (x - REGION.x0) / (REGION.x1 - REGION.x0);
    const i = (y * w + x) * c;
    data[i] = L[0] + (R[0] - L[0]) * t;
    data[i + 1] = L[1] + (R[1] - L[1]) * t;
    data[i + 2] = L[2] + (R[2] - L[2]) * t;
  }
}

// soften the patch (and only the patch) so edges melt into the grain
const patch = await sharp(data, { raw: info })
  .extract({
    left: REGION.x0 - 10,
    top: REGION.y0 - 10,
    width: REGION.x1 - REGION.x0 + 20,
    height: REGION.y1 - REGION.y0 + 20,
  })
  .blur(3)
  .toBuffer();

await sharp(data, { raw: info })
  .composite([{ input: patch, raw: { width: REGION.x1 - REGION.x0 + 20, height: REGION.y1 - REGION.y0 + 20, channels: c }, left: REGION.x0 - 10, top: REGION.y0 - 10 }])
  .webp({ quality: 84 })
  .toFile(OUT);

console.log(`${OUT} written (text region ${JSON.stringify(REGION)})`);
