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
 * 🔴 Do NOT treat this enum as a safety net for deletions. Measured 2026-08-26
 * (W18 criterion 3): removing a value that products still store only fails the
 * build when the content store starts cold. Astro re-validates records when
 * this config file changes — editing taxonomy.json alone does not count, so a
 * whole catalogue can pass validation that should have rejected it, and the
 * failure surfaces later, on an unrelated commit, with the cause long gone.
 * ⇒ The admin's delete guard is the only real defence. Nothing here backs it up.
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
      /**
       * Hand-written <meta name="description"> / og:description for the
       * product page (Joe 2026-09-03). Optional: absent or blank falls back
       * to the page's derived sentence. The admin hard-limits it to 160 and
       * omits the field on empty — this schema mirrors the limit so a record
       * edited by other means cannot exceed it. ⚠️ Because this schema is
       * .strict(), the field must exist HERE before any record carries it,
       * or every build goes red the moment the admin saves one.
       */
      metaDescription: z.string().trim().max(160).optional(),
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
