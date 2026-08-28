import type { APIRoute } from 'astro';

/**
 * Which commit is actually serving, and when it was built.
 *
 * ⚠️ Why: on 2026-08-28 the site's build failed for nine hours. The admin kept
 * reporting every save as successful and none of them reached the site. It was
 * found by noticing that a deleted page could still be opened — luck, not a
 * signal. This is the signal.
 *
 * ⛔ Two fields only. No branch name, no build log, no environment variables:
 * this is a public URL, and the answer to "is production current?" needs
 * exactly a commit and a time.
 *
 * ⛔ Deliberately NOT a <meta> in the HTML. A stamp in every page would change
 * every page on every commit, which would make a byte-for-byte dist comparison
 * — the criterion used to prove a refactor changed nothing — useless.
 *
 * 🔴 It still costs one file: `builtAt` differs on every build, so dist/build.json
 * is never byte-identical between two builds. Any future "the output did not
 * change" comparison MUST exclude dist/build.json, or it will report one
 * CHANGED file forever and someone will have to re-explain it every time. That
 * is the whole reason this is one file rather than a meta tag in all 36 pages.
 *
 * ⚠️ Caching: measured on production before writing this, Cloudflare Pages
 * already serves JSON as `public, max-age=0, must-revalidate` with
 * `cf-cache-status: DYNAMIC`, so no _headers rule is needed. A build.json
 * reporting a stale sha would be worse than none — it would make someone
 * confident of a state that is not true — so the flip is verified after
 * deploying, without a cache-buster.
 *
 * ⚠️ Verified on production 2026-08-28: the sha flipped 45s after a push,
 * read without a cache-buster, and again on the next commit.
 *
 * ⚠️ Outside Cloudflare (a local `pnpm build`) the variable is absent and this
 * says "local". That means "not built by CI", NOT "production is stale".
 */
export const GET: APIRoute = () => {
  const sha = process.env.CF_PAGES_COMMIT_SHA ?? 'local';
  const builtAt = new Date().toISOString();

  return new Response(`${JSON.stringify({ sha, builtAt })}\n`, {
    headers: { 'content-type': 'application/json' },
  });
};
