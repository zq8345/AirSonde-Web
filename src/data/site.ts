/**
 * Single source of truth for site-wide metadata and the English homepage copy.
 * Pages render from here — never hand-edit generated HTML.
 *
 * Multi-language: this file is the `en` copy deck. When de/es/pt land, add
 * sibling decks (e.g. `src/data/site.de.ts`) and resolve by locale, keeping
 * `SITE` (domain, brand) shared.
 *
 * ⚠️ Copy rule: nothing here may assert a fact we cannot evidence — no
 * certifications, no sensor technologies, no commercial promises. Positioning
 * (OEM / ODM / white-label) is the business itself and stays.
 */

export const SITE = {
  brand: 'AirSonde',
  url: 'https://airsonde.com',
  locale: 'en',
  defaultTitle: 'AirSonde — OEM / ODM Indoor Air Quality Monitors',
  defaultDescription:
    'AirSonde manufactures white-label indoor air quality monitors for brands and importers. OEM and ODM production for CO2, PM2.5, PM10, HCHO and TVOC sensing.',
} as const;

export const NAV = [
  { label: 'What we do', href: '#what-we-do' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Contact', href: '#contact' },
] as const;

/** Hero — the positioning has to be said by the page, not by the name. */
export const HERO = {
  eyebrow: 'Indoor Air Quality · OEM / ODM Manufacturing',
  headline: 'Indoor Air Quality Monitors, Built for Your Brand',
  tagline: 'OEM / ODM manufacturing · White-label ready · CO2 · PM2.5 · HCHO · TVOC',
  body: 'We build IAQ monitors that ship under your name — your housing, your firmware branding, your packaging.',
  primaryCta: { label: 'Contact us', href: '#contact' },
  secondaryCta: { label: 'See what we can build', href: '#capabilities' },
} as const;

export const SENSORS = [
  { code: 'CO2', label: 'Carbon dioxide' },
  { code: 'PM2.5', label: 'Fine particulate' },
  { code: 'PM10', label: 'Coarse particulate' },
  { code: 'HCHO', label: 'Formaldehyde' },
  { code: 'TVOC', label: 'Volatile organics' },
  { code: 'T / RH', label: 'Temperature & humidity' },
] as const;

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
      'CO2, particulate matter, formaldehyde, TVOC, temperature and humidity. The sensing set is specified per programme and varies by model.',
  },
  {
    title: 'Hardware',
    body: 'Desktop and handheld form factors. Enclosure, display and battery options scoped per programme.',
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
  /** No inbox published until a monitored address is confirmed. */
  note: 'Enquiry form coming soon.',
} as const;
