/**
 * Every asset an import points at must be IN THE GIT INDEX, not merely on disk.
 *
 * 🔴 Why the index and not the filesystem: on 2026-08-28 the site's build
 * failed on Cloudflare and production sat frozen, because an import pointed at
 * src/assets/photos/products-hero-showroom-v1.webp — a file that existed in the
 * working copy and had never been committed. Every local build was green. A
 * check that looks at the disk would have been green too, because the disk is
 * exactly the thing that differs from CI.
 *
 * ⚠️ Runs BEFORE `astro build`, so the answer arrives before the minutes spent
 * building — and, more to the point, before the push.
 *
 * ⛔ Fails, does not warn: an unresolvable import is a broken deployment, and
 * the failure it replaces was silent for 35 minutes.
 */
import { readdir, readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const run = promisify(execFile);

const SRC = 'src';
const SOURCE_EXT = /\.(astro|ts|tsx|js|mjs|jsx)$/i;
// import x from '<anything>/assets/<anything>' — the quoted specifier only.
const IMPORT_RE = /from\s+['"]([^'"]*\/assets\/[^'"]+)['"]/g;

const walk = async (dir, out = []) => {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else if (SOURCE_EXT.test(entry.name)) out.push(full);
  }
  return out;
};

const { stdout } = await run('git', ['ls-files', '-z'], { maxBuffer: 1 << 24 });
const tracked = new Set(stdout.split('\0').filter(Boolean));

const files = await walk(SRC);
const missing = [];
let checked = 0;

for (const file of files) {
  const body = await readFile(file, 'utf8');
  for (const match of body.matchAll(IMPORT_RE)) {
    const specifier = match[1];
    // Only relative specifiers resolve to a repo path; anything else is a
    // package and is not ours to check.
    if (!specifier.startsWith('.')) continue;
    const resolved = path
      .normalize(path.join(path.dirname(file), specifier))
      .split(path.sep)
      .join('/');
    checked += 1;
    if (!tracked.has(resolved)) {
      missing.push(`${file.split(path.sep).join('/')} imports ${specifier} -> ${resolved}`);
    }
  }
}

console.log(`  asset imports: ${checked} checked against the git index, ${missing.length} untracked`);
if (missing.length) {
  console.error(
    `\n✗ ${missing.length} asset import(s) point at a file that is not committed. ` +
      `The build will succeed here and fail on CI, which is how production froze on 2026-08-28:`,
  );
  for (const line of missing) console.error(`  - ${line}`);
  console.error('\n  Fix: git add the file, or point the import at one that is tracked.');
  process.exit(1);
}
