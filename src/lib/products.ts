import { getCollection, type CollectionEntry } from 'astro:content';
import taxonomy from '../data/taxonomy.json';

export type Product = CollectionEntry<'products'>;

/**
 * Only files directly under src/assets/products/ are globbed. Draft artwork
 * lives in src/assets/products/_draft/ and is deliberately outside this
 * pattern, so a draft image can never be emitted into dist/.
 */
const IMAGES = import.meta.glob<{ default: ImageMetadata }>('/src/assets/products/*.webp', {
  eager: true,
});

/**
 * `products/foo.webp` -> the imported asset.
 * Throws rather than falling back: a missing image must fail the build, not
 * ship a card with a broken <img>.
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

/** Published products only — draft records never reach a page. */
export async function getPublishedProducts(): Promise<Product[]> {
  const products = await getCollection('products', ({ data }) => data.status === 'published');
  return products.sort((a, b) => a.data.name.localeCompare(b.data.name));
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
