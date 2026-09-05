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
  /** Moved here from about.ts ABOUT_META on 2026-09-05 so the admin can edit it. ⚠️ The
   *  description hand-spells two of the six figures ("founded in 2015, 120+ staff") that live
   *  in homeV4.factory.stats — the admin soft-check warns when they drift. */
  about: {
    title: content.seo.pages.about.title,
    description: content.seo.pages.about.description || SITE.defaultDescription,
  },
  /** /solutions/ and /guides/ LIST pages only (moved from solutions.ts SOLUTIONS_HUB.meta and
   *  guides.ts GUIDES_HUB.meta on 2026-09-05). Scene detail pages and guide articles keep their
   *  meta in solutions.ts / guides.ts until their own copy batches. */
  solutions: {
    title: content.seo.pages.solutions.title,
    description: content.seo.pages.solutions.description || SITE.defaultDescription,
  },
  guides: {
    title: content.seo.pages.guides.title,
    description: content.seo.pages.guides.description || SITE.defaultDescription,
  },
  notFound: {
    title: content.seo.pages.notFound.title,
    description: content.seo.pages.notFound.description || SITE.defaultDescription,
  },
} as const;

/* -------------------------------------------------------------------------
 * Homepage
 * ------------------------------------------------------------------------
 * 2026-09-05 dead-code cleanup (audit dimension 8, Joe-approved): the pre-v4 exports
 * HERO / SENSOR_CHIPS / HOME_SECTIONS / VALUE_PROPS / FEATURED_SLUGS / CAPABILITIES /
 * CONTACT and the pre-v1 CONTACT_PAGE / CONTACT_HERO had zero readers (three independent
 * searches) and were removed. ⚠️ Deleting an export is not deleting data: the
 * site-content.json keys they read (home.hero / home.valueProps / home.featuredSlugs /
 * home.contactBlock / home.sections) are untouched — the admin may still write them, and a
 * separate data-cleanup single decides their fate.
 */

/**
 * Homepage v4 copy (Joe 逐屏验收 2026-09-05). Admin-writable text only —
 * layout, order, hrefs and crop parameters stay in the templates.
 */
export const HOME_V4 = content.homeV4;
/**
 * Footer v4 column headings (Joe 2026-09-05). Kept in TS rather than added to homeV4.footer:
 * the admin validator whitelists JSON keys, so new keys there need the Admin window first.
 * ⚠️ homeV4.footer (blurb / productsHeading / companyHeading / hqHeading / productLinks /
 * companyLinks / channels / tagline) has no reader since v4 — left in the JSON untouched for
 * the same reason; the Admin window decides when its form drops those fields.
 */
export const FOOTER_V4 = { explore: 'Explore', solutions: 'Solutions', contact: 'Contact' } as const;
/** /products/ v1 list page copy (2026-09-05). */
export const PRODUCTS_V1 = content.productsV1;
/** /solutions/ v3 index page copy (2026-09-05, 总工-reviewed, verbatim). */
export const SOLUTIONS_V3 = content.solutionsV3;
/**
 * /contact/ v1 page copy (2026-09-05). Derived, never stored twice:
 *  - replyNote comes from contact.response ("Within 2 business days" → "Reply within 2 business days.")
 *
 * ⚠️ mapEmbed is NOT derived from contact.address on purpose (Joe 2026-09-05, from the
 * preview screenshot): the full postal string ("No. 62, Baotian 1st Road, Xixiang Street,
 * Bao'an District, Shenzhen, Guangdong, China") makes Google fall back to a city-level
 * view of Shenzhen with no pin. The shorter form below is the design file's query and pins
 * Baotian 1st Road. It is a geocoding hint, not display copy — the visible address on the
 * page stays contact.address. If the company moves, change BOTH (this is the one place
 * where a second value is deliberate, and this comment is the reminder).
 */
const MAP_QUERY = "No.62 Baotian 1st Road, Xixiang, Bao'an District, Shenzhen";
export const CONTACT_V1 = {
  ...content.contactV1,
  replyNote: `Reply ${content.contact.response.charAt(0).toLowerCase()}${content.contact.response.slice(1)}.`,
  mapEmbed: `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`,
} as const;
/** /about/ v1 page copy (2026-09-05, Joe 逐板块验收, verbatim). Figures stay in about.ts. */
export const ABOUT_V1 = content.aboutV1;
/**
 * Certificate files by slot (Admin-written; contract in the block's _readme). Value = URL path
 * with a leading slash, or `null` = no file yet. Typed loosely on purpose, and tolerant of the
 * block being absent altogether — the admin only creates it on the first upload.
 */
export const CERTIFICATES: Record<string, string | null | undefined> =
  (content as { certificates?: Record<string, string | null> }).certificates ?? {};
/** /solutions/<scene>/ template copy (2026-09-05). Scene facts stay in solutions.ts. */
export const SOLUTION_DETAILS = content.solutionDetails;

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
  /** The Products list hero and every product detail hero say the same thing (Joe 2026-09-05).
   *  Admin-editable since the content-keys migration: productsV1.hero.heading in site-content.json
   *  (Joe rewrote this line three times in one day — it had to leave the TS). */
  heroHeading: content.productsV1.hero.heading,
  sectionHeadings: {
    sensing: 'Sensing',
    highlights: 'What it is',
    /** product-detail-v1: "At a glance" → "Specifications" */
    specs: 'Specifications',
    whatHeading: 'The working details',
    relatedKicker: 'Related',
  },
  /** CTA label prefix; the model follows: "Enquire about AK34 →" */
  enquire: 'Enquire about',
  /** gallery controls */
  gallery: { prev: 'Previous image', next: 'Next image', view: 'View image' },
} as const;

/* -------------------------------------------------------------------------
 * /contact
 * ---------------------------------------------------------------------- */

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
