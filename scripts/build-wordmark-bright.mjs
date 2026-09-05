// Derive the bright-green wordmark used by the homepage's transparent header
// (Joe 2026-09-05: "logo不要加蒙层" — the brand green reads dull on the dark hero,
// so the header shows the wordmark in --green-bright; DESIGN.md: 深底选中 = 亮绿).
//
// The v11 wordmark PNG is a flat single colour + alpha (see export-logo-v11-assets.py:
// `colored(alpha, rgb)`), so the only honest derivation is: keep alpha, replace RGB.
// No filter, no opacity — the output is exactly #2FBF95 on every visible pixel.
//
//   node scripts/build-wordmark-bright.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src/assets/airsonde-wordmark-green.png');
const OUT = path.join(ROOT, 'src/assets/airsonde-wordmark-bright.png');
const BRIGHT = [0x2f, 0xbf, 0x95]; // --green-bright

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
if (info.channels !== 4) throw new Error(`expected RGBA, got ${info.channels} channels`);

let visible = 0;
for (let i = 0; i < data.length; i += 4) {
  if (data[i + 3] === 0) continue;
  data[i] = BRIGHT[0];
  data[i + 1] = BRIGHT[1];
  data[i + 2] = BRIGHT[2];
  visible++;
}

await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png({ compressionLevel: 9, palette: false })
  .toFile(OUT);

console.log(`wrote ${path.relative(ROOT, OUT)}: ${info.width}x${info.height}, ${visible} visible px -> #2FBF95`);
