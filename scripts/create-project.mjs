#!/usr/bin/env node
/**
 * create-project — scaffold a new video.
 *
 * Usage:
 *   npm run create-project -- from-idea-to-reality
 *   npm run create-project -- from-idea-to-reality --title "From Idea to Reality"
 *
 * Writes `src/projects/<id>/` (timeline, content, assembler), creates the
 * project's asset directory under `public/projects/<id>/`, and prints the two
 * lines to paste into `src/projects/registry.js`.
 *
 * ── WHY IT DOES NOT EDIT THE REGISTRY ITSELF ────────────────────────────────
 * It would be easy to splice an entry into `registry.js` with a regex. It would
 * also be the kind of magic that works until someone reformats the file, and it
 * hides the one thing a new author most needs to learn: projects are declared in
 * one explicit list. Printing the lines is a two-second paste and teaches the
 * model. The generated code is the product; the registry stays hand-edited.
 *
 * The scaffold deliberately produces a film that RENDERS IMMEDIATELY — three
 * real beats using real templates — rather than a skeleton full of TODOs. A new
 * project should be something you edit, not something you finish.
 */

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');

// ── Arguments ───────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i].startsWith('--')) {
    flags[argv[i].slice(2)] = argv[i + 1]?.startsWith('--') ? true : argv[(i += 1)];
  } else {
    positional.push(argv[i]);
  }
}

const id = positional[0];

if (!id) {
  console.error(`
create-project — scaffold a new video.

  npm run create-project -- <project-id> [--title "Title"] [--formats landscape,reel]

  <project-id>   kebab-case, e.g. from-idea-to-reality

Options:
  --title    Display title used in the opening card. Defaults to the id, title-cased.
  --formats  Comma-separated format names. Default: landscape,reel
`);
  process.exit(1);
}

if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(id)) {
  console.error(
    `create-project: "${id}" is not a valid project id.\n` +
      '  Use lowercase kebab-case, e.g. "from-idea-to-reality".',
  );
  process.exit(1);
}

const words = id.split('-');
const pascal = words.map((w) => w[0].toUpperCase() + w.slice(1)).join('');
const camel = pascal[0].toLowerCase() + pascal.slice(1);
const title = typeof flags.title === 'string' ? flags.title : words.map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const formats = (typeof flags.formats === 'string' ? flags.formats : 'landscape,reel')
  .split(',')
  .map((f) => f.trim())
  .filter(Boolean);

const projectDir = join(ROOT, 'src', 'projects', id);
const assetDir = join(ROOT, 'public', 'projects', id);

if (existsSync(projectDir)) {
  console.error(`create-project: src/projects/${id}/ already exists. Refusing to overwrite.`);
  process.exit(1);
}

// ── Files ───────────────────────────────────────────────────────────────────

const timelineFile = `import { buildTimeline } from '@/framework';

/**
 * ${title} — structure.
 *
 * The film is DATA. Each entry is a beat: an id the scene map keys off, and a
 * length. Re-ordering the film is re-ordering this array; every frame position,
 * the total duration and the transition overlap are derived from it, so
 * changing one beat never means recalculating the ones after it.
 *
 * The \`seconds\` timebase suits copy-paced video. Swap to \`bars\` for
 * music-locked cutting, \`frames\` for exact control, or register your own —
 * see docs/TIMELINE.md.
 */
export const SCENE_PLAN = [
  { id: 'title', seconds: 4 },
  { id: 'point', seconds: 5 },
  { id: 'outro', seconds: 4 },
];

/** Motion token; the timeline gap and the transition length read the same value. */
export const TRANSITION = 'base';

export const ${camel}Timeline = (fps) =>
  buildTimeline(SCENE_PLAN, { fps, timebase: 'seconds', transition: TRANSITION });

export const ${camel}Duration = (fps) => ${camel}Timeline(fps).durationInFrames;
`;

