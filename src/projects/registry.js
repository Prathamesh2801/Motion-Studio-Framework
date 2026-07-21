import { defaultTheme, editorialTheme } from '@/design';

import { Hello } from './hello/index.jsx';
import { MotionDemo } from './motion-demo/index.jsx';
import { ComponentsDemo } from './components-demo/index.jsx';
import { ExplainerDemo, explainerDuration } from './explainer-demo/index.jsx';
import { MusicalDemo, musicalDuration } from './musical-demo/index.jsx';
import { LayoutsDemo, layoutsDuration } from './layouts-demo/index.jsx';
import { TemplateDemo, templateDuration } from './template-demo/index.jsx';
import { FrameworkShowcase, showcaseDuration } from './framework-showcase/index.jsx';
import { TortureTest, tortureDuration } from './torture-test/index.jsx';

/**
 * The project registry — every video this repo can render.
 *
 * `Root.jsx` maps over this list; adding a project is adding an entry here plus
 * an import above, and nothing else. Before this existed, `Root.jsx` was 140
 * lines of hand-written JSX where each project was registered slightly
 * differently and three of them silently bypassed the theme provider.
 *
 * ── WHY AN EXPLICIT ARRAY, NOT A FILESYSTEM GLOB ────────────────────────────
 * Scanning `src/projects/*` and auto-importing would save exactly one line per
 * project and break the build. Remotion bundles statically: a dynamic
 * `import(path)` built from a runtime directory listing cannot be traced by the
 * bundler, so it resolves in Studio (where the dev server can fetch anything)
 * and fails on a production render or a render farm. An explicit list is also
 * greppable and diffable, which a glob is not.
 *
 * ── ENTRY SHAPE ─────────────────────────────────────────────────────────────
 *   id          Composition id base; each format becomes `${id}-${Format}`.
 *   component   The film's root component.
 *   theme       Brand theme, injected via ThemeProvider by `registerProject`.
 *   formats     Which formats to emit. Only what a project declares is built.
 *   duration    Frames, or `(fps) => frames` when a timeline derives it.
 *   folder      Studio sidebar grouping.
 *   note        Why this project exists — shown in docs, not in the render.
 */
export const PROJECTS = [
  {
    id: 'FrameworkShowcase',
    component: FrameworkShowcase,
    theme: defaultTheme,
    formats: ['landscape', 'reel'],
    duration: showcaseDuration,
    folder: 'Showcase',
    note: 'The official engineering validation film. One chapter per subsystem — re-render after any framework change or dependency upgrade.',
  },
  {
    id: 'TortureTest',
    component: TortureTest,
    theme: defaultTheme,
    formats: ['landscape', 'reel', 'ultrawide', 'exhibition'],
    duration: tortureDuration,
    folder: 'Torture-Test',
    note: 'Robustness over beauty. The only place ultrawide and exhibition are rendered.',
  },
  {
    id: 'TemplateDemoEditorial',
    component: TemplateDemo,
    theme: editorialTheme,
    formats: ['landscape', 'reel'],
    duration: templateDuration,
    folder: 'Brand-Proof',
    note: 'The template film under a deliberately opposite brand (light paper, editorial serif, warm shadows). A component that hardcodes "text is near-white" fails here and nowhere else.',
  },

  // ── Demos: each one proves a single subsystem in isolation. ────────────────
  {
    id: 'ExplainerDemo',
    component: ExplainerDemo,
    theme: defaultTheme,
    formats: ['landscape', 'reel'],
    duration: explainerDuration,
    folder: 'Demos',
    note: 'Non-musical: scene lengths in plain seconds.',
  },
  {
    id: 'MusicalDemo',
    component: MusicalDemo,
    theme: defaultTheme,
    formats: ['landscape', 'reel'],
    duration: musicalDuration,
    folder: 'Demos',
    note: 'Grid-locked: cuts on a bar lattice, audio spliced from the same starts.',
  },
  {
    id: 'LayoutsDemo',
    component: LayoutsDemo,
    theme: defaultTheme,
    formats: ['landscape', 'reel'],
    duration: layoutsDuration,
    folder: 'Demos',
    note: 'One scene per responsive layout primitive.',
  },
  {
    id: 'TemplateDemo',
    component: TemplateDemo,
    theme: defaultTheme,
    formats: ['landscape', 'reel'],
    duration: templateDuration,
    folder: 'Demos',
    note: 'A complete film composed entirely from scene templates — no hand-written scenes.',
  },

  // ── Smoke tests: minimal compositions with no timeline or template deps. ───
  // These predate `registerProject` and used to be registered by hand, which
  // meant they rendered OUTSIDE the theme provider. They now go through the same
  // path as everything else, so "it works in the smoke test" means the same
  // thing it means everywhere else.
  {
    id: 'Hello',
    component: Hello,
    theme: defaultTheme,
    formats: ['landscape', 'reel'],
    duration: 120,
    folder: 'Smoke-Test',
    note: 'Does the bundle build and paint at all.',
  },
  {
    id: 'MotionDemo',
    component: MotionDemo,
    theme: defaultTheme,
    formats: ['landscape', 'reel'],
    duration: 150,
    folder: 'Smoke-Test',
    note: 'Motion engine without the timeline.',
  },
  {
    id: 'ComponentsDemo',
    component: ComponentsDemo,
    theme: defaultTheme,
    formats: ['landscape', 'reel'],
    duration: 150,
    folder: 'Smoke-Test',
    note: 'Component library without the timeline.',
  },
];

/** Studio folder order. Anything not listed sorts to the end, alphabetically. */
export const FOLDER_ORDER = ['Showcase', 'Torture-Test', 'Brand-Proof', 'Demos', 'Smoke-Test'];

/** Projects grouped by folder, in `FOLDER_ORDER`. */
export const projectsByFolder = () => {
  const groups = new Map();
  for (const project of PROJECTS) {
    const folder = project.folder ?? 'Projects';
    if (!groups.has(folder)) groups.set(folder, []);
    groups.get(folder).push(project);
  }

  const rank = (name) => {
    const index = FOLDER_ORDER.indexOf(name);
    return index === -1 ? FOLDER_ORDER.length : index;
  };

  return [...groups.entries()].sort(
    ([a], [b]) => rank(a) - rank(b) || a.localeCompare(b),
  );
};
