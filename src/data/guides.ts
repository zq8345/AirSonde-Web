/**
 * Guides — W5 batch 1 (三篇, B2B 采购意图, 选题由总工定).
 *
 * Copy discipline (same line as solutions):
 * - generic IAQ knowledge is fine; zero invented figures, zero per-model
 *   certification claims, zero specific regulation numbers ("some markets
 *   publish classroom CO2 guidance" is allowed, citing a standard is not)
 * - products are referenced by slug only — cards render from the data layer
 *   and an unknown slug fails the build
 *
 * Body copy is structured (headed sections of paragraphs / bullet lists) so
 * the article template stays dumb and the copy stays greppable.
 */

export interface GuideSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  eyebrow: string;
  datePublished: string;
  intro: string;
  sections: GuideSection[];
  /** product cards shown after the body */
  productSlugs: string[];
  productsHeading: string;
  /** related solution pages */
  solutionSlugs: string[];
  cta: { heading: string; body: string };
}

export const GUIDES: Guide[] = [
  {
    slug: 'choose-iaq-monitor-platform',
    title: 'How to choose an indoor air quality monitor platform for your brand',
    metaTitle: 'Choosing an IAQ Monitor Platform for Your Brand | AirSonde Guides',
    description:
      'A working checklist for OEM and ODM buyers specifying an indoor air quality monitor: sensing set, form factor, certification route and order volumes.',
    eyebrow: 'Buying guide',
    datePublished: '2026-08-11',
    intro:
      'Every white-label monitor programme answers the same four questions sooner or later. Answering them before you ask for quotes is the difference between comparing platforms and comparing guesses.',
    sections: [
      {
        heading: '1. Decide the sensing set first',
        paragraphs: [
          'The sensing set is the product. CO2, particulate (PM1.0 / PM2.5 / PM10), formaldehyde, TVOC, temperature and humidity can be combined freely, but every added channel affects cost, calibration effort and enclosure design — so start from what your buyer actually needs to see.',
          'A useful test: which single reading will your customer look at every day? Homes tend to watch formaldehyde after renovation and CO2 in bedrooms. Offices and classrooms watch CO2 almost exclusively. Facilities teams want particulate. Build the set around that primary reading, not around the longest possible list.',
        ],
      },
      {
        heading: '2. Match the form factor to the room',
        paragraphs: [
          'Desktop units suit fixed rooms where the display itself is the product — living rooms, meeting rooms, classrooms. Portable and handheld units suit people who move: inspectors, facilities walkthroughs, travel.',
          'The display logic matters as much as the housing. A number readable across a classroom, a traffic-light band a child understands, or a dense dashboard for a technician are firmware decisions — cheap to change at specification time, expensive after tooling.',
        ],
      },
      {
        heading: '3. Plan the certification route with your importer',
        paragraphs: [
          'Which marks your product needs is decided by the market you sell into and who acts as importer of record — not by the factory. What the factory contributes is engineering the product so your chosen route is achievable, and preparing the documentation your importer files.',
          'Settle this early. Retrofitting a certification route after enclosure and electronics are frozen is the most expensive kind of change order.',
        ],
      },
      {
        heading: '4. Be honest about volumes',
        paragraphs: [
          'Volumes drive everything a quote is made of: which platform is economic, whether custom tooling is on the table, and how much firmware customisation the programme can carry. A realistic first-order number plus an annual expectation gets you a build path you can actually compare against other suppliers.',
        ],
      },
      {
        heading: 'What to send a manufacturer',
        bullets: [
          'Target market and importer of record',
          'The sensing set, with the primary reading marked',
          'Form factor and where the unit will live',
          'First-order volume and annual expectation',
          'Any certification route your channel already requires',
        ],
      },
    ],
    productsHeading: 'Platforms these decisions usually land on',
    productSlugs: ['co2-tvoc-hcho-desktop-monitor', '16in1-large-display-monitor', 'handheld-air-quality-analyser'],
    solutionSlugs: ['home', 'office'],
    cta: {
      heading: 'Ready to specify a programme?',
      body: 'Send the four answers above and we will come back with a build path and lead times.',
    },
  },
  {
    slug: 'co2-monitoring-offices-classrooms',
    title: 'CO2 monitoring for offices and classrooms: what buyers should know',
    metaTitle: 'CO2 Monitoring for Offices & Classrooms | AirSonde Guides',
    description:
      'Why CO2 is the reading that matters in occupied rooms, what a monitor needs to do well in offices and classrooms, and how buyers specify one.',
    eyebrow: 'Buying guide',
    datePublished: '2026-08-11',
    intro:
      'CO2 is the simplest useful proxy for how stale the air in an occupied room has become. That is why offices and schools are the two environments where a visible reading changes behaviour fastest.',
    sections: [
      {
        heading: 'Why CO2, specifically',
        paragraphs: [
          'People exhale CO2 continuously, so its concentration tracks occupancy against ventilation in close to real time. A rising number means the room is not exchanging enough air for the people in it — and everything else that builds up in stale air rises with it.',
          'Unlike particulate or VOC readings, CO2 needs no interpretation. One number, one trend, one action: ventilate. That simplicity is what makes it work as a wall-mounted product.',
        ],
      },
      {
        heading: 'What matters in an office unit',
        paragraphs: [
          'Meeting rooms are the hard case: small, sealed, fully occupied in bursts. The unit needs a display readable from the table, a trend the facilities team can check at a glance, and a housing that looks at home in a fitted-out room.',
          'Some markets publish workplace ventilation guidance that references CO2 levels; your importer will know what applies. The product decision is simpler — make the reading visible and people act on it.',
        ],
      },
      {
        heading: 'What matters in a classroom unit',
        paragraphs: [
          'Thirty occupants, closed windows through winter, and a user base that includes children. Classroom units win on legibility: a large display readable from the back row, and colour bands that carry the message without numbers.',
          'Schools also buy differently — by the corridor, through tenders, with an emphasis on robustness and simple operation. Housings and packaging should be specified for fleet rollouts from the start.',
        ],
      },
      {
        heading: 'Specifying a CO2 programme',
        bullets: [
          'Primary reading: CO2, with temperature and humidity as supporting context',
          'Display: readable at the room scale it will serve',
          'Alert logic: colour bands and thresholds set in firmware to your market',
          'Mounting and power: desk, wall or both; mains or battery expectations',
          'Fleet needs: packaging, labelling and rollout quantities',
        ],
      },
    ],
    productsHeading: 'Platforms built for occupied rooms',
    // Joe 2026-08-28: AK22A · AK34 · AK16, in that order. AK34-1 came out on
    // purpose, and the deleted product went with it.
    productSlugs: [
      'wifi-widescreen-air-quality-monitor',
      'ak34-18-in-1-air-quality-monitor-indoor-15d-24h-history-7-tft-co2-monitor-true-ndir-co-external-sensors-9-aqi-7-alerts-tester-co2-tvoc-pm2-5-pm1-0-pm10-hcho-temperature-humidity-aqi-time',
      '8in1-desktop-monitor',
    ],
    solutionSlugs: ['office', 'school'],
    cta: {
      heading: 'Scoping an office or classroom rollout?',
      body: 'Tell us the room scale, the fleet size and the market. We will come back with a build path and lead times.',
    },
  },
  {
    slug: 'oem-vs-odm-iaq-programme',
    title: 'OEM vs ODM: which programme fits your IAQ product plan',
    metaTitle: 'OEM vs ODM for IAQ Products | AirSonde Guides',
    description:
      'The practical difference between OEM and ODM for indoor air quality monitors — what each path asks of you, what it costs, and how to pick.',
    eyebrow: 'Buying guide',
    datePublished: '2026-08-11',
    intro:
      'The two terms get used loosely, but for an air quality monitor programme the difference is concrete: it decides what you must bring to the table, and where your money goes.',
    sections: [
      {
        heading: 'OEM: you bring the design',
        paragraphs: [
          'In an OEM programme you arrive with a finished specification — industrial design, electronics choices, sometimes an existing product to re-source. The factory industrialises and builds it under your brand.',
          'You carry the design risk and own the design outcome. It fits brands with engineering capability in-house, or an existing product whose manufacturing needs a new home.',
        ],
      },
      {
        heading: 'ODM: you start from a platform',
        paragraphs: [
          'In an ODM programme you start from one of the factory’s reference monitors and adapt it: the sensing set, the enclosure finish, the display logic, the firmware identity, the packaging. The platform’s engineering is already proven; your investment goes into differentiation.',
          'This is the faster and cheaper path for most brands entering IAQ, because the expensive mistakes — sensor integration, calibration, enclosure acoustics — have already been made and fixed on someone else’s schedule.',
        ],
      },
      {
        heading: 'How to pick in practice',
        bullets: [
          'You have a finished design or existing product → OEM',
          'You have a brand and a market, not an engineering team → ODM',
          'You need to launch inside two quarters → ODM, almost always',
          'Your differentiation is the hardware itself → OEM; if it is the brand, the app or the channel → ODM',
        ],
      },
      {
        heading: 'Either way, the white-label rule holds',
        paragraphs: [
          'Whichever path you take, the finished unit carries your identity: housing, display, app and box. Nothing on it points back to the factory. That discipline is what makes a manufacturing partnership safe for your channel.',
        ],
      },
    ],
    productsHeading: 'Reference platforms ODM programmes start from',
    productSlugs: ['co2-tvoc-hcho-desktop-monitor', 'oval-wifi-air-quality-monitor', 'portable-co-alarm'],
    solutionSlugs: ['home', 'industrial'],
    cta: {
      heading: 'Not sure which path fits?',
      body: 'Describe the product you want to sell and what you already have. We will tell you which programme it maps to — and what it costs to find out for sure.',
    },
  },
];

// 2026-09-05: the /guides/ list page reads its meta from site-content.json seo.pages.guides (via
// META.guides) and its copy from homeV4.guides; the old GUIDES_HUB deck that lived here had no
// reader left and was removed (dead-exports round 2). Article meta stays in GUIDES until its own
// copy batch. Provenance discipline still applies to any hub copy (总工 2026-08-11): with zero
// enquiries to date, an origin claim like "written from the enquiries we get" is a checkable
// false claim — stance statements are fine, origin claims must be true.
