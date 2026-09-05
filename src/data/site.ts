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
 *
 * ── 后台可写的部分住在 site-content.json ──────────────────────────────────
 * 联系数据、首页文案、各页 title/description 从 `./site-content.json` 读进来，
 * 因为 admin.airsonde.com 要能改它们。**后台只写 JSON，永不写这个 .ts**：
 * 重写 TS 的出错方式是产出一个语法合法但语义变了的文件，闸看不出来。
 *
 * ⚠️ 下面每个 export 的**形状保持不变** —— 所有页面照旧从这里取，一个都不用改。
 * ⚠️ 哪些**不许**进 JSON，见该文件的 `_readme`（NAV href、表单选项、CTA href…）。
 */

import content from './site-content.json';

/**
 * 号码只存一份，三个链接全部**派生**。
 * 🔴 之所以不把 href 也放进 JSON：号码改了而某个 href 没改，页面上**看不出任何异常** ——
 *    直到有人点了它，打到一个不存在的号上。派生 ⇒ 那种不一致在结构上不可能出现。
 */
const PHONE_DIGITS = content.contact.phone.replace(/\D/g, '');

export const SITE = {
  brand: 'AirSonde',
  url: 'https://airsonde.com',
  locale: 'en',
  /** Real, monitored inbox — MX/SPF/DMARC verified by 总工 2026-08-10. */
  email: content.contact.email,
  defaultTitle: content.seo.defaultTitle,
  defaultDescription: content.seo.defaultDescription,
  organisationDescription: content.seo.organisationDescription,
} as const;

