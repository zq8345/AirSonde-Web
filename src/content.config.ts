import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Products — contract C1 (frozen 2026-08-09). Fields here mirror that contract
 * exactly; do not add, rename or loosen one without the contract changing first.
 *
 * Required stays required on purpose: a missing field must fail the build, not
 * fall back to "" and ship a silently empty page.
 */
/**
 * Contract v1.4: the allowed values for both taxonomy axes come from
 * src/data/taxonomy.json — the single source of truth the admin will edit.
 * ⛔ Do not re-inline these arrays; a second copy is how the two drift apart.
 *
 * Deleting a value that a product still stores makes z.enum reject that
 * record and the build fails. That is deliberate — it is the backstop behind
 * the admin's delete guard, not an accident.
 */
import taxonomy from './data/taxonomy.json';

const byOrder = (a: { order: number }, b: { order: number }) => a.order - b.order;

export const CATEGORIES = taxonomy.categories
  .slice()
  .sort(byOrder)
  .map((c) => c.value) as [string, ...string[]];

export const SENSORS = taxonomy.sensors
  .slice()
  .sort(byOrder)
  .map((s) => s.value) as [string, ...string[]];

const products = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/products' }),
  schema: z
    .object({
      slug: z
        .string()
        .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug must be lowercase and hyphen-separated'),
      name: z.string().min(1),
      model: z.string().min(1),
      category: z.enum(CATEGORIES),
      sensors: z.array(z.enum(SENSORS)).min(1),
      highlights: z.array(z.string().min(1)).optional(),
      specs: z.record(z.string(), z.string()).optional(),
      moq: z.number().int().positive().optional(),
      images: z.object({
        main: z.string().min(1),
        gallery: z.array(z.string().min(1)).optional(),
      }),
      /** ⚠️ Internal only. Never render this, never let it reach dist/. */
      supplierRef: z.string().url().optional(),
      status: z.enum(['draft', 'published']),
    })
    .strict(),
});

export const collections = { products };
