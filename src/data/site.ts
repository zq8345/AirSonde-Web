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
  body: 'IAQ monitors shipped under your name — housing, firmware, packaging.',
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
    intro: 'Every unit is specified with you up front.',
  },
  contact: {
    id: 'contact',
  },
} as const;

export const VALUE_PROPS = [
  {
    title: 'White-label ready',
    body:
      'Your brand on the housing, display, app and box. Nothing points back to us.',
  },
  {
    title: 'OEM and ODM',
    body:
      'Bring a finished spec (OEM), or adapt one of our reference designs (ODM).',
  },
] as const;

export const CAPABILITIES = [
  {
    title: 'Sensing',
    body:
      'CO2, CO, particulate, HCHO, TVOC, temperature and humidity — specified per programme.',
  },
  {
    title: 'Hardware',
    body: 'Desktop, portable and handheld. Enclosure, display and battery scoped per programme.',
  },
  {
    title: 'Firmware & app',
    body: 'Your branding, your thresholds, your connectivity.',
  },
] as const;

export const CONTACT = {
  title: 'Tell us what you want to put your name on',
  body:
    'Send the market, the sensing set and the volumes. We come back with a build path and lead times.',
} as const;

/* -------------------------------------------------------------------------
 * /products
 * ---------------------------------------------------------------------- */

export const PRODUCTS_PAGE = {
  eyebrow: 'Products',
  heading: 'Monitors we build under your brand',
  intro:
    'The platforms most programmes start from. Housing, display, firmware and sensing are specified with you.',
  filterLabel: 'Filter by category',
  emptyState: 'No products in that category yet.',
  detailCta: {
    body:
      'Specified with you before anything is built. Send the market and volumes; we come back with a build path.',
  },
  sectionHeadings: {
    sensing: 'Sensing',
    highlights: 'What it is',
    specs: 'At a glance',
  },
} as const;

/* -------------------------------------------------------------------------
 * /contact
 * ---------------------------------------------------------------------- */

export const CONTACT_PAGE = {
  eyebrow: 'Contact',
  askHeading: 'What to put in the first email',
  askIntro:
    'The more you answer up front, the sooner you get something concrete.',
  asideHeading: 'Enquiries',
  asideBody:
    'Not sure which platform? Send the requirement — the platform is the easy part.',
  asideLink: 'Browse the products',
  ask: [
    'Target market and importer of record',
    'Sensing set — CO2, CO, PM, HCHO, TVOC, temperature and humidity',
    'Form factor — desktop, portable, handheld or your own design',
    'First-order and annual volumes',
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
    'The address may be mistyped or moved. Everything is reachable from the homepage.',
  cta: 'Back to the homepage',
  suggestionsHeading: 'Try one of these',
} as const;
