/**
 * 总工 2026-09-03: five product records' highlights arrive with CJK lenticular
 * brackets — 【Label】Text — copied from Chinese source material. Inter has no
 * glyph for U+3010/U+3011, so on the page they render as tofu boxes. The
 * brackets are removed at render time; the JSON stays as the colleague
 * wrote it (content is not ours to edit).
 *
 * The closing bracket becomes a single space only when the text runs
 * straight on ("】This all-in-one…" — 10 of the 29 affected lines), so no
 * label glues to its sentence and no line gains a second space.
 *
 * ⚠️ One implementation, two callers — the product page's highlights list
 * and the Product JSON-LD "slogan" (same data, second outlet). ⛔ Not a
 * site-wide text pipe: nothing else should route through this.
 */
export const stripLenticular = (line: string): string =>
  line.replace(/【/g, '').replace(/】(?=\S)/g, ' ').replace(/】/g, '');
