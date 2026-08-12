/**
 * Copy deck for /about/ (W4 page 2). Drafted by Web per 改令二/四, 总工 verifies.
 *
 * Facts discipline:
 * - The six factory numbers are REAL figures from Joe's manufacturing group
 *   (same set wanew.com/about publishes) — authorized by Joe 2026-08-11 for
 *   AirSonde as the group's IAQ product line.
 * - FCC / CE / RoHS / ISO 9001 appear ONLY as company-level compliance
 *   capability. No per-model certificate is claimed anywhere: those documents
 *   are not in hand, and B2B buyers ask for certificate numbers.
 */

import heroImg from '../assets/photos/factory/factory-assembly.webp';
import imgCnc from '../assets/photos/factory/factory-cnc.webp';
import imgQc from '../assets/photos/factory/factory-qc.webp';
import imgWarehouse from '../assets/photos/factory/factory-warehouse.webp';
import imgShipping from '../assets/photos/factory/factory-shipping.webp';
import imgOffice from '../assets/photos/factory/factory-office.webp';

export const ABOUT_META = {
  title: 'About — The Manufacturing Group Behind AirSonde | AirSonde',
  description:
    'AirSonde is the indoor air quality product line of an established Shenzhen manufacturing group: 15+ years of OEM/ODM production, 150+ staff, in-house tooling, assembly and QC.',
} as const;

export const ABOUT_HERO = {
  photo: {
    src: heroImg,
    alt: 'Assembly line at the manufacturing facility behind AirSonde',
    focus: '50% 42%',
  },
  eyebrow: 'About AirSonde',
  heading: 'A product line, backed by a factory',
  lead: 'The IAQ line of an established Shenzhen manufacturing group. The brand is new; the floor behind it is not.',
} as const;

export const ABOUT_STORY = {
  heading: 'Why AirSonde exists',
  paragraphs: [
    'Monitors are easy to find. A manufacturer who builds them under your name — and stays out of your market — is not.',
    'You bring the market and the brand. The factory brings fifteen years of OEM/ODM electronics production, running at scale.',
  ],
} as const;

/** Real group figures, Joe-authorized 2026-08-11. Same set as wanew.com/about. */
export const ABOUT_STATS = {
  heading: 'The group in numbers',
  items: [
    { value: '15+', label: 'Years of OEM / ODM manufacturing' },
    { value: '150+', label: 'Production and engineering staff' },
    { value: '200+', label: 'Patents and registrations' },
    { value: '5,000m²', label: 'Production facility' },
    { value: '600,000+', label: 'Units per month capacity' },
    { value: '130+', label: 'Countries shipped to' },
  ],
} as const;

export const ABOUT_FACTORY = {
  heading: 'Inside the facility',
  intro: 'The same floor that builds our group’s other lines builds AirSonde.',
  photos: [
    { src: imgCnc, alt: 'Injection moulding and machining hall', caption: 'Tooling & moulding' },
    { src: imgQc, alt: 'Engineer at a test bench with measurement instruments', caption: 'Testing' },
    { src: imgWarehouse, alt: 'Racked warehouse aisle with boxed stock', caption: 'Warehousing' },
    { src: imgShipping, alt: 'Palletised cartons staged for dispatch', caption: 'Dispatch' },
    { src: imgOffice, alt: 'Engineering and sales office', caption: 'Engineering & support' },
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
  heading: 'Compliance engineering',
  body: 'Engineered for FCC, CE and RoHS routes under ISO 9001 quality management. Your model’s certification is scoped per programme.',
  badges: ['FCC', 'CE', 'RoHS', 'ISO 9001'],
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

export const ABOUT_CTA = {
  heading: 'Scope a programme with the factory behind it',
  body: 'Send the market, the sensing set and the volumes.',
} as const;
