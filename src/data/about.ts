/**
 * About facts — the single source for the company figures and the About page meta.
 *
 * 2026-09-05: the About page moved to Design System v1 (about.astro reads its copy from
 * site-content.json `aboutV1`); the W10 copy deck that used to live here (story, where-line,
 * capability tiles, quality steps, services, process, expect, FAQ, CTA) had no reader left
 * and was removed. What stays is what other pages depend on:
 *   - ABOUT_META  — /about/ title + description (the six figures appear in the description)
 *   - ABOUT_HERO  — the park photo, also the homepage factory stage
 *   - ABOUT_STATS — the six figures, read by /about/ and the homepage (Joe's ruling 2026-09-05)
 *
 * Certification names: the 2026-08-12 red line was lifted on 2026-09-05 with a boundary —
 * they may appear only in the About compliance cards and product spec rows; the build gate
 * (scripts/check-dist.mjs, 2c) fails on any other occurrence.
 */

// W13: Joe supplied a rendered industrial-park view for the About hero. The
// real production-line photo stays imported below — flip HERO_SOURCE back to
// 'production-line' to revert in one line.
import heroPark from '../assets/photos/about-hero-industrial-park.webp';
import heroImg from '../assets/photos/factory/factory-assembly.webp';

export const ABOUT_META = {
  title: 'About — The Manufacturing Group Behind AirSonde | AirSonde',
  description:
    'AirSonde is the indoor air quality product line of an established Shenzhen manufacturing group — founded in 2015, 120+ staff, in-house tooling, assembly and QC.',
} as const;

/** 'industrial-park' = Joe's rendered view · 'production-line' = the real photo */
const HERO_SOURCE: 'industrial-park' | 'production-line' = 'industrial-park';

export const ABOUT_HERO = {
  photo:
    HERO_SOURCE === 'industrial-park'
      ? {
          src: heroPark,
          // ⛔ no wording that turns the render into a factual claim about a
          // building we own — 总工 W13
          alt: 'Industrial park exterior',
          /** W46-B: 62 -> 50. At 2560 (W43 canvas) the title's second line
           *  ended over darker mid-frame landscaping and read 4.48 on the
           *  worst rendition; at 50 the band lifts ~4.4 points and the same
           *  glyphs sit on brighter ground — measured 4.48 -> see report. */
          focus: '50% 56%',
        }
      : {
          src: heroImg,
          alt: 'Assembly line at the manufacturing facility behind AirSonde',
          focus: '50% 42%',
        },
  eyebrow: 'About AirSonde',
  heading: 'A product line, backed by a factory',
  lead: 'The IAQ line of an established Shenzhen manufacturing group. The brand is new; the floor behind it is not.',
} as const;

/**
 * Real group figures — Joe's site-wide ruling 2026-09-05 (supersedes the 2026-08-11 set):
 * founded 2015 · 120+ staff · 200+ patents · 5,000m² · 600,000+ units/month · 100+ countries.
 * 🔴 Single source: the homepage stats read these values (index.astro pairs them with its
 * own short labels by position — keep the ORDER stable, or the labels go wrong).
 */
export const ABOUT_STATS = {
  heading: 'The group in numbers',
  items: [
    { value: '2015', label: 'Founded' },
    { value: '120+', label: 'Production and engineering staff' },
    { value: '200+', label: 'Patents and registrations' },
    { value: '5,000m²', label: 'Production facility' },
    { value: '600,000+', label: 'Units per month capacity' },
    { value: '100+', label: 'Countries shipped to' },
  ],
} as const;

