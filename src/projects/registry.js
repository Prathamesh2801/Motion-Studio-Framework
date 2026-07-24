import { z } from "zod";
import { defaultTheme, atelierTheme } from "@/design";

import {
  FrameworkShowcase,
  showcaseDuration,
} from "./framework-showcase/index.jsx";
import {
  FromIdeaToReality,
  fromIdeaToRealityDuration,
} from "./from-idea-to-reality/index.jsx";
import {
  openingSchema,
  OPENING_DEFAULT_PROPS,
} from "./from-idea-to-reality/opening/schema.js";
import {
  endingSchema,
  ENDING_DEFAULT_PROPS,
} from "./from-idea-to-reality/ending/schema.js";

/**
 * `FromIdeaToReality`'s composition-level prop schema — a `<Composition>`
 * takes exactly one `schema`, so the opening's and ending's groups (each
 * already a complete schema in its own right, with its own `title`/`debug`
 * groups) nest under `openingProps`/`endingProps` here rather than being
 * flattened, which would collide on those key names. See `opening/schema.js`
 * / `ending/schema.js` for each sequence's own groups.
 */
const fromIdeaToRealitySchema = z.object({
  openingProps: openingSchema,
  endingProps: endingSchema,
});
const FROM_IDEA_TO_REALITY_DEFAULT_PROPS = {
  openingProps: OPENING_DEFAULT_PROPS,
  endingProps: ENDING_DEFAULT_PROPS,
};

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
    id: "FromIdeaToReality",
    component: FromIdeaToReality,
    theme: atelierTheme,
    formats: ["landscape", "reel"],
    duration: fromIdeaToRealityDuration,
    schema: fromIdeaToRealitySchema,
    defaultProps: FROM_IDEA_TO_REALITY_DEFAULT_PROPS,
    folder: "Film",
    note: "The first cinematic short built on the framework. A silent, score-driven film about the distance between having an idea and making it real. Opening and ending are both tunable live via the Studio Props panel — see opening/schema.js / ending/schema.js.",
  },

  {
    id: "FrameworkShowcase",
    component: FrameworkShowcase,
    theme: defaultTheme,
    formats: ["landscape", "reel"],
    duration: showcaseDuration,
    folder: "Showcase",
    note: "The official engineering validation film. One chapter per subsystem — re-render after any framework change or dependency upgrade.",
  },
];

/** Studio folder order. Anything not listed sorts to the end, alphabetically. */
export const FOLDER_ORDER = ["Film", "Showcase"];

/** Projects grouped by folder, in `FOLDER_ORDER`. */
export const projectsByFolder = () => {
  const groups = new Map();
  for (const project of PROJECTS) {
    const folder = project.folder ?? "Projects";
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
