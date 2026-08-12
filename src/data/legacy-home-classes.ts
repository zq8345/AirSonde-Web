/**
 * Tailwind source-lock for the light-home sample branch.
 *
 * The 15 untouched pages share one generated stylesheet. Tailwind emits a
 * utility only while some scanned file still uses it, so rebuilding the
 * homepage without these classes would reduce that stylesheet, change its
 * hash, and flip the stylesheet href on every untouched page — failing the
 * byte-identity acceptance check. This file keeps the old homepage class
 * list in scanner reach. Delete it when the redesign replaces the dark
 * pages for real.
 *
 * ⚠️ Prose in EVERY new file on this branch is scanned too — an English word
 * that happens to name a Tailwind utility becomes a generated class. Two
 * words in an earlier version of this very comment added two utilities to
 * the shared stylesheet and broke byte-identity. Keep wording boring.
 */
export const LEGACY_HOME_CLASSES = "-top-40 -translate-x-1/2 absolute bg-air-500 bg-air-500/10 bg-white/[0.02] bg-white/[0.03] blur-3xl border border-air-400/30 border-air-500/40 border-b border-l-2 border-white/10 border-white/15 decoration-air-400/40 flex flex-wrap font-bold font-medium font-semibold gap-2.5 gap-3 gap-6 gap-x-10 gap-y-8 grid h-[38rem] hover:bg-air-400 hover:bg-white/5 hover:border-white/30 hover:text-air-400 inline-flex items-center leading-[1.1] leading-relaxed left-1/2 lg:text-6xl max-w-2xl max-w-3xl max-w-6xl md:grid-cols-2 md:grid-cols-3 ml-2 mt-10 mt-12 mt-2 mt-3 mt-4 mt-5 mt-6 mt-8 mt-9 mx-auto overflow-hidden p-6 p-8 pl-5 pointer-events-none px-3.5 px-5 px-6 py-1.5 py-2 py-20 py-3 relative rounded-2xl rounded-full rounded-lg rounded-xl scroll-mt-20 sm:p-12 sm:px-8 sm:py-28 sm:text-3xl sm:text-5xl sm:text-base sm:text-lg text-2xl text-4xl text-air-300 text-air-400 text-base text-ink-100 text-ink-300 text-ink-400 text-ink-50 text-ink-950 text-lg text-sm text-xs tracking-tight tracking-wider transition-colors underline underline-offset-4 uppercase w-[38rem]";
