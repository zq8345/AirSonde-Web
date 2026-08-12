# Photo log — concept photography on airsonde.com

Rule (inherited from wanew About v8 discipline, mandated by W4): every stock /
concept photo on the site is logged here — source, licence, where it is used.
Concept photography may set atmosphere only. It must never stand behind a
manufacturing, quality or certification claim; those need our own photos of
our own facts.

All five images below: **Unsplash License** (free for commercial use, no
attribution required, no permission needed; resold unmodified copies are the
only prohibited use). Downloaded 2026-08-11 at w=1600 via images.unsplash.com.

| File (src/assets/photos/) | Unsplash source page | Photo ID | Used for | Notes |
|---|---|---|---|---|
| `hero-living-room.jpg` | https://unsplash.com/photos/black-and-white-living-room-set-crjt6vBgYeg | `photo-1615529179035-e760f6a2dcee` | Homepage hero | Photographer: @spacejoy. `--hero-focus: 62% 48%` (sofa + palm centre-right) |
| `scene-home.jpg` | https://unsplash.com/photos/gray-sofa-chair-near-green-potted-plant-KsXifvHh5Vo | `photo-1612543322525-f021384dc6a4` | "For every environment" — Home | |
| `scene-office.jpg` | https://unsplash.com/photos/an-office-with-a-plant-in-the-middle-of-the-room-fftMS_6sRHo | `photo-1700809888987-cf2b29ecbd2c` | "For every environment" — Office | |
| `scene-school.jpg` | https://unsplash.com/photos/empty-classroom-with-desks-and-chairs-by-windows-rkH8YVmjQ4w | `photo-1757193714692-44cdf07a5377` | "For every environment" — School | |
| `scene-industrial.jpg` | https://unsplash.com/photos/empty-modern-warehouse-interior-with-polished-concrete-floor-3lkaszxWfGc | `photo-1771530789155-b1f03fbf82b5` | "For every environment" — Industrial | |

Photographer names other than the first were not captured (Unsplash raised a
bot check mid-session and we stopped browsing rather than solve it); the
source pages above are the canonical record. Attribution is appreciated but
not required by the licence.

## Factory photography on /about/ (own-group assets, 2026-08-11)

Six photos forked from the wanew repo (`wanew/static/upload/image/about/`,
also live on wanew.com/about) into `src/assets/photos/factory/`. These are
Joe's own manufacturing group's facility photos — reuse authorized by Joe via
总工 (改令二) for AirSonde as the group's IAQ line. Reviewed individually:
no Starlink product close-ups in frame, all generic manufacturing scenes.
These ARE manufacturing evidence, used as such — unlike the Unsplash concept
photos above, which never back a manufacturing claim.

| File | Used for |
|---|---|
| `factory-assembly.webp` | /about/ hero |
| `factory-cnc.webp` | gallery — tooling & moulding |
| `factory-qc.webp` | gallery — testing |
| `factory-warehouse.webp` | gallery — warehousing |
| `factory-shipping.webp` | gallery — dispatch |
| `factory-office.webp` | gallery — engineering & support |

## Hero composite (改令三, 2026-08-11)

The hero shows `hero-living-room.jpg` (above) as the scene plus our own
product render `src/assets/products/co2-tvoc-hcho-desktop-monitor.webp`
(AS-D3, supplier asset already in the repo) on a floating light-stage card.
No in-scene supplier photo passed review — the only lifestyle shot in the
38 shows unreleased children and stays banned.

## Rejected during selection (why they failed docs/asset-review.md)

- `photo-1594235048794` (office desks): **ViewSonic wordmarks** visible on
  monitors — third-party brand in frame.
- `photo-1604328698692` (office lounge): identifiable people at a table — no
  release on file.
- `photo-1616593871468` (living room): fireplace with open flame — an odd
  frame for an air-quality brand.

## Rendered hero composites (W6② → W9 §1, 2026-08-12)

Joe retired the floating-card hero ("傻子设计") — the scene must CONTAIN the
product. `scripts/build-hero-composite.mjs` renders these: border-connected
flood fill cuts the listing photo's white background (interior housing whites
survive), then the cutout lands on a real surface in the scene with a soft
elliptical contact shadow. Source photos and product renders are assets
already logged above — no new photography.

| File | Scene | Product | Placement |
|---|---|---|---|
| `hero-composite-a.webp` | `hero-living-room.jpg` | AS-D3 desktop monitor | coffee table, centre-right |
| `hero-composite-b.webp` | `scene-home.jpg` | AS-D3 desktop monitor | TV console (weakest — scale reads small) |
| `hero-composite-c.webp` | `scene-office.jpg` | AS-D16 large-display | office desk, right |

A ships as the production hero; A/B/C go to a preview branch for Joe to pick
(视觉判断归 Joe). Regenerate with `node scripts/build-hero-composite.mjs`.

## Joe-supplied hero banner trial (2026-08-12)

`hero-joe-workspace.webp` — from `C:\Download\airsonde-hero.png`, provided by
Joe ("放到首页 hero 位置看看"). 1464×600 marketing banner: man at a desk,
AS-D16-style monitor beside a laptop, headline text BAKED INTO the left side
("Breathe Easily in Your Workspace…"). Likely a supplier marketing asset —
⚠️ real identifiable model, no release on file (asset-review question 17);
flagged to 总工, not blocked (Joe's call). `hero-composite-a.webp` retained
for switching back.

### hero-joe-workspace-clean.webp (2026-08-12)

Same Joe-supplied banner with the baked marketing text painted out by
`scripts/clean-hero-banner.mjs` (row-interpolated wall fill, x55-545 /
y140-340, verified seamless). Exists so our own headline can sit on the
cleaned wall while the device stays visible. Portrait-release caveat from
the parent asset carries over unchanged.
