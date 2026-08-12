/**
 * Single source of truth for site-wide metadata and every piece of English
 * copy on the site — including page titles, meta descriptions and section
 * headings. Pages render from here; never hand-edit generated HTML.
 *
 * Why headings live here too: they used to be hardcoded in the .astro files,
 * and a copy review that only read this file missed them twice.
 *
 * Multi-language: this file is the `en` copy deck. When de/es/pt land, add
 * sibling decks (e.g. `src/data/site.de.ts`) and resolve by locale, keeping
 * `SITE` (domain, brand, contact) shared.
 *
 * ⚠️ Copy rule: nothing here may assert a fact we cannot evidence — no
 * certifications, no sensor technologies, no commercial promises. Positioning
 * (OEM / ODM / white-label) is the business itself and stays.
 */

export const SITE = {
  brand: 'AirSonde',
  url: 'https://airsonde.com',
  locale: 'en',
  /** Real, monitored inbox — MX/SPF/DMARC verified by 总工 2026-08-10. */
  email: 'sales@airsonde.com',
  defaultTitle: 'AirSonde — OEM / ODM Indoor Air Quality Monitors',
  defaultDescription:
    'AirSonde manufactures white-label indoor air quality monitors for brands and importers. OEM and ODM production for CO2, PM2.5, PM10, HCHO and TVOC sensing.',
  organisationDescription:
    'AirSonde is an OEM and ODM manufacturer of indoor air quality monitors, producing desktop and portable CO2, particulate, formaldehyde and TVOC monitors under its customers’ own brands.',
} as const;

