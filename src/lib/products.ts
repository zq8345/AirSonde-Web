import { getCollection, type CollectionEntry } from 'astro:content';
import taxonomy from '../data/taxonomy.json';

export type Product = CollectionEntry<'products'>;

/**
 * Product artwork under src/assets/products/, **including model subfolders**
 * (products/ak35/… — Joe 2026-09-04: one folder per product).
 *
 * 🔴 The two `!` patterns are load-bearing, not tidiness:
 *   - `_draft/` holds artwork for unpublished products. A draft image reaching
 *     dist/ is a leak, and scripts/check-dist.mjs fails the build over it.
 *   - `originals/` holds supplier originals kept on purpose; they must never ship.
 *
 * ⚠️ Until this became recursive, "lives in a subfolder" *was* the mechanism
 * that kept those two out. It no longer is — the exclusions are.
 * ⛔ Do not drop them when touching this line.
 *
 * Measured 2026-09-04, both by rebuilding this tree:
 *   - Removing `!_draft/**` makes the build FAIL (check-dist reports 7 draft
 *     images in dist/). That exclusion is doing real work.
 *   - `originals/` holds 27 .jpg + 11 .png and **zero .webp**, so
 *     `!originals/**` is presently inert. ⚠️ A green build does NOT prove it
 *     works; keep it for the day someone drops a .webp in there.
 *
 * ⚠️ Consequence of going recursive: every .webp in a model subfolder is now
 * eagerly bundled even if no product references it. A subfolder is no longer a
 * place to park images "not live yet" — that role belongs to `_draft/` alone.
 */
const IMAGES = import.meta.glob<{ default: ImageMetadata }>(
  ['/src/assets/products/**/*.webp',
   '!/src/assets/products/_draft/**',
   '!/src/assets/products/originals/**'],
  { eager: true },
);

/** `products/foo.webp` -> the imported asset, or null if the file is not there. */
export function tryResolveProductImage(relativePath: string): ImageMetadata | null {
  return IMAGES[`/src/assets/${relativePath}`]?.default ?? null;
}

/**
 * `products/foo.webp` -> the imported asset.
 *
 * ⚠️ Still throws, but it can no longer be reached by anything an admin does:
 * getPublishedProducts() drops a record whose main image is missing before any
 * page sees it. A throw here now means a programming error, which is what a
 * throw is for. It used to mean "someone saved a product before its image
 * finished uploading", and that took the whole site's build down.
 */
export function resolveProductImage(relativePath: string): ImageMetadata {
  const mod = IMAGES[`/src/assets/${relativePath}`];
  if (!mod) {
    throw new Error(
      `Product image not found: "${relativePath}". Published products must reference a file in src/assets/products/ (not _draft/).`,
    );
  }
  return mod.default;
}

/**
 * Everything a build skipped and why. Collected once, read by
 * /_diagnostics.json so it leaves the build log — which nobody reads. On
 * 2026-08-28 a warning that existed only in the log let the site sit frozen
 * for nine hours.
 */
export type Skip = { slug: string; model: string; reason: string; detail: string };
const skips: Skip[] = [];
export function buildSkips(): Skip[] {
  return skips;
}

let cache: Product[] | null = null;

/**
 * Published, and actually publishable.
 *
 * ⚠️ The three checks below used to throw. Measured 2026-08-28: one dangling
 * slug froze the whole site for nine hours, and the only signal was a build
 * log. The asymmetry decides it — skipping one record leaves one page missing
 * while everything else keeps shipping; failing the build stops everything and
 * tells nobody. Neither is silent: each skip is named on stderr and lands in
 * /_diagnostics.json.
 *
 * ⛔ This is the single place products are filtered, so a skipped record is
 * absent from the sitemap, the list, the homepage and the related strips at
 * once — rather than each of those needing its own patch and drifting.
 *
 * ⚠️ The real guard for a duplicate or malformed model belongs in the admin,
 * at the moment Joe types it: he sees it, it costs one save, and he knows
 * which step caused it. That is dispatched separately.
 */
export async function getPublishedProducts(): Promise<Product[]> {
  if (cache) return cache;
  const products = (await getCollection('products', ({ data }) => data.status === 'published')).sort(
    (a, b) => a.data.name.localeCompare(b.data.name),
  );

  const byPath = new Map<string, Product>();
  const keep: Product[] = [];
  for (const product of products) {
    const { slug, model, images } = product.data;

    if (!tryResolveProductImage(images.main)) {
      skips.push({
        slug,
        model,
        reason: 'missing-image',
        detail: `main image "${images.main}" is not in src/assets/`,
      });
      continue;
    }

    let path: string;
    try {
      path = modelPath(model);
    } catch {
      skips.push({
        slug,
        model,
        reason: 'unusable-model',
        detail: `model ${JSON.stringify(model)} cannot be a URL (needs [a-z0-9-] after lowercasing and "/"->"-")`,
      });
      continue;
    }

    // ⚠️ Deterministic and stated, not "whichever came first by accident":
    // records are sorted by name above, and the FIRST one in that order keeps
    // the address. Both are named, because the one that loses its page is the
    // half nobody would otherwise notice.
    const held = byPath.get(path);
    if (held) {
      skips.push({
        slug,
        model,
        reason: 'duplicate-model',
        detail: `/products/${path}/ is already taken by "${held.data.slug}"; kept the record whose name sorts first ("${held.data.name}"), skipped this one ("${product.data.name}")`,
      });
      continue;
    }
    byPath.set(path, product);
    keep.push(product);
  }

  for (const s of skips) {
    console.warn(`[products] skipped "${s.slug}" (${s.reason}): ${s.detail}`);
  }
  cache = keep;
  return keep;
}

