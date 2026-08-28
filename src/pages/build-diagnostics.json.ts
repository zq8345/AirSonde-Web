import type { APIRoute } from 'astro';
import { buildSkips, getPublishedProducts } from '../lib/products';

/**
 * A machine-readable list of what this build left out.
 *
 * ⚠️ Why this file exists: on 2026-08-28 a curated slug pointing at a deleted
 * product froze the whole site for nine hours, and the only signal was a line
 * in a build log nobody reads. Skipping instead of failing fixes the freeze,
 * but a skip that is only announced in the log has the same defect. This gives
 * it an outlet something else can read; the admin will surface it where Joe
 * actually looks.
 *
 * ⛔ Not linked from anywhere — it is a build artefact, not a page. It has to
 * be reachable over HTTP so the admin can fetch it; that is the whole point.
 * The
 * dangling-redirect section is merged in afterwards by scripts/check-dist.mjs,
 * which is the only thing that knows what the redirects resolved to.
 */
export const GET: APIRoute = async () => {
  // Call this first: the skip list is filled in while products are resolved.
  const products = await getPublishedProducts();
  const skips = buildSkips();

  return new Response(
    JSON.stringify(
      {
        $comment:
          'What this build left out. Written by src/pages/build-diagnostics.json.ts; danglingRedirects is merged in by scripts/check-dist.mjs after the build.',
        publishedProducts: products.length,
        skippedProducts: skips.length,
        skips,
        danglingRedirects: [],
      },
      null,
      2,
    ) + '\n',
    { headers: { 'content-type': 'application/json' } },
  );
};
