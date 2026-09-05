/**
 * /products/ v1 filter axes — DERIVED from the catalog, never hand-written.
 *
 * 🔴 The design file (products-v1.html) carries a hand-typed SENSORS map and
 * category counts. Those were illustrative; the SPEC (web-products-implement)
 * says counts, cards and the sensor mapping all come from the product records.
 * So this module only fixes two things the catalog cannot know:
 *   1. how stored sensor values GROUP into buyer-facing pills (the design shows
 *      one "PM" pill for PM1.0/2.5/10 and one "T / RH" for temperature+humidity),
 *      and the display label of each group;
 *   2. which stored values are device features rather than measured quantities
 *      (Time, Data-History, APP) and therefore are not offered as sensor filters.
 * Everything else — which pills exist, which cards match, every count — is
 * computed from the published products at build time and re-computed on the
 * client from data attributes that were themselves rendered from the records.
 *
 * ⚠️ Any catalog sensor value NOT named below still gets a pill (taxonomy label,
 * taxonomy order) as long as a published product carries it. A new sensor in
 * the admin therefore shows up here on the next build without a code change —
 * and a value that is really a feature shows up too, until someone adds it to
 * NOT_A_SENSOR. Stated rather than hidden.
 */
import taxonomy from '../data/taxonomy.json';
import type { Product } from './products';

export type SensorGroup = {
  /** URL-safe key, also the value of ?sensor= */
  key: string;
  label: string;
  /** stored catalog values that belong to this pill */
  values: readonly string[];
};

/** Design order and labels (products-v1.html #sfilters). Membership is still checked against the catalog. */
const DESIGN_GROUPS: readonly SensorGroup[] = [
  { key: 'co2', label: 'CO₂', values: ['CO2'] },
  { key: 'pm', label: 'PM', values: ['PM1.0', 'PM2.5', 'PM10'] },
  { key: 'tvoc', label: 'TVOC', values: ['TVOC'] },
  { key: 'hcho', label: 'HCHO', values: ['HCHO'] },
  { key: 'co', label: 'CO', values: ['CO'] },
  { key: 'alcohol', label: 'Breath alcohol', values: ['alcohol'] },
  { key: 'radon', label: 'Radon', values: ['Radon'] },
  { key: 'radiation', label: 'γ radiation', values: ['radiation'] },
  { key: 'trh', label: 'T / RH', values: ['temperature', 'humidity'] },
];

/** Stored values that describe a device feature, not something the unit measures. */
const NOT_A_SENSOR: ReadonlySet<string> = new Set(['Time', 'Data-History', 'APP']);

const TAXONOMY_SENSORS = taxonomy.sensors.slice().sort((a, b) => a.order - b.order);
const TAXONOMY_CATEGORIES = taxonomy.categories.slice().sort((a, b) => a.order - b.order);

const keyOf = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** The sensor pills to render: design groups that at least one published product
 *  matches, then every other measured value present in the catalog (taxonomy order). */
export function sensorGroupsFor(products: readonly Product[]): SensorGroup[] {
  const present = new Set<string>();
  for (const p of products) for (const s of p.data.sensors) present.add(s);

  const out: SensorGroup[] = DESIGN_GROUPS.filter((g) => g.values.some((v) => present.has(v)));
  const covered = new Set(DESIGN_GROUPS.flatMap((g) => g.values));

  for (const s of TAXONOMY_SENSORS) {
    if (!present.has(s.value) || covered.has(s.value) || NOT_A_SENSOR.has(s.value)) continue;
    out.push({ key: keyOf(s.value), label: s.label, values: [s.value] });
  }
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
