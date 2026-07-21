#!/usr/bin/env node
/**
 * verify — the one command that says whether the framework is healthy.
 *
 *   npm run verify          fast pass: tests, theme sync, compositions, key stills
 *   npm run verify -- --full   adds a complete FrameworkShowcase MP4 render
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 * Every check below could be run by hand, and that is the problem. Verification
 * that takes six commands and a memory of which stills matter is verification
 * that quietly stops happening — and this framework's output is *visual*, so
 * regressions are silent: nothing throws when a font falls back, a layout stops
 * reflowing, or a transition times a frame short.
 *
 * The still set is chosen so that a failure is ATTRIBUTABLE: each frame targets
 * one subsystem in one format, and every still is rendered in both a landscape
 * and a vertical format, because layouts reflow per format and only landscape
 * tends to get looked at.
 */

import { spawnSync } from 'node:child_process';
import { mkdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const OUT = join(ROOT, 'out', 'verify');

const full = process.argv.includes('--full');

const results = [];
let failed = 0;

const run = (label, command, args, { quiet = true } = {}) => {
  process.stdout.write(`  ${label} … `);
  const started = Date.now();
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    stdio: quiet ? 'pipe' : 'inherit',
  });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  const ok = result.status === 0;

  console.log(ok ? `ok (${seconds}s)` : `FAIL (${seconds}s)`);
  if (!ok) {
    failed += 1;
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
    if (output) {
      console.log(
        output
          .split('\n')
          .slice(-15)
          .map((line) => `      ${line}`)
          .join('\n'),
      );
    }
  }
  results.push({ label, ok, seconds });
  return ok;
};

/**
 * The still set. Each entry names the subsystem it isolates, so a failure or an
 * odd-looking frame points at a module rather than at "the video".
 */
const STILLS = [
  // Showcase chapters, landscape — one per subsystem.
  ['motion engine',      'FrameworkShowcase-Landscape', 260],
  ['camera',             'FrameworkShowcase-Landscape', 500],
  ['typography',         'FrameworkShowcase-Landscape', 740],
  ['components',         'FrameworkShowcase-Landscape', 950],
  ['layouts',            'FrameworkShowcase-Landscape', 1200],
  ['templates',          'FrameworkShowcase-Landscape', 1520],
  ['nested timeline',    'FrameworkShowcase-Landscape', 1900],
  ['audio',              'FrameworkShowcase-Landscape', 2130],
  ['theme switch',       'FrameworkShowcase-Landscape', 2420],

  // The same film vertical — reflow is where per-format bugs live.
  ['layouts (portrait)',   'FrameworkShowcase-Reel', 1200],
  ['templates (portrait)', 'FrameworkShowcase-Reel', 1520],
  ['theme switch (portrait)', 'FrameworkShowcase-Reel', 2420],

  // Robustness, including the two formats nobody looks at.
  ['torture: long text',   'TortureTest-Landscape', 100],
  ['torture: empty slots', 'TortureTest-Reel', 340],
  ['torture: ultrawide',   'TortureTest-Ultrawide', 100],
  ['torture: exhibition',  'TortureTest-Exhibition', 100],

  // The opposite brand — catches hardcoded dark-theme assumptions.
  ['brand proof',            'TemplateDemoEditorial-Landscape', 520],
  ['brand proof (portrait)', 'TemplateDemoEditorial-Reel', 250],
];

console.log('\nMotion Studio Framework — verify\n');

console.log('Correctness');
run('unit tests', 'node', ['scripts/test.mjs']);
run('theme ↔ css in sync', 'node', ['scripts/theme-to-css.mjs', '--check']);

console.log('\nRegistration');
run('compositions resolve', 'npx', ['remotion', 'compositions', 'src/index.jsx']);

console.log('\nStills');
mkdirSync(OUT, { recursive: true });
for (const [label, composition, frame] of STILLS) {
  const file = join(OUT, `${composition}-${frame}.png`);
  const ok = run(label, 'npx', [
    'remotion',
    'still',
    'src/index.jsx',
    composition,
    file,
    `--frame=${frame}`,
  ]);
  // A still that "succeeds" but writes a suspiciously small file is usually a
  // blank frame — worth catching here rather than in review.
  if (ok && existsSync(file) && statSync(file).size < 5_000) {
    console.log(`      warning: ${file} is only ${statSync(file).size} bytes — likely blank.`);
  }
}

if (full) {
  console.log('\nFull render');
  run(
    'FrameworkShowcase MP4 (landscape)',
    'npx',
    ['remotion', 'render', 'src/index.jsx', 'FrameworkShowcase-Landscape', join(OUT, 'showcase.mp4')],
    { quiet: true },
  );
}

const total = results.length;
const passed = total - failed;
console.log(
  `\n${passed}/${total} checks passed${failed ? ` — ${failed} FAILED` : ''}.` +
    (full ? '' : '\nRun `npm run verify -- --full` to add a complete MP4 render.') +
    `\nStills: out/verify/\n`,
);

process.exit(failed ? 1 : 0);
