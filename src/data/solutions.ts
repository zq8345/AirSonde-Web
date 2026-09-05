/**
 * Copy deck for /solutions/ (W4 page 4, 改令四). Light sol-deep skeleton:
 * scene pains → fitting monitors (real product cards) → enquiry CTA.
 * The guides slot arrives with W5; scene pages ship without it for now.
 *
 * Copy discipline: generic, defensible IAQ reasoning only — no regulations
 * cited, no thresholds, no certifications, no invented specs.
 */
// W39 (2026-08-28, Joe): the four ambience-only rooms became staged scenes —
// people using AirSonde devices, 2880x1200 (2.4:1), same spec as the heroes.
// ⚠️ The old scene-*.jpg files were cleaned up by Joe on 2026-08-29 (W41-C);
// reverting now means retrieving them from git history first, e.g.
//   git show f488957:src/assets/photos/scene-home.jpg
import sceneHome from '../assets/photos/scene-home-v1.webp';
import sceneOffice from '../assets/photos/scene-office-v1.webp';
import sceneSchool from '../assets/photos/scene-school-v1.webp';
import sceneIndustrial from '../assets/photos/scene-industrial-v1.webp';

// 2026-09-05: the /solutions/ list page reads its meta from site-content.json seo.pages.solutions
// (via META.solutions) and its copy from solutionsV3; the old SOLUTIONS_HUB deck that lived here
// had no reader left and was removed (dead-exports round 2). Scene detail meta below stays here
// until its own copy batch.

export interface Scene {
  slug: string;
  label: string;
  /**
   * W39: every landing spot crops these 2.4:1 scenes differently — the detail
   * hero is capped at 2.8 (vertical crop, ~13.5%), the homepage tab panel and
   * the /solutions/ cards crop horizontally on phones (only 32-48% of the
   * width survives at 375) — and the subjects sit in a different place in
   * each render, so ⛔ no shared focus. Every value below was set by cropping
   * the exact visible rectangle and looking at it, then measuring margins.
   *   focus       detail hero ≥768 (Y is what matters under the cap)
   *   focusNarrow detail hero <768 (X is what matters — window ~39% wide)
   *   panelFocus  homepage panel + /solutions/ cards, all widths (X on
   *               phones; Y only bites on the /solutions/ cards at desktop,
   *               where the box is ~2.9:1)
   */
  photo: {
    src: ImageMetadata;
    alt: string;
    focus: string;
    focusNarrow: string;
    panelFocus: string;
  };
  meta: { title: string; description: string };
  heading: string;
  intro: string;
  /** W9 §4: one-line caption on the homepage scene panel — compressed from
   *  `intro`, single source with the scene page. */
  homeLine: string;
  pains: { title: string; body: string }[];
  productSlugs: string[];
  productsHeading: string;
}