// IA per Joe 2026-08-11 (改令四): 首页/Products/Solutions/Guides/About/Contact.
// Only sections that exist get a menu item; Solutions and Guides join as they
// ship. Capabilities is no longer a section — /capabilities/ 301s to /about/.
export const NAV = [
  { label: 'Products', href: '/products' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Guides', href: '/guides' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

/** Per-page <title> and meta description. Every entry must be unique. */
export const META = {
  home: {
    title: 'AirSonde — OEM / ODM Indoor Air Quality Monitors',
    description: SITE.defaultDescription,
  },
  products: {
    title: 'Products — OEM / ODM Indoor Air Quality Monitors | AirSonde',
    description:
      'Desktop, portable and handheld indoor air quality monitors available for OEM and ODM production: CO2, CO, PM1.0, PM2.5, PM10, HCHO and TVOC sensing, built under your brand.',
  },
  capabilities: {
    title: 'OEM / ODM Capabilities — White-Label IAQ Manufacturing | AirSonde',
    description:
      'How an AirSonde OEM or ODM programme runs: sensing set, hardware, firmware and app branding, and what we need from you before we can quote.',
  },
  contact: {
    title: 'Contact — Start an OEM / ODM Programme | AirSonde',
    description:
      'Contact AirSonde about OEM and ODM production of white-label indoor air quality monitors. Tell us the market, the sensing set and the volumes.',
  },
  notFound: {
    title: 'Page not found — AirSonde',
    description: 'That page does not exist on this site.',
  },
} as const;

/* -------------------------------------------------------------------------
 * Homepage
 * ---------------------------------------------------------------------- */

/** Hero — the positioning has to be said by the page, not by the name. */
export const HERO = {
  eyebrow: 'Indoor Air Quality · OEM / ODM Manufacturing',
  headline: 'Indoor Air Quality Monitors, Built for Your Brand',
  tagline: 'OEM / ODM manufacturing · White-label ready · CO2 · PM2.5 · HCHO · TVOC',
  body: 'We build IAQ monitors that ship under your name — your housing, your firmware branding, your packaging.',
  primaryCta: { label: 'See the products', href: '/products' },
  secondaryCta: { label: 'What we can build', href: '/about' },
} as const;

export const SENSOR_CHIPS = [
  { code: 'CO2', label: 'Carbon dioxide' },
  { code: 'PM2.5', label: 'Fine particulate' },
  { code: 'PM10', label: 'Coarse particulate' },
  { code: 'HCHO', label: 'Formaldehyde' },
  { code: 'TVOC', label: 'Volatile organics' },
  { code: 'T / RH', label: 'Temperature & humidity' },
] as const;

export const HOME_SECTIONS = {
  whatWeDo: {
    id: 'what-we-do',
    heading: 'How we work with brands',
  },
  capabilities: {
    id: 'capabilities',
    heading: 'What we can build for you',
    intro: 'Every unit is specified with you up front. The list below is where most programmes start.',
  },
  contact: {
    id: 'contact',
  },
} as const;

export const VALUE_PROPS = [
  {
    title: 'White-label ready',
    body:
      'Your brand on the housing, the display, the app and the box. Nothing on the finished unit points back to us.',
  },
  {
    title: 'OEM and ODM',
    body:
      'Bring us a finished spec and we build to it (OEM), or start from our reference designs and we adapt sensing, enclosure and firmware to your market (ODM).',
  },
] as const;

export const CAPABILITIES = [
  {
    title: 'Sensing',
    body:
      'CO2, carbon monoxide, particulate matter, formaldehyde, TVOC, temperature and humidity. The sensing set is specified per programme and varies by model.',
  },
  {
    title: 'Hardware',
    body: 'Desktop, portable and handheld form factors. Enclosure, display and battery options scoped per programme.',
  },
  {
    title: 'Firmware & app',
    body: 'Your branding in the UI, your thresholds and alerting logic, and connectivity options to match your product.',
  },
] as const;

export const CONTACT = {
  title: 'Tell us what you want to put your name on',
  body:
    'The details that move a programme forward are the target market, the sensing set and the volumes you are planning. We come back with a build path and lead times.',
} as const;

/* -------------------------------------------------------------------------
 * /products
 * ---------------------------------------------------------------------- */

export const PRODUCTS_PAGE = {
  eyebrow: 'Products',
  heading: 'Monitors we build under your brand',
  intro:
    'These are the platforms most OEM and ODM programmes start from. Housing, display, firmware branding and the sensing set are all specified with you — nothing here is fixed.',
  filterLabel: 'Filter by category',
  emptyState: 'No products in that category yet.',
  detailCta: {
    body:
      'Every unit is specified with you before anything is built — sensing set, enclosure, display, firmware branding and packaging. Tell us the target market and the volumes and we will come back with a build path.',
  },
  sectionHeadings: {
    sensing: 'Sensing',
    highlights: 'What it is',
    specs: 'At a glance',
  },
} as const;

/* -------------------------------------------------------------------------
 * /capabilities
 * ---------------------------------------------------------------------- */

export const CAPABILITIES_PAGE = {
  eyebrow: 'Capabilities',
  heading: 'OEM and ODM, start to finished goods',
  intro:
    'Bring us a finished spec and we build to it. Or start from one of our platforms and we adapt the sensing, the enclosure and the firmware to your market. Either way the unit ships as yours.',
  specHeading: 'What we specify with you',
  processHeading: 'How a programme runs',
  ctaHeading: 'Ready to scope one?',
  ctaBody:
    'Send the market, the sensing set and the volumes. We will come back with a build path and lead times.',
  branding: {
    title: 'Branding',
    body: 'Housing, on-screen identity, app and packaging carry your brand, not ours.',
  },
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

/* -------------------------------------------------------------------------
 * /contact
 * ---------------------------------------------------------------------- */

export const CONTACT_PAGE = {
  eyebrow: 'Contact',
  askHeading: 'What to put in the first email',
  askIntro:
    'The more of this you can answer up front, the sooner we can give you something concrete rather than a brochure.',
  asideHeading: 'Enquiries',
  asideBody:
    'Not sure which platform fits? Send the requirement rather than a product code — the platform is the easy part.',
  asideLink: 'Browse the products',
  ask: [
    'The market you are selling into, and who the importer of record will be',
    'The sensing set you need — CO2, CO, PM1.0 / PM2.5 / PM10, HCHO, TVOC, temperature and humidity',
    'Form factor: desktop, portable, handheld, or something you have already designed',
    'Volumes for the first order and what you expect annually',
    'Any certification route your channel requires',
  ],
} as const;

/**
 * Contact channels — same set as wanew.com/contact (Joe, 改令二): one phone
 * number across WhatsApp / WeChat / voice. QR asset forked from the wanew repo.
 */
export const CONTACT_CHANNELS = {
  heading: 'Reach us directly',
  email: { label: 'Email', value: 'sales@airsonde.com', href: 'mailto:sales@airsonde.com' },
  whatsapp: { label: 'WhatsApp', value: '+86 186 8116 0111', href: 'https://wa.me/8618681160111' },
  phone: { label: 'Phone', value: '+86 186 8116 0111', href: 'tel:+8618681160111' },
  wechat: {
    label: 'WeChat',
    id: '18681160111',
    scanHint: 'Scan to add on WeChat',
    copyLabel: 'Copy WeChat ID',
    copiedLabel: 'Copied',
  },
} as const;

/* -------------------------------------------------------------------------
 * 404
 * ---------------------------------------------------------------------- */

export const NOT_FOUND_PAGE = {
  eyebrow: 'Error 404',
  heading: 'That page does not exist',
  body:
    'The address may be mistyped, or the page may have moved. Everything on the site is reachable from the homepage.',
  cta: 'Back to the homepage',
  suggestionsHeading: 'Try one of these',
} as const;
