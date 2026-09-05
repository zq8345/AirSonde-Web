/**
 * /products/ v1 filter axes — DERIVED, never hand-written.
 *
 * 🔴 Joe 2026-09-05 (via 总工): the sensor filter row follows the admin's own sensor table —
 * src/data/taxonomy.json `sensors` (the file admin.airsonde.com edits on its taxonomy page):
 * names and ORDER come from that table; a sensor no published product carries is not rendered
 * (a pill that always filters to nothing is a lie), and appears by itself on the next build
 * once a product is tagged with it. Whatever the admin changes, the site follows.
 *
 * ⛔ No hand-typed list here any more. The design file's grouped pills (one "PM" for
 * PM1.0/2.5/10, "T / RH" for temperature+humidity, "Breath alcohol", "γ radiation") were
 * illustrative and are NOT reproduced — one pill per admin sensor value, admin label.
 * The only display touch is chipLabel(): "CO2" → "CO₂" (a typographic subscript, same as
 * the product page's Sensing chips), never a different word.
 *
 * Categories follow the same rule from taxonomy.json `categories` (see below).
 */
import taxonomy from '../data/taxonomy.json';
import type { Product } from './products';

export type SensorGroup = {
  /** URL-safe key, also the value of ?sensor= (comma-joined when several are selected) */
  key: string;
  label: string;
  /** stored catalog values that belong to this pill — exactly one now (no grouping) */
  values: readonly string[];
};

const TAXONOMY_SENSORS = taxonomy.sensors.slice().sort((a, b) => a.order - b.order);
const TAXONOMY_CATEGORIES = taxonomy.categories.slice().sort((a, b) => a.order - b.order);

const keyOf = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** The sensor pills to render: every admin sensor (admin order, admin label) that at least
 *  one published product carries. A stored value the admin table no longer lists still
 *  renders (raw value as label) rather than silently vanishing. */
export function sensorGroupsFor(products: readonly Product[]): SensorGroup[] {
  const present = new Set<string>();
  for (const p of products) for (const s of p.data.sensors) present.add(s);

  const out: SensorGroup[] = [];
  for (const s of TAXONOMY_SENSORS) {
    if (!present.has(s.value)) continue;
    out.push({ key: keyOf(s.value), label: chipLabel(s.label), values: [s.value] });
    present.delete(s.value);
  }
  for (const v of present) out.push({ key: keyOf(v), label: chipLabel(v), values: [v] });
  return out;
}

/** Group keys a product matches — rendered into data-s so the client filter reads the same derivation. */
export function sensorKeysOf(product: Product, groups: readonly SensorGroup[]): string[] {
  const have = new Set(product.data.sensors);
  return groups.filter((g) => g.values.some((v) => have.has(v))).map((g) => g.key);
}

/** Categories with published products, in taxonomy order (the design's order: desktop, portable, wall, other). */
export function categoriesInTaxonomyOrder(products: readonly Product[]): string[] {
  const present = new Set(products.map((p) => p.data.category));
  const ordered = TAXONOMY_CATEGORIES.map((c) => c.value).filter((v) => present.has(v));
  // a value the taxonomy no longer lists still renders (raw), rather than vanishing
  for (const v of present) if (!ordered.includes(v)) ordered.push(v);
  return ordered;
}

/**
 * List order. The design lays cards out desktop → portable → wall → other, with the
 * homepage's featured models leading. getPublishedProducts() sorts by NAME, which put the
 * breathalysers first — so the order is derived instead: taxonomy category order, then the
 * homepage featured list (its order), then the remaining models in natural numeric order
 * (AK3, AK4, AK8, AK16A … not AK16A, AK3 …). The design's exact hand order inside a
 * category is not reproducible from data and is not attempted.
 */
export function listOrder(products: readonly Product[], featuredSlugs: readonly string[]): Product[] {
  const catRank = new Map(TAXONOMY_CATEGORIES.map((c, i) => [c.value, i]));
  const featRank = new Map(featuredSlugs.map((s, i) => [s, i]));
  const natural = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
  return products.slice().sort((a, b) => {
    const c = (catRank.get(a.data.category) ?? 99) - (catRank.get(b.data.category) ?? 99);
    if (c) return c;
    const f = (featRank.get(a.data.slug) ?? 99) - (featRank.get(b.data.slug) ?? 99);
    if (f) return f;
    return natural.compare(a.data.model, b.data.model);
  });
}

/** Card chip text for a stored sensor value: the design writes CO₂ with a subscript. */
export function chipLabel(value: string): string {
  return value === 'CO2' ? 'CO₂' : value;
}