export const SCENES_DATA: Scene[] = [
  {
    slug: 'home',
    label: 'Home',
    photo: {
      src: sceneHome,
      alt: 'AK34 monitor on a wooden sideboard showing CO2 and comfort readings, with parents and a child playing on the living-room floor behind it',
      focus: '65% 50%',
      focusNarrow: '90% 50%',
      panelFocus: '76% 50%',
    },
    meta: {
      title: 'Home Air Quality Monitors — OEM / ODM | AirSonde',
      description:
        'Desktop CO2, formaldehyde and particulate monitors for living spaces, built under your brand: readable displays, quiet housings, sensible alerts.',
    },
    heading: 'Home',
    intro: 'One glance, one question — is the air in here fine? It has to read like a clock, not an instrument.',
    homeLine: 'One glance, one question — is the air in here fine?',
    pains: [
      {
        title: 'New furniture and renovation',
        body: 'New interiors release HCHO and VOCs long after the smell fades. A visible reading says when to ventilate.',
      },
      {
        title: 'Closed windows, rising CO2',
        body: 'Rooms drift stale overnight and in winter. The CO2 trend is the prompt to air them.',
      },
      {
        title: 'Heating appliances',
        body: 'Boilers and stoves make CO a quiet risk. A dedicated alarm belongs beside them.',
      },
    ],
    productsHeading: 'Platforms that fit the home',
    productSlugs: [
      'co2-tvoc-hcho-desktop-monitor',
      'hcho-desktop-monitor',
      'portable-co-alarm',
      '9in1-desktop-air-quality-monitor',
    ],
  },
  {
    slug: 'office',
    label: 'Office',
    photo: {
      src: sceneOffice,
      alt: 'Air quality monitor on a long office desk showing PM2.5, CO2 and TVOC readings, with four colleagues meeting by the window behind it',
      focus: '67% 55%',
      focusNarrow: '88% 50%',
      panelFocus: '90% 55%',
    },
    meta: {
      title: 'Office Air Quality Monitors — OEM / ODM | AirSonde',
      description:
        'CO2 and comfort monitors for meeting rooms and open-plan offices, white-labelled for workplace and HVAC brands.',
    },
    heading: 'Office',
    intro: 'Meeting rooms fill with people and empty of fresh air. The wall needs a number that says when to pause.',
    homeLine: 'Meeting rooms fill with people and empty of fresh air.',
    pains: [
      {
        title: 'Full meeting rooms',
        body: 'CO2 climbs fast in a full room; attention drops with it. A visible reading beats a policy.',
      },
      {
        title: 'Open-plan comfort disputes',
        body: 'Too dry, too stuffy, too warm — a shared display turns arguments into data.',
      },
      {
        title: 'Proof for the workplace brand',
        body: 'Operators who advertise air quality need it on the wall, under their own name.',
      },
    ],
    productsHeading: 'Platforms that fit the office',
    // Joe 2026-08-28: three, not four — the deleted product's entry goes rather
    // than being replaced.
    productSlugs: [
      'oval-wifi-air-quality-monitor',
      'wifi-widescreen-air-quality-monitor',
      'co2-tvoc-hcho-desktop-monitor',
    ],
  },
  {
    slug: 'school',
    label: 'School',
    photo: {
      src: sceneSchool,
      alt: 'Large-display air quality monitor on a classroom shelf showing CO2 and comfort readings, with students and a teacher talking at a table by the windows',
      focus: '63% 50%',
      focusNarrow: '85% 50%',
      panelFocus: '88% 50%',
    },
    meta: {
      title: 'Classroom Air Quality Monitors — OEM / ODM | AirSonde',
      description:
        'Large-display CO2 monitors for classrooms, built for education-sector brands: readable across a room, simple traffic-light logic.',
    },
    heading: 'School',
    intro: 'Thirty people, windows shut through winter. The display has to read from the back row.',
    homeLine: 'Thirty people, windows shut through winter.',
    pains: [
      {
        title: 'Occupancy in a sealed room',
        body: 'A full class raises CO2 fast; drowsiness follows. One rule: at the red band, open the windows.',
      },
      {
        title: 'A display children understand',
        body: 'Colour bands and faces work where numbers do not. Display logic is firmware — yours to set.',
      },
      {
        title: 'Fleet deployments',
        body: 'Schools buy by the corridor. Housings and packaging built for rollouts under your brand.',
      },
    ],
    productsHeading: 'Platforms that fit the classroom',
    // Joe 2026-08-28: three, not four — as with office.
    productSlugs: [
      '16in1-large-display-monitor',
      '8in1-desktop-monitor',
      'portrait-aqi-desktop-monitor',
    ],
  },
  {
    slug: 'industrial',
    label: 'Industrial',
    photo: {
      src: sceneIndustrial,
      /** ⚠️ The subject's head starts at y≈4% of this render — the one scene
       *  where the crop must hang from the top, not the centre. */
      alt: 'Technician in safety glasses holding a handheld AirSonde monitor on a production floor, with SMT lines and ventilation ducts behind him',
      focus: '50% 0%',
      focusNarrow: '85% 0%',
      panelFocus: '78% 12%',
    },
    meta: {
      title: 'Industrial Indoor Air Monitors — OEM / ODM | AirSonde',
      description:
        'Portable and desktop air monitors for warehouses, workshops and back-of-house spaces, white-labelled for safety and facilities brands.',
    },
    heading: 'Industrial',
    intro: 'Readings where the work happens — on a wall, or in a hand walking the floor.',
    homeLine: 'Readings where the work happens — on a wall, or in a hand walking the floor.',
    pains: [
      {
        title: 'Spot checks across a large floor',
        body: 'One fixed sensor cannot describe a warehouse. A handheld maps it zone by zone.',
      },
      {
        title: 'Dust from handling and machinery',
        body: 'Packing, cutting and forklifts raise particulate. PM readings show which corner needs extraction.',
      },
      {
        title: 'Back-of-house comfort',
        body: 'Break rooms and offices share the building’s air. A desktop unit keeps them honest.',
      },
    ],
    productsHeading: 'Platforms that fit industrial interiors',
    productSlugs: [
      'handheld-air-quality-analyser',
      'compact-square-air-quality-monitor',
      'wifi-widescreen-air-quality-monitor',
      'portable-co-alarm',
    ],
  },
];
// SOLUTIONS_CTA (the old detail-page CTA copy) was removed 2026-09-05: the v1 template's CTA
// band reads homeV4.cta, so it had no reader left.
