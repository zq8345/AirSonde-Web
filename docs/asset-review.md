# Product photo review — what disqualifies an image

Every photo in `src/assets/products/originals/` came from a supplier's own
marketplace listing. None of it was shot for us, and we do not hold the rights
to any of it. Before a product goes `status: "published"`, its images get
looked at one by one — not sampled, not skimmed.

We sell white-label hardware to European and American brands. A buyer who
finds someone else's mark, or someone else's face, on our site stops reading.

## Disqualifying — set `status: "draft"` and say so in the report

1. **Another company's brand mark, logo or wordmark anywhere in the frame.**
   Five of the first 38 carried an `ICANOW` logo in the top-left corner.
2. **Another company's model number** on the housing, the screen or a label.
3. **People we have no release for.** One photo showed two identifiable
   children in a living room. This is not a watermark, and it is more serious
   than one: publishing an identifiable person — a child especially — without
   a model release is a legal exposure in exactly the markets we sell into.
4. **Places and third-party objects we have no right to.** Recognisable
   interiors, storefronts, vehicles, artwork, or branded objects sharing the
   frame with the product.
5. **Marketing overlays** — burned-in claim text, price flashes, festival
   badges. These are written for a marketplace search result, not for a
   manufacturer's site, and they usually make a claim we cannot evidence.

## The check, in order

- Look at the **whole frame**, corners first. Logos sit in corners.
- Read **the screen**. It tells you what the device actually measures, and it
  is the only description of the product we can trust — see below.
- Look for **anyone in the shot**, including reflections and background.
- Ask what else is recognisable: room, building, brand, artwork.

## Never classify a product from its filename

The supplier's listing titles are keyword strings written for marketplace
search, not descriptions. Contract C1 already forbids copying them into
`name` — the same distrust applies to deciding *what a product is*.

The `19-` photo is filed as `Portable-8-In1-Gas-Detector`. Its screen reads
PM2.5, PM1.0, PM10, TVOC, HCHO, temperature, humidity and CO2 — eight indoor
air quality parameters. It is a desktop IAQ monitor, and it was very nearly
dropped from the range on the strength of its filename.

Classify from what is observable in the image. If the image cannot settle it,
the product stays `draft` until someone can.