const contentFile = `/**
 * ${title} — copy and data.
 *
 * Kept apart from the assembler so the words can be edited without touching
 * anything structural, and so the same scenes could be driven by different
 * content (a second language, a client variant) with no code change.
 */

export const COPY = {
  kicker: '${title}',
  title: 'Say the one thing\\nthis film is about.',
  subtitle: 'A sentence that earns the next four seconds.',

  pointEyebrow: 'The point',
  pointTitle: 'One idea per beat.',
  pointDescription:
    'A viewer can hold exactly one thought at a time. Give each beat a single job.',

  brandName: '${title}',
  tagline: 'Closing line.',
  website: 'example.com',
};

/**
 * Assets live in \`public/projects/${id}/\` and resolve through \`asset\`:
 *
 *   import { assetsFor } from '@/framework';
 *   export const asset = assetsFor('${id}');
 *   asset.image('hero.png')   →  projects/${id}/images/hero.png
 *   asset.music('score.wav')  →  projects/${id}/music/score.wav
 */
`;

const indexFile = `import React from 'react';
import { useVideoConfig } from 'remotion';
import { StandardFilm, TitleScene, SectionIntro, OutroScene } from '@/templates';
import { ${camel}Timeline, ${camel}Duration } from './timeline.js';
import { COPY } from './content.js';

/**
 * ${title}.
 *
 * The assembler: a timeline (structure) plus a scene map (which template plays
 * each beat). Note what is absent — no frame offsets, no layout maths, no
 * \`if (isVertical)\` branches, no transition wiring. Those belong to the
 * timeline, the layouts and \`StandardFilm\` respectively.
 *
 * Every beat reflows across all four format buckets on its own.
 */
export const ${pascal} = () => {
  const { fps } = useVideoConfig();
  const timeline = ${camel}Timeline(fps);

  return (
    <StandardFilm
      timeline={timeline}
      transition="fade"
      scenes={{
        title: (
          <TitleScene
            kicker={COPY.kicker}
            title={COPY.title}
            subtitle={COPY.subtitle}
          />
        ),

        point: (
          <SectionIntro
            index="01"
            eyebrow={COPY.pointEyebrow}
            title={COPY.pointTitle}
            description={COPY.pointDescription}
          />
        ),

        outro: (
          <OutroScene
            brandName={COPY.brandName}
            tagline={COPY.tagline}
            website={COPY.website}
          />
        ),
      }}
    />
  );
};

export { ${camel}Duration };
export default ${pascal};
`;

// ── Write ───────────────────────────────────────────────────────────────────

mkdirSync(projectDir, { recursive: true });
writeFileSync(join(projectDir, 'timeline.js'), timelineFile, 'utf8');
writeFileSync(join(projectDir, 'content.js'), contentFile, 'utf8');
writeFileSync(join(projectDir, 'index.jsx'), indexFile, 'utf8');

// Asset directories are created eagerly so there is an obvious place to put
// files — an empty, named directory answers "where do images go?" better than
// any amount of documentation.
for (const kind of ['images', 'video', 'music']) {
  mkdirSync(join(assetDir, kind), { recursive: true });
}
writeFileSync(
  join(assetDir, 'README.md'),
  `# ${title} — assets\n\nResolve these through \`assetsFor('${id}')\`, never a raw \`staticFile\` path:\n\n\`\`\`js\nimport { assetsFor } from '@/framework';\nconst asset = assetsFor('${id}');\nasset.image('hero.png');   // projects/${id}/images/hero.png\n\`\`\`\n\nDirectories: \`images/\`, \`video/\`, \`music/\`, and any other kind you need —\nan unknown kind is used verbatim as the folder name.\n`,
  'utf8',
);

const formatList = formats.map((f) => `'${f}'`).join(', ');

console.log(`
Created src/projects/${id}/
  timeline.js   structure — the beats and their lengths
  content.js    copy and data
  index.jsx     the assembler

Created public/projects/${id}/{images,video,music}/

Add to src/projects/registry.js:

  import { ${pascal}, ${camel}Duration } from './${id}/index.jsx';

  {
    id: '${pascal}',
    component: ${pascal},
    theme: defaultTheme,
    formats: [${formatList}],
    duration: ${camel}Duration,
    folder: 'Projects',
    note: '${title}.',
  },

Then:  npm run studio
`);
