import type { APIRoute } from 'astro';
import { getPublishedProducts, productHref } from '../lib/products';

/**
 * W30-B: slug → real address, machine-readable.
 *
 * ⚠️ Why: W29 moved product URLs from the record slug to the model, so the
 * slug — which is still the record's identity in the admin and in every
 * curated list — no longer says where the page lives. The admin (and anything
 * else holding a slug) can fetch this instead of re-implementing modelPath()
 * and drifting from it: this file is produced by the same functions that
 * routed the pages, so it cannot disagree with them.
 *
 * ⛔ Published products only. A slug missing from here either is not
 * published or does not exist — build-diagnostics.json says which builds
 * skipped what.
 */
export const GET: APIRoute = async () => {
  const products = await getPublishedProducts();

  const refs = products
    .map((p) => ({
      slug: p.data.slug,
      model: p.data.model,
      path: productHref(p),
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  return new Response(
    JSON.stringify(
      {
        $comment:
          'slug -> live URL for every published product. Written by src/pages/product-refs.json.ts from the same modelPath() that routes the pages.',
        count: refs.length,
        bySlug: Object.fromEntries(refs.map((r) => [r.slug, r.path])),
        refs,
      },
      null,
      2,
    ) + '\n',
    { headers: { 'content-type': 'application/json' } },
  );
};
