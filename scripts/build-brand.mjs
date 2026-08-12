/**
 * One-shot brand asset generation:
 *  1. logo-lockup.svg — mark + "AirSonde" wordmark with the text converted to
 *     paths (external recipients cannot be assumed to have Inter installed).
 *     Wordmark spec (总工 2026-08-11): Inter, "Air" 400 + "Sonde" 500, ink
 *     #101418, letterspacing -0.5px, gap ≈ 0.35 × mark height.
 *  2. favicon PNG family from public/favicon.svg (16/32/48 + apple-touch 180).
 *
 * Run: node scripts/build-brand.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import * as fontkit from 'fontkit';
import sharp from 'sharp';

/* ---------- 1. lockup ---------- */

const FONT_400 = 'node_modules/@fontsource/inter/files/inter-latin-400-normal.woff';
const FONT_500 = 'node_modules/@fontsource/inter/files/inter-latin-500-normal.woff';

const font400 = fontkit.create(await readFile(FONT_400));
const font500 = fontkit.create(await readFile(FONT_500));

const MARK_H = 64; // mark viewBox height
const FONT_SIZE = 30; // wordmark size relative to the 64-unit mark
const GAP = MARK_H * 0.35;
const TRACKING = -0.5; // px at this size, per spec

function wordToPaths(font, text, size, startX, baselineY) {
  const scale = size / font.unitsPerEm;
  const run = font.layout(text);
  let x = startX;
  const paths = [];
  for (const glyph of run.glyphs) {
    // glyph outlines are y-up; flip around the baseline
    const d = glyph.path.scale(scale, -scale).translate(x, baselineY).toSVG();
    if (d) paths.push(`<path d="${d}"/>`);
    x += glyph.advanceWidth * scale + TRACKING;
  }
  return { paths, endX: x - TRACKING };
}

// baseline: centre the wordmark's cap-height band on the mark's centre (y=32)
const capHeight400 = (font400.capHeight / font400.unitsPerEm) * FONT_SIZE;
const baseline = 32 + capHeight400 / 2;

const textStart = MARK_H + GAP;
const air = wordToPaths(font400, 'Air', FONT_SIZE, textStart, baseline);
const sonde = wordToPaths(font500, 'Sonde', FONT_SIZE, air.endX, baseline);

const totalW = Math.ceil(sonde.endX + 2);
const lockup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} 64" role="img" aria-label="AirSonde">
  <!-- 声波环 mark + wordmark. Mark geometry frozen by 总工 2026-08-11.
       Wordmark: Inter Air=400 Sonde=500, tracking -0.5px, converted to paths
       so the file needs no fonts installed. Regenerate: node scripts/build-brand.mjs -->
  <g>
    <circle cx="32" cy="32" r="7.5" fill="#0C7A6B"/>
    <circle cx="32" cy="32" r="17" fill="none" stroke="#0C7A6B" stroke-width="4.6"
            stroke-linecap="round" stroke-dasharray="89 18" transform="rotate(-56 32 32)"/>
    <circle cx="32" cy="32" r="27" fill="none" stroke="#0C7A6B" stroke-width="4.6"
            stroke-linecap="round" stroke-dasharray="141 29" transform="rotate(-56 32 32)" opacity="0.55"/>
  </g>
  <g fill="#101418">
    ${[...air.paths, ...sonde.paths].join('\n    ')}
  </g>
</svg>
`;
await writeFile('src/assets/brand/logo-lockup.svg', lockup);
console.log(`logo-lockup.svg written (${totalW}x64, ${air.paths.length + sonde.paths.length} glyph paths)`);

/* ---------- 2. favicon raster family ---------- */

const faviconSvg = await readFile('public/favicon.svg');
for (const size of [16, 32, 48]) {
  await sharp(faviconSvg, { density: (72 * size) / 64 })
    .resize(size, size)
    .png()
    .toFile(`public/favicon-${size}.png`);
  console.log(`favicon-${size}.png written`);
}
// apple-touch-icon: white plate, mark inset ~78%
const mark180 = await sharp(faviconSvg, { density: (72 * 140) / 64 })
  .resize(140, 140)
  .png()
  .toBuffer();
await sharp({ create: { width: 180, height: 180, channels: 4, background: '#ffffff' } })
  .composite([{ input: mark180, left: 20, top: 20 }])
  .png()
  .toFile('public/apple-touch-icon.png');
console.log('apple-touch-icon.png written');