// IA per Joe 2026-08-11 (改令四): 首页/Products/Solutions/Guides/About/Contact.
// Only sections that exist get a menu item; Solutions and Guides join as they
// ship. Capabilities is no longer a section — /capabilities/ 301s to /about/.
export const NAV = [
  { label: 'Products', href: '/products/' },
  { label: 'Solutions', href: '/solutions/' },
  { label: 'Guides', href: '/guides/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
] as const;

/** Per-page <title> and meta description. Every entry must be unique. */
export const META = {
  home: {
    title: content.seo.pages.home.title,
    // 空字符串 ⇒ 回落到站点默认描述。**空不是"没描述"，是"用默认那条"** ——
    // 让它渲染成空 meta description 会比写错还糟（搜索结果里自己造摘要）。
    description: content.seo.pages.home.description || SITE.defaultDescription,
  },
  products: {
    title: content.seo.pages.products.title,
    description: content.seo.pages.products.description || SITE.defaultDescription,
  },
  contact: {
    title: content.seo.pages.contact.title,
    description: content.seo.pages.contact.description || SITE.defaultDescription,
  },
  notFound: {
    title: content.seo.pages.notFound.title,
    description: content.seo.pages.notFound.description || SITE.defaultDescription,
  },
} as const;

/* -------------------------------------------------------------------------
 * Homepage
 * ---------------------------------------------------------------------- */

/** Hero — the positioning has to be said by the page, not by the name. */
export const HERO = {
  // W9 §1: hero mirrors wanew's skeleton — eyebrow / H1 / ONE subline / two
  // buttons. `tagline` is no longer rendered but stays as the frozen W1
  // positioning line (sensor set now lives in the chips band below the hero).
  eyebrow: content.home.hero.eyebrow,
  headline: content.home.hero.headline,
  tagline: 'OEM / ODM manufacturing · White-label ready · CO2 · PM2.5 · HCHO · TVOC',
  body: content.home.hero.body,
  // ⚠️ **href 故意不进 JSON**：文案改错只是难看，链接改错是 404。
  //    后台只给改 label —— 那是它真正想改的东西。
  primaryCta: { label: content.home.hero.primaryCtaLabel, href: '/contact/' },
  secondaryCta: { label: content.home.hero.secondaryCtaLabel, href: '/products/' },
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
  // ⚠️ `id` 留在 TS：它是锚点/CSS 钩子（结构），不是文案。改它会断锚点链接。
  // ⚠️ 两个 `heading` 也留在 TS：实测它们在**产出页里 0 处**（index.astro 只用了
  //    capabilities.id / capabilities.intro / contact.id）。把死字段接到后台上，
  //    等于让人改一段改了不会变的字 —— 那比没有这个输入框更糟。
  whatWeDo: {
    id: 'what-we-do',
    heading: 'How we work with brands',
  },
  capabilities: {
    id: 'capabilities',
    heading: 'What we can build for you',
    intro: content.home.sections.capabilitiesIntro,
  },
  contact: {
    id: 'contact',
  },
} as const;

export const VALUE_PROPS = content.home.valueProps;

/**
 * Homepage v4 copy (Joe 逐屏验收 2026-09-05). Admin-writable text only —
 * layout, order, hrefs and crop parameters stay in the templates.
 */
export const HOME_V4 = content.homeV4;
/** /products/ v1 list page copy (2026-09-05). */
export const PRODUCTS_V1 = content.productsV1;
/** /solutions/ v3 index page copy (2026-09-05, 总工-reviewed, verbatim). */
export const SOLUTIONS_V3 = content.solutionsV3;
/**
 * /contact/ v1 page copy (2026-09-05). Derived, never stored twice:
 *  - replyNote comes from contact.response ("Within 2 business days" → "Reply within 2 business days.")
 *  - mapEmbed comes from contact.address (same reason CONTACT_INFO.map.url is derived)
 */
export const CONTACT_V1 = {
  ...content.contactV1,
  replyNote: `Reply ${content.contact.response.charAt(0).toLowerCase()}${content.contact.response.slice(1)}.`,
  mapEmbed: `https://www.google.com/maps?q=${encodeURIComponent(content.contact.address)}&output=embed`,
} as const;

/**
 * W25: which products the homepage features, and in what order — the array's
 * order IS the display order. It used to be a hardcoded array in
 * home-light.ts, where the admin could not reach it.
 * ⚠️ These are product slugs, not copy: a slug that matches nothing renders
 * one tile fewer. index.astro warns by name at build time when that happens;
 * the guard that matters lives in the admin, which knows before you unpublish.
 */
export const FEATURED_SLUGS: readonly string[] = content.home.featuredSlugs;

/** ⚠️ 当前**没有任何页面 import 它**（实测产出页 0 处）。故意不接后台，见上面的理由。 */
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
  title: content.home.contactBlock.title,
  body: content.home.contactBlock.body,
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
  /* W26: `detailCta.body` was deleted with the panel it filled. Grepped first —
     the product detail page was its only reader, so keeping it would have left
     a string that renders nowhere, which this repo has revived by accident
     twice. */
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

/** W10-B hero — wording set by 总工 (wanew page-header 对位). */
export const CONTACT_HERO = {
  eyebrow: 'Contact',
  heading: "Tell us what you're building",
  sub: 'OEM / ODM inquiries welcome.',
} as const;

/**
 * W10-B info card. Address is the group's Shenzhen address — same as
 * wanew.com/contact (总工裁定, Joe 可否决). Hours/response mirror wanew's
 * published values (集团同口径).
 */
export const CONTACT_INFO = {
  tagline: 'Reach the AirSonde team',
  heading: 'Contact information',
  address: content.contact.address,
  hours: content.contact.hours,
  response: content.contact.response,
  labels: { address: 'Address', email: 'Email', hours: 'Business hours', response: 'Response time' },
  map: {
    hq: 'Shenzhen HQ',
    cta: 'View on Google Maps',
    // 🔴 地图链接**从地址派生**，不单独存一份。
    //    存两份的下场是：有人改了地址、没改链接，而页面上完全看不出来 ——
    //    地址是新的，"View on Google Maps" 还指着旧地方。
    url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content.contact.address)}`,
  },
} as const;

/**
 * Contact channels — same set as wanew.com/contact (Joe, 改令二): one phone
 * number across WhatsApp / WeChat / voice. QR asset forked from the wanew repo.
 */
export const CONTACT_CHANNELS = {
  heading: 'Reach us directly',
  // ⭐ value 与 href **同源**：href 由 value 算出来，不各存一份。见文件顶部 PHONE_DIGITS。
  email: { label: 'Email', value: content.contact.email, href: `mailto:${content.contact.email}` },
  whatsapp: { label: 'WhatsApp', value: content.contact.phone, href: `https://wa.me/${PHONE_DIGITS}` },
  phone: { label: 'Phone', value: content.contact.phone, href: `tel:+${PHONE_DIGITS}` },
  wechat: {
    label: 'WeChat',
    id: content.contact.wechatId,
    scanHint: 'Scan to add on WeChat',
    copyLabel: 'Copy WeChat ID',
    copiedLabel: 'Copied',
  },
} as const;

/**
 * W7: enquiry form → POST /api/contact (Pages Function → Joe's Lark group).
 * Fail-closed on the page: any error shows the failed line with the direct
 * address — never a fake success. The "website" field is a honeypot.
 */
export const CONTACT_FORM = {
  /** reuses the ask-intro line — existing verified copy (rendered as a
   *  normal-case subline, not an uppercase eyebrow — 总工七条之7) */
  tagline: 'The more you answer up front, the sooner you get something concrete.',
  heading: 'Leave a message online',
  privacy: 'Used only to reply to your enquiry.',
  fields: {
    name: 'Name',
    company: 'Company',
    email: 'Work email',
    phone: 'Phone (optional)',
    inquiryType: 'Inquiry type',
    message: 'Message',
  },
  /** must match the Function's allowlist in functions/api/contact.ts */
  inquiryOptions: ['OEM / ODM', 'White-label', 'General'],
  submit: 'Submit',
  sent: 'Sent — we reply by email.',
  failed: 'Sending failed — email us instead:',
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
