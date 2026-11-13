import {
  CloudSlash,
  VialsVerdict,
  ChartArrow,
  ICON_DURATION,
} from "./icon-animations/index.jsx";

/**
 * Every video this repo can render. `Root.jsx` maps over this list.
 *
 * An explicit array, not a glob: Remotion bundles statically, so a dynamic
 * import from a directory listing works in Studio but fails on render.
 *
 *   id          Composition id base; each format becomes `${id}-${Format}`.
 *   component   The film's root component.
 *   theme       Optional brand theme, injected by `registerProject`.
 *   formats     Which formats to emit (see framework/formats).
 *   duration    Frames, or `(fps) => frames` when a timeline derives it.
 *   folder      Studio sidebar grouping.
 *   schema / defaultProps   Optional, for the Studio props panel.
 */
export const PROJECTS = [
  ...[
    ["CloudSlash", CloudSlash],
    ["VialsVerdict", VialsVerdict],
    ["ChartArrow", ChartArrow],
  ].map(([id, component]) => ({
    id,
    component,
    formats: ["square"],
    duration: ICON_DURATION,
    folder: "Icons",
  })),
];

/** Projects grouped by folder, in first-seen order. */
export const projectsByFolder = () => {
  const groups = new Map();
  for (const project of PROJECTS) {
    const folder = project.folder ?? "Projects";
    if (!groups.has(folder)) groups.set(folder, []);
    groups.get(folder).push(project);
  }
  return [...groups.entries()];
};
