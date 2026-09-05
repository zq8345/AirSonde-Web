/**
 * W33: every curated product reference on the site, checked against the
 * published set — the data half of build-diagnostics.json.
 *
 * 🔴 Why this is DERIVED here rather than collected from the pages: the pages
 * that render curated lists (index, guides/[slug], solutions/[scene]) each
 * warn on stderr when a slug matches nothing, but Astro gives no ordering
 * guarantee between page builds — a collector filled during their renders
 * could be read by build-diagnostics.json.ts before any of them ran, and the
 * result would depend on build order. Re-deriving from the same data the
 * pages read is order-independent and cannot go stale against them, because
 * there is no second list: this file imports the very arrays they render.
 *
 * ⚠️ Standing limitation, stated rather than hidden: a NEW curated list added
 * elsewhere later is invisible here until someone adds its source below. The
 * page-side stderr warnings stay as the local net for that gap.
 */
import { HOME_V4 } from '../data/site';
import { GUIDES } from '../data/guides';
import { SCENES_DATA } from '../data/solutions';

export type CuratedSkip = {
  kind: 'curated-ref';
  /** where the reference lives, e.g. "home.featuredSlugs" */
  source: string;
  slug: string;
  detail: string;
};

/** All curated refs that match no published product. `published` is the slug
 *  set of the products the build actually rendered. */
export function curatedRefSkips(published: ReadonlySet<string>): CuratedSkip[] {
  const out: CuratedSkip[] = [];

  // Homepage v4 (2026-09-05): the six featured cards come from
  // homeV4.products.featured; the older home.featuredSlugs list and the
  // form-factor rail are no longer rendered anywhere, so they are no longer
  // checked here — a check on a list no page reads would only report noise.
  for (const f of HOME_V4.products.featured) {
    if (!published.has(f.slug)) {
      out.push({
        kind: 'curated-ref',
        source: 'homeV4.products.featured (site-content.json)',
        slug: f.slug,
        detail: 'featured card not rendered on the homepage',
      });
    }
  }

  for (const guide of GUIDES) {
    for (const slug of guide.productSlugs) {
      if (!published.has(slug)) {
        out.push({
          kind: 'curated-ref',
          source: `guides/${guide.slug} productSlugs (guides.ts)`,
          slug,
          detail: 'product card not rendered in the guide',
        });
      }
    }
  }

  for (const scene of SCENES_DATA) {
    for (const slug of scene.productSlugs) {
      if (!published.has(slug)) {
        out.push({
          kind: 'curated-ref',
          source: `solutions/${scene.slug} productSlugs (solutions.ts)`,
          slug,
          detail: 'product not rendered in the scene strip',
        });
      }
    }
  }

  return out;
}
