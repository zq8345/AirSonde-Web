/**
 * Copy deck for /about/ (W4 page 2). Drafted by Web per 改令二/四, 总工 verifies.
 *
 * Facts discipline:
 * - The six factory numbers are REAL figures from Joe's manufacturing group
 *   (same set wanew.com/about publishes) — authorized by Joe 2026-08-11 for
 *   AirSonde as the group's IAQ product line.
 * - 🔴 总工裁定 2026-08-12: NO certification names anywhere on this site —
 *   not as badges, not as "engineered for X routes", not "under ISO 9001".
 *   Softened wording is still a capability implication. The only honest line
 *   is "certification is scoped per programme/model" with zero names, until
 *   the factory hands over real per-model documents.
 */

// W13: Joe supplied a rendered industrial-park view for the About hero. The
// real production-line photo stays imported below — flip HERO_SOURCE back to
// 'production-line' to revert in one line.
import heroPark from '../assets/photos/about-hero-industrial-park.webp';
import heroImg from '../assets/photos/factory/factory-assembly.webp';
import imgCnc from '../assets/photos/factory/factory-cnc.webp';
import imgQc from '../assets/photos/factory/factory-qc.webp';
import imgWarehouse from '../assets/photos/factory/factory-warehouse.webp';
import imgShipping from '../assets/photos/factory/factory-shipping.webp';
import imgOffice from '../assets/photos/factory/factory-office.webp';

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

export const ABOUT_STORY = {
  kicker: 'Built with intent',
  heading: 'Why AirSonde exists',
  paragraphs: [
    'Monitors are easy to find. A manufacturer who builds them under your name — and stays out of your market — is not.',
    'You bring the market and the brand. The factory has been building OEM/ODM electronics since 2015, running at scale.',
  ],
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

/** W10: photo under the story statement + the where-line (wanew ab8-story). */
export const ABOUT_WHERE = {
  photo: { src: imgOffice, alt: 'Engineering and sales office' },
  label: 'Engineering & manufacturing',
  place: 'Shenzhen · Greater Bay Area',
} as const;

/** W10: six labelled tiles (wanew "Manufacturing Capability" grid — same
 *  reviewed factory set, no Starlink product close-ups). */
export const ABOUT_FACTORY = {
  heading: 'Manufacturing capability',
  intro: 'The same floor that builds our group’s other lines builds AirSonde.',
  photos: [
    { src: heroImg, alt: 'Assembly line at the manufacturing facility', caption: 'Assembly line' },
    { src: imgCnc, alt: 'Injection moulding and machining hall', caption: 'Machining' },
    { src: imgOffice, alt: 'Engineering and sales office', caption: 'R&D & office' },
    { src: imgQc, alt: 'Engineer at a test bench with measurement instruments', caption: 'QC & testing' },
    { src: imgWarehouse, alt: 'Racked warehouse aisle with boxed stock', caption: 'Warehouse' },
    { src: imgShipping, alt: 'Palletised cartons staged for dispatch', caption: 'Packing & dispatch' },
  ],
} as const;

export const ABOUT_QUALITY = {
  heading: 'How quality is controlled',
  intro: 'Five checkpoints between components and a sealed carton.',
  steps: [
    {
      title: 'Incoming inspection',
      body: 'Components checked against spec before the line.',
    },
    {
      title: 'In-process checks',
      body: 'Fit, soldering and connections verified in-line.',
    },
    {
      title: 'Functional testing',
      body: 'Every unit powers on and reads plausible values.',
    },
    {
      title: 'Final inspection',
      body: 'Finished goods sampled against the agreed spec.',
    },
    {
      title: 'Packing verification',
      body: 'Packaging and labelling confirmed before sealing.',
    },
  ],
} as const;

export const ABOUT_COMPLIANCE = {
  heading: 'Certification',
  body: 'Certification is scoped per programme and per model. The route your market requires is agreed in writing before anything is built.',
} as const;

export const ABOUT_SERVICES = {
  heading: 'Two ways to work with us',
  cards: [
    {
      title: 'OEM — build to your spec',
      body: 'You arrive with a finished spec or product. We industrialise and build it under your brand.',
      points: ['Your design and BOM', 'Tooling and production setup', 'Your packaging and identity'],
    },
    {
      title: 'ODM — start from our platforms',
      body: 'Start from a reference monitor; we adapt sensing, enclosure, display and firmware.',
      points: ['Reference platform selection', 'Sensing set and firmware adapted', 'Ships as your product'],
    },
  ],
} as const;

export const ABOUT_PROCESS = {
  heading: 'How a programme runs',
  steps: [
    {
      step: '01',
      title: 'Tell us the programme',
      body: 'Market, sensing set, volumes, certification route.',
    },
    {
      step: '02',
      title: 'We come back with a build path',
      body: 'Which platform fits, what changes cost, what lead times follow.',
    },
    {
      step: '03',
      title: 'Specification and samples',
      body: 'Fixed in writing before anything is built. Samples follow.',
    },
    {
      step: '04',
      title: 'Production under your brand',
      body: 'Your name on housing, display, app and box. Nothing points back to us.',
    },
  ],
} as const;

export const ABOUT_EXPECT = {
  heading: 'What to expect',
  items: [
    'An engineer replies, normally within two business days.',
    'Straight answers on cost and time, before you commit.',
    'White-label discipline: nothing points back to us.',
  ],
} as const;

/**
 * W10: three honest Q&As (wanew "Compatibility & FAQ" slot). Answers are
 * existing verified sentences from this file — only the questions are new.
 */
export const ABOUT_FAQ = {
  kicker: 'Straight answers',
  heading: 'FAQ',
  items: [
    {
      q: 'Who actually builds AirSonde monitors?',
      a: 'The IAQ line of an established Shenzhen manufacturing group. The brand is new; the floor behind it is not.',
    },
    {
      q: 'Are the monitors certified?',
      a: 'Certification is scoped per programme and per model — agreed before production, with documents provided once the factory confirms them.',
    },
    {
      q: 'Will AirSonde appear anywhere on our product?',
      a: 'Your name on housing, display, app and box. Nothing points back to us.',
    },
  ],
} as const;

export const ABOUT_CTA = {
  heading: 'Scope a programme with the factory behind it',
  body: 'Send the market, the sensing set and the volumes.',
} as const;
