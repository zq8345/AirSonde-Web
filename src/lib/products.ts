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
