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
  lead: 'AirSonde is the indoor air quality line of an established Shenzhen manufacturing group. The brand is new; the production floor behind it is not.',
} as const;

export const ABOUT_STORY = {
  heading: 'Why AirSonde exists',
  paragraphs: [
    'Brands and importers keep meeting the same wall: consumer-grade air quality monitors are easy to find, but a manufacturing partner who will build them under your name — and stay out of your market — is not.',
    'AirSonde packages what our group has done for fifteen years — OEM and ODM electronics manufacturing — into one focused programme for indoor air quality monitors: CO2, carbon monoxide, particulate, formaldehyde and TVOC sensing, in desktop and portable form factors.',
    'You bring the market and the brand. The factory brings tooling, assembly, calibration and quality control that already run at production scale.',
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
  intro: 'The same floor that builds our group’s other product lines builds AirSonde monitors.',
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
  intro: 'Five checkpoints between incoming components and a sealed carton.',
  steps: [
    {
      title: 'Incoming inspection',
      body: 'Components and sensor modules are checked against specification before they reach the line.',
    },
    {
      title: 'In-process checks',
      body: 'Stations along the assembly line verify fit, soldering and connections as units are built.',
    },
    {
      title: 'Functional testing',
      body: 'Every unit powers on, reads its sensors and reports plausible values before it moves on.',
    },
    {
      title: 'Final inspection',
      body: 'Sampled finished goods are inspected against the agreed spec — housing, display, firmware identity.',
    },
    {
      title: 'Packing verification',
      body: 'Your packaging, manuals and labelling are confirmed before cartons are sealed.',
    },
  ],
} as const;

export const ABOUT_COMPLIANCE = {
  heading: 'Compliance engineering',
  body: 'The group engineers products for FCC, CE, RoHS routes and operates under ISO 9001 quality management. Certification for your specific model and market is scoped as part of your programme.',
  badges: ['FCC', 'CE', 'RoHS', 'ISO 9001'],
} as const;

export const ABOUT_SERVICES = {
  heading: 'Two ways to work with us',
  cards: [
    {
      title: 'OEM — build to your spec',
      body: 'You arrive with a finished specification, industrial design or an existing product. We industrialise it and build it under your brand.',
      points: ['Your design and BOM', 'Tooling and production setup', 'Your packaging and identity'],
    },
    {
      title: 'ODM — start from our platforms',
      body: 'You start from one of our reference monitors and we adapt sensing, enclosure, display and firmware to your market.',
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
      body: 'Target market, the sensing set you need, the volumes you are planning and any certification route your importer requires.',
    },
    {
      step: '02',
      title: 'We come back with a build path',
      body: 'Which platform fits, what changes it needs, what that implies for lead times, and where the decisions that cost money actually are.',
    },
    {
      step: '03',
      title: 'Specification and samples',
      body: 'Sensing, enclosure, display and firmware branding are fixed in writing before anything is built. Samples follow.',
    },
    {
      step: '04',
      title: 'Production under your brand',
      body: 'Your name on the housing, the display, the app and the box. Nothing on the finished unit points back to us.',
    },
  ],
} as const;

export const ABOUT_EXPECT = {
  heading: 'What to expect',
  items: [
    'A reply from an engineer, not an autoresponder — normally within two business days.',
    'Straight answers on what a change costs and how long it takes, before you commit.',
    'White-label discipline: nothing on the finished unit, its app or its packaging points back to us.',
  ],
} as const;

export const ABOUT_CTA = {
  heading: 'Scope a programme with the factory behind it',
  body: 'Send the market, the sensing set and the volumes. We will come back with a build path and lead times.',
} as const;
