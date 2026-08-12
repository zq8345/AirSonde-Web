/**
 * Copy deck for the NEW sections the light homepage adds (W4 sample).
 * Existing copy stays in site.ts and is rendered verbatim — the assertions
 * over it (OEM/ODM counts, banned words) must not move. Nothing in this file
 * may contain OEM / ODM / tooling / certification words: new labels must not
 * shift those counts.
 */

import heroImg from '../assets/photos/hero-living-room.jpg';
import sceneHome from '../assets/photos/scene-home.jpg';
import sceneOffice from '../assets/photos/scene-office.jpg';
import sceneSchool from '../assets/photos/scene-school.jpg';
import sceneIndustrial from '../assets/photos/scene-industrial.jpg';

export const HERO_PHOTO = {
  src: heroImg,
  alt: 'Bright living room with grey sofa and a large palm plant by the window',
  /** §3.2d --hero-focus: subject (sofa + plant) sits centre-right */
  focus: '62% 48%',
} as const;

/**
 * Hero product (改令三): the hero must show one of our units. The 38 supplier
 * photos have no usable in-scene shot (the one lifestyle photo shows
 * unreleased children — asset-review bans it), so the hero composites the
 * scene photo with this product on a floating stage card. Label is the model
 * code only: it adds no keyword noise to the audited copy counts.
 */
export const HERO_PRODUCT = {
  slug: 'co2-tvoc-hcho-desktop-monitor',
} as const;

/** Featured strip — hand-picked, not the catalogue (§3.6 curation rule). */
export const FEATURED = {
  eyebrow: 'Featured',
  heading: 'A place to start',
  slugs: [
    'co2-tvoc-hcho-desktop-monitor',
    'wide-screen-co2-monitor',
    '16in1-large-display-monitor',
    'oval-wifi-air-quality-monitor',
    'handheld-air-quality-analyser',
    'portable-co-alarm',
  ],
} as const;

export const FORM_FACTORS = {
  eyebrow: 'Browse',
  heading: 'By form factor',
  /** representative image per category, resolved from the product data */
  tiles: [
    { category: 'desktop', label: 'Desktop', imageFrom: 'co2-tvoc-hcho-desktop-monitor' },
    { category: 'portable', label: 'Portable', imageFrom: 'portable-co-alarm' },
  ],
} as const;

export const SCENES = {
  eyebrow: 'Environments',
  heading: 'For every environment',
  cards: [
    { label: 'Home', src: sceneHome, alt: 'Living room with houseplants and a television' },
    { label: 'Office', src: sceneOffice, alt: 'Modern office with a glass meeting room and plants' },
    { label: 'School', src: sceneSchool, alt: 'Classroom with rows of desks by sunlit windows' },
    {
      label: 'Industrial',
      src: sceneIndustrial,
      alt: 'Clean warehouse interior with polished concrete floor',
    },
  ],
} as const;
