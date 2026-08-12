import { getCollection, type CollectionEntry } from 'astro:content';

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

export const CATEGORY_LABELS: Record<string, string> = {
  desktop: 'Desktop',
  portable: 'Portable',
  'wall-mounted': 'Wall-mounted',
  wearable: 'Wearable',
  industrial: 'Industrial',
  other: 'Other',
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

/**
 * 七条之3: the 2-3 chips a buyer scans on a card. Priority picks the
 * discriminating sensors first; T/RH are never padded in (every unit has
 * them). Products outside the IAQ set (radiation, alcohol) fall back to
 * their own headline value. Data uses `sensing` on the original records and
 * `sensors` on admin-created ones — accept both.
 */
const CHIP_PRIORITY = ['CO2', 'PM2.5', 'HCHO', 'TVOC', 'CO', 'PM10', 'PM1.0', 'AQI'];
const CHIP_LABELS: Record<string, string> = {
  temperature: 'Temp',
  humidity: 'RH',
  radiation: 'Radiation',
  alcohol: 'Alcohol',
};
export function headlineSensors(product: Product, max = 3): string[] {
  const data = product.data as { sensing?: readonly string[]; sensors?: readonly string[] };
  const sensing = data.sensing ?? data.sensors ?? [];
  const picked = CHIP_PRIORITY.filter((s) => sensing.includes(s)).slice(0, max);
  if (picked.length > 0) return picked;
  return sensing
    .slice(0, 2)
    .map((s) => CHIP_LABELS[s] ?? s.charAt(0).toUpperCase() + s.slice(1));
}