/** Categories that actually have published products, in a stable order. */
export function categoriesOf(products: Product[]): string[] {
  return [...new Set(products.map((p) => p.data.category))].sort();
}

/**
 * Contract v1.4: labels and ordering for both axes come from
 * src/data/taxonomy.json. ⛔ Do not re-inline them here — the whole point of
 * that file is that the admin can edit one place.
 *
 * Unknown values fall back to the raw value rather than throwing: a record
 * can only carry a value the build already validated against the same file,
 * so this branch means "taxonomy edited mid-flight", and a readable string
 * beats a crash.
 */
export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  taxonomy.categories.map((c) => [c.value, c.label]),
);

const SENSOR_LABELS: Record<string, string> = Object.fromEntries(
  taxonomy.sensors.map((s) => [s.value, s.label]),
);

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

/** Display name for a stored sensor value (contract v1.4). */
export function sensorLabel(sensor: string): string {
  return SENSOR_LABELS[sensor] ?? sensor;
}

/** Stored sensor values rendered as their display names, order preserved. */
export function sensorLabels(sensors: readonly string[]): string[] {
  return sensors.map(sensorLabel);
}

/**
 * W17 R4 — the truthful product-type phrase for machine-readable text.
 *
 * 🔴 `other` deliberately has no entry. It is the catch-all bucket holding
 * breathalysers, a Geiger counter and a heat-index meter; the old schema
 * interpolated the raw enum into "<category> indoor air quality monitor",
 * which told every crawler and LLM that a Geiger counter measures indoor air
 * quality — and leaked the internal word "other" as an English adjective.
 * When we cannot name the type honestly we say nothing, we do not invent a
 * fallback word. Single source: this map, used by the schema builders.
 */
const PRODUCT_TYPE_PHRASES: Record<string, string> = {
  desktop: 'desktop indoor air quality monitor',
  portable: 'portable indoor air quality monitor',
  'wall-mounted': 'wall-mounted indoor air quality monitor',
  wearable: 'wearable indoor air quality monitor',
  industrial: 'industrial indoor air quality monitor',
};

export function productTypePhrase(category: string): string | null {
  return PRODUCT_TYPE_PHRASES[category] ?? null;
}

/**
 * 七条之3: the 2-3 chips a buyer scans on a card. Priority picks the
 * discriminating sensors first; T/RH are never padded in (every unit has
 * them). Products outside the IAQ set (radiation, alcohol) fall back to
 * their own headline value. (All 23 records use `sensors` — an earlier
 * claim of a sensing/sensors field fork was a mis-probe, retracted.)
 */
const CHIP_PRIORITY = ['CO2', 'PM2.5', 'HCHO', 'TVOC', 'CO', 'PM10', 'PM1.0', 'AQI'];
const CHIP_LABELS: Record<string, string> = {
  temperature: 'Temp',
  humidity: 'RH',
  radiation: 'Radiation',
  alcohol: 'Alcohol',
};
export function headlineSensors(product: Product, max = 3): string[] {
  const sensors = product.data.sensors ?? [];
  const picked = CHIP_PRIORITY.filter((s) => sensors.includes(s)).slice(0, max);
  if (picked.length > 0) return picked;
  return sensors
    .slice(0, 2)
    .map((s) => CHIP_LABELS[s] ?? s.charAt(0).toUpperCase() + s.slice(1));
}

/**
 * W29: the product page's address is its model, lowercased, with any "/"
 * turned into "-". The slug is still the record's identity in the content
 * collection and in the admin; it just stopped being the URL.
 *
 * ⚠️ This throws rather than mangling. A model carrying a space, a dot or any
 * other character outside [a-z0-9-] would otherwise become a URL that is
 * quietly wrong — or worse, one that collides with another product's. The
 * build stopping with the offending model named is the only outcome that
 * cannot be missed. Measured 2026-08-28: all 22 records are clean.
 */
export function modelPath(model: string): string {
  const path = String(model).toLowerCase().replace(/\//g, '-');
  if (!/^[a-z0-9-]+$/.test(path)) {
    throw new Error(
      `[products] model ${JSON.stringify(model)} does not make a usable URL: ` +
        `"${path}" contains characters outside [a-z0-9-]. ` +
        `Rename the model in the admin, or widen the rule in modelPath().`,
    );
  }
  return path;
}

/** Canonical path of a product page, trailing slash included. */
export function productHref(product: Product): string {
  return `/products/${modelPath(product.data.model)}/`;
}
