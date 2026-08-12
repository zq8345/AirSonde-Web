/**
 * Copy deck for the homepage's OWN section labels (W4 sample → W9 wanew-skeleton
 * rebuild). Existing copy stays in site.ts / about.ts / solutions.ts / guides.ts
 * and is rendered verbatim — the assertions over it (OEM/ODM counts, banned
 * words) must not move. Nothing in this file may contain OEM / ODM / tooling /
 * certification words: new labels must not shift those counts.
 */

import heroImg from '../assets/photos/hero-composite-a.webp';

export const HERO_PHOTO = {
  // W6②: the scene now CONTAINS the product (AS-D3 composited onto the coffee
  // table by scripts/build-hero-composite.mjs) — the W4 floating-card overlay
  // is retired per Joe. Focus keeps the table and device in frame.
  src: heroImg,
  alt: 'Living room with an AirSonde air quality monitor standing on the coffee table',
  focus: '55% 56%',
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
