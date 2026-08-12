/**
 * Copy deck for /solutions/ (W4 page 4, 改令四). Light sol-deep skeleton:
 * scene pains → fitting monitors (real product cards) → enquiry CTA.
 * The guides slot arrives with W5; scene pages ship without it for now.
 *
 * Copy discipline: generic, defensible IAQ reasoning only — no regulations
 * cited, no thresholds, no certifications, no invented specs.
 */
import sceneHome from '../assets/photos/scene-home.jpg';
import sceneOffice from '../assets/photos/scene-office.jpg';
import sceneSchool from '../assets/photos/scene-school.jpg';
import sceneIndustrial from '../assets/photos/scene-industrial.jpg';

export const SOLUTIONS_HUB = {
  meta: {
    title: 'Solutions — IAQ Monitors by Environment | AirSonde',
    description:
      'Where AirSonde monitors get deployed: homes, offices, schools and industrial interiors — and which platforms fit each environment for OEM and ODM programmes.',
  },
  eyebrow: 'Solutions',
  heading: 'Monitors that fit the room they hang in',
  intro: 'One sensing core, different rooms. Four environments cover most programmes.',
} as const;

export interface Scene {
  slug: string;
  label: string;
  photo: { src: ImageMetadata; alt: string };
  meta: { title: string; description: string };
  heading: string;
  intro: string;
  pains: { title: string; body: string }[];
  productSlugs: string[];
  productsHeading: string;
}

export const SCENES_DATA: Scene[] = [
  {
    slug: 'home',
    label: 'Home',
    photo: { src: sceneHome, alt: 'Living room with houseplants and a television' },
    meta: {
      title: 'Home Air Quality Monitors — OEM / ODM | AirSonde',
      description:
        'Desktop CO2, formaldehyde and particulate monitors for living spaces, built under your brand: readable displays, quiet housings, sensible alerts.',
    },
    heading: 'Home',
    intro: 'One glance, one question — is the air in here fine? It has to read like a clock, not an instrument.',
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
    photo: { src: sceneOffice, alt: 'Modern office with a glass meeting room and plants' },
    meta: {
      title: 'Office Air Quality Monitors — OEM / ODM | AirSonde',
      description:
        'CO2 and comfort monitors for meeting rooms and open-plan offices, white-labelled for workplace and HVAC brands.',
    },
    heading: 'Office',
    intro: 'Meeting rooms fill with people and empty of fresh air. The wall needs a number that says when to pause.',
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
    productSlugs: [
      'wide-screen-co2-monitor',
      'oval-wifi-air-quality-monitor',
      'wifi-widescreen-air-quality-monitor',
      'co2-tvoc-hcho-desktop-monitor',
    ],
  },
  {
    slug: 'school',
    label: 'School',
    photo: { src: sceneSchool, alt: 'Classroom with rows of desks by sunlit windows' },
    meta: {
      title: 'Classroom Air Quality Monitors — OEM / ODM | AirSonde',
      description:
        'Large-display CO2 monitors for classrooms, built for education-sector brands: readable across a room, simple traffic-light logic.',
    },
    heading: 'School',
    intro: 'Thirty people, windows shut through winter. The display has to read from the back row.',
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
    productSlugs: [
      '16in1-large-display-monitor',
      '8in1-desktop-monitor',
      'portrait-aqi-desktop-monitor',
      'wide-screen-co2-monitor',
    ],
  },
  {
    slug: 'industrial',
    label: 'Industrial',
    photo: { src: sceneIndustrial, alt: 'Clean warehouse interior with polished concrete floor' },
    meta: {
      title: 'Industrial Indoor Air Monitors — OEM / ODM | AirSonde',
      description:
        'Portable and desktop air monitors for warehouses, workshops and back-of-house spaces, white-labelled for safety and facilities brands.',
    },
    heading: 'Industrial',
    intro: 'Readings where the work happens — on a wall, or in a hand walking the floor.',
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

export const SOLUTIONS_CTA = {
  heading: 'Scope a programme for your environment',
  body: 'Send the market, the sensing set and the volumes.',
} as const;
