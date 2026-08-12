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
import heroImg from '../assets/photos/hero-joe-workspace-clean.webp';

export const HERO_PHOTO = {
  src: heroImg,
  alt: 'Man working at a desk with an AirSonde air quality monitor beside his laptop',
  focus: '32% 40%', // y40: image rides lower, the device drops ~12px clear of the copy at 1440
  /** 'banner' = image speaks, copy sr-only · 'banner-clean' = cleaned wall,
   *  compact visible headline · 'scene' = normal text-over-wash hero */
  mode: 'banner-clean' as 'banner' | 'banner-clean' | 'scene',
} as const;

/** W9 §2 — products section (wanew "Design by Wanew" slot): curated eight,
 *  2×4 on desktop, "All products" top-right. §3 (form-factor rail) lives
 *  INSIDE this section as an h3 subsection — wanew's own reasoning: 先看货,
 *  form factor is another path in, not a gate. */
export const PRODUCTS_HOME = {
  eyebrow: 'Products',
  heading: 'Built to carry your name',
  allLink: 'All products',
  slugs: [
    'co2-tvoc-hcho-desktop-monitor',
    'wide-screen-co2-monitor',
    '16in1-large-display-monitor',
    'oval-wifi-air-quality-monitor',
    'wifi-widescreen-air-quality-monitor',
    'portrait-aqi-desktop-monitor',
    'handheld-air-quality-analyser',
    'portable-co-alarm',
  ],
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
  heading: 'Our advantages',
  qualityTitle: 'Quality control',
  supportTitle: 'Engineering support',
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
