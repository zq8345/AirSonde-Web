/**
 * Copy deck for the homepage's OWN section labels (W4 sample → W9 wanew-skeleton
 * rebuild). Existing copy stays in site.ts / about.ts / solutions.ts / guides.ts
 * and is rendered verbatim — the assertions over it (OEM/ODM counts, banned
 * words) must not move. Nothing in this file may contain OEM / ODM / tooling /
 * certification words: new labels must not shift those counts.
 */

// Joe 插队 2026-08-12: his banner, evolved. He picked the image BECAUSE our
// product is in it; hiding our headline behind sr-only left the supplier's
// baked consumer copy as the page's visible title (总工: B2B 定位句不能被
// 顶替). 'banner-clean' is the both-ways version: the baked text is painted
// out at build time (scripts/clean-hero-banner.mjs), our own compact headline
// returns on the cleaned wall, the device stays fully in frame. All three
// assets remain: hero-composite-a / hero-joe-workspace / -clean.
// Joe 2026-08-12 (第二张图): 3820×2160 workspace shot, no baked text, wide
// empty wall on the left — the nav now floats over it (his instruction), so
// the hero goes back to full-bleed with the header transparent above it.
// W49 (Joe 二次知情拍板 2026-08-31: 「首页的hero图用V2」): v2 on the
// banner-over overlay. 🔴 宪法 §3's ≥4.5 floor is EXEMPTED for this hero by
// Joe's knowing decision — he was shown the measured numbers twice (title
// worst-contrast 1.00 over the dark shelf frames, no focus in either axis
// can move the glyphs off them; the full derivation is in the W41-B
// report). The values below are the least-harm set from that derivation:
// subjects whole first, title over the least-dark ground second.
// v1 stays tracked as the revert; the W44 'side' mode stays built.
import heroImg from '../assets/photos/home-hero-ak34-family-v2.webp';

export const HERO_PHOTO = {
  src: heroImg,
  alt: 'AK34 monitor on a coffee table showing CO2 and comfort readings, with parents and a child building wooden blocks on the sofa behind it',
  /**
   * Measured on v2: at 1440 the box is ~2.22:1 so only ~7.4% of the width is
   * cropped; 60% keeps the family whole (father's edge x92, margin 5 points)
   * while giving up only the far-left blurred chair.
   */
  focus: '60% 50%',
  /**
   * ⚠️ 375 shows only 26% of this image's width. 66% puts the window at
   * x 48.8-74.8 — device whole with margin, the mother entering from the
   * right (crops looked at). The title lands on the shelf unit either way;
   * that is the exempted trade above, not an oversight.
   */
  focusNarrow: '66% 50%',
  /** 'banner-over' (Joe): nav AND copy float over the full-bleed image ·
   *  'side' (W44) = text on page bg, image as its own panel · others =
   *  earlier overlay modes */
  mode: 'banner-over' as
    | 'banner'
    | 'banner-clean'
    | 'banner-split'
    | 'banner-under'
    | 'banner-over'
    | 'side'
    | 'scene',
} as const;

/** W9 §2 — products section (wanew "Design by Wanew" slot): curated eight,
 *  2×4 on desktop, "All products" top-right. §3 (form-factor rail) lives
 *  INSIDE this section as an h3 subsection — wanew's own reasoning: 先看货,
 *  form factor is another path in, not a gate. */
export const PRODUCTS_HOME = {
  eyebrow: 'Products',
  heading: 'Built to carry your name',
  allLink: 'All products',
  /**
   * ⚠️ W25: the eight featured slugs used to live here. They are now
   * `home.featuredSlugs` in site-content.json (exported as `FEATURED_SLUGS`),
   * because the admin can write that file and cannot write this one. Which
   * products the homepage shows is the admin's to change; the section's own
   * labels below are not.
   */
  formFactorHeading: 'Shop by form factor',
  /** preferred representative image per category; categories themselves are
   *  derived from the live product data, never hardcoded */
  formFactorImages: {
    desktop: 'co2-tvoc-hcho-desktop-monitor',
    portable: 'portable-co-alarm',
  } as Record<string, string>,
} as const;

/** W9 §4 — scene tabs + one big panel (wanew "For every environment").
 *  Captions come from solutions.ts homeLine (single source). */
export const SCENES_HOME = {
  eyebrow: 'Solutions',
  heading: 'For every environment',
  sub: 'One sensing core, different rooms.',
  readMore: 'Read more',
} as const;

/** W9 §5 — about band labels; the copy itself is imported from about.ts
 *  (same-source rule: About page owns the factory facts). */
export const ABOUT_HOME = {
  eyebrow: 'About us',
  learnMore: 'Learn more',
} as const;

/** W9 §6 — why-section labels; card copy is composed in index.astro from
 *  site.ts / about.ts sentences (zero new claims). 🔴 wanew's cert strip
 *  below this section is deliberately NOT ported — we hold no product
 *  certificates and the zero-certification red line stands. */
export const WHY_HOME = {
  eyebrow: 'Why AirSonde',
  /**
   * W41 (宪法 §5): this section's one job is answering "why not source the
   * same-looking unit from a marketplace listing?" — the old "Our advantages"
   * said nothing. ⚠️ The four argument cards live in index.astro, NOT here:
   * this file must stay free of the positioning words (see header).
   */
  heading: 'Why brands come to us directly',
} as const;

/** W9 §7 — guides section labels; cards come from guides.ts. */
export const GUIDES_HOME = {
  eyebrow: 'Guides',
  heading: 'Working notes, not marketing',
  viewAll: 'View all guides',
} as const;

/** W9 §8 — CTA band label; buttons reuse HERO.primaryCta and SITE.email. */
export const CTA_HOME = {
  eyebrow: 'Contact',
} as const;
