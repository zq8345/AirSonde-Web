/**
 * W6②: render "product in the scene" hero images.
 *
 * Joe: the hero background should BE a picture with the product in it, not a
 * product floating on top. This composites a real monitor onto a real surface
 * in the scene photo: border-connected flood fill turns the listing photo's
 * white background transparent (interior whites — the housing — survive,
 * because only pixels reachable from the border are eaten), then the cutout
 * lands on the scene with a soft elliptical contact shadow.
 *
 * Run: node scripts/build-hero-composite.mjs
 * Output: src/assets/photos/hero-composite-{a,b,c}.webp + candidates to
 * scratch for eyeballing.
 */
import sharp from 'sharp';

const WHITE = 244; // flood threshold: background JPEG-white is ≥~247, housing edges shade below

async function cutout(productPath) {
  const { data, info } = await sharp(productPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const nearWhite = (i) => data[i] >= WHITE && data[i + 1] >= WHITE && data[i + 2] >= WHITE;
  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) {
    stack.push(x, 0, x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    stack.push(0, y, w - 1, y);
  }
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const p = y * w + x;
    if (seen[p]) continue;
    seen[p] = 1;
    const i = p * c;
    if (!nearWhite(i)) continue;
    data[i + 3] = 0; // background → transparent
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }
  return sharp(data, { raw: { width: w, height: h, channels: c } }).png().toBuffer();
}

async function shadow(width, height) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <ellipse cx="${width / 2}" cy="${height / 2}" rx="${width * 0.46}" ry="${height * 0.38}" fill="rgba(20,24,28,0.38)"/>
  </svg>`;
  return sharp(Buffer.from(svg)).blur(12).png().toBuffer();
}

/**
 * scene: path; product: path; place: product base-midpoint as fractions of the
 * scene (x, y = where the product touches the surface), heightFrac = product
 * height relative to scene height.
 */
async function composite(out, scenePath, productPath, place) {
  const scene = sharp(scenePath).resize({ width: 1600 });
  const meta = await scene.clone().toBuffer({ resolveWithObject: true });
  const sw = meta.info.width;
  const sh = meta.info.height;

  const cut = await cutout(productPath);
  const targetH = Math.round(sh * place.heightFrac);
  const prod = await sharp(cut).resize({ height: targetH }).toBuffer();
  const pInfo = await sharp(prod).metadata();

  const baseX = Math.round(sw * place.x - pInfo.width / 2);
  const baseY = Math.round(sh * place.y);

  const shW = Math.round(pInfo.width * 1.18);
  const shH = Math.round(targetH * 0.1);
  const sh1 = await shadow(shW, shH);

  await sharp(meta.data)
    .composite([
      { input: sh1, left: Math.round(sw * place.x - shW / 2), top: baseY - Math.round(shH / 2) },
      { input: prod, left: baseX, top: baseY - targetH },
    ])
    .webp({ quality: 84 })
    .toFile(out);
  console.log(`${out}  (${sw}x${sh}, product h=${targetH})`);
}

const PRODUCT_D3 = 'src/assets/products/co2-tvoc-hcho-desktop-monitor.webp';
const PRODUCT_D16 = 'src/assets/products/16in1-large-display-monitor.webp';

// A: living-room hero scene, AS-D3 on the coffee table (centre-right)
await composite(
  'src/assets/photos/hero-composite-a.webp',
  'src/assets/photos/hero-living-room.jpg',
  PRODUCT_D3,
  { x: 0.555, y: 0.745, heightFrac: 0.085 },
);
// B: home scene (wooden coffee table), AS-D3
await composite(
  'src/assets/photos/hero-composite-b.webp',
  'src/assets/photos/scene-home.jpg',
  PRODUCT_D3,
  { x: 0.6, y: 0.547, heightFrac: 0.07 },
);
// C: office scene (white desk right), AS-D16 large-display unit
await composite(
  'src/assets/photos/hero-composite-c.webp',
  'src/assets/photos/scene-office.jpg',
  PRODUCT_D16,
  { x: 0.735, y: 0.596, heightFrac: 0.1 },
);
