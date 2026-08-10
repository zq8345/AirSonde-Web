import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Products — contract C1 (frozen 2026-08-09). Fields here mirror that contract
 * exactly; do not add, rename or loosen one without the contract changing first.
 *
 * Required stays required on purpose: a missing field must fail the build, not
 * fall back to "" and ship a silently empty page.
 */
export const CATEGORIES = [
  'desktop',
  'portable',
  'wall-mounted',
  'wearable',
  'industrial',
  'other',
] as const;

export const SENSORS = [
  'CO2',
  // Added by contract v1.1 (2026-08-10): household CO alarms are indoor air
  // safety, and neither CO2 nor combustible-gas describes them.
  'CO',
  'PM1.0',
  'PM2.5',
  'PM10',
  'HCHO',
  'TVOC',
  'temperature',
  'humidity',
  'AQI',
  'radiation',
  'alcohol',
  'WBGT',
  'combustible-gas',
] as const;

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
