import React from 'react';
import { Composition } from 'remotion';
import { FORMATS } from '../formats/index.js';
import { ThemeProvider } from '../theme/index.js';

/**
 * Multi-format composition registration (Ring 1).
 *
 * A project declares WHAT it is once — component, brand theme, formats, length —
 * and this emits one <Composition> per requested format, wrapping each in the
 * project's <ThemeProvider>. That removes two failure modes the reference had:
 * formats defined but never registered, and compositions that forget the theme.
 *
 * Registering only the formats a project declares is deliberate: the reference
 * defined five and registered three, leaving two unreachable.
 */

/**
 * Cache themed wrappers so a re-render of Root does not produce a new component
 * identity (which would remount the whole composition).
 */
const wrapperCache = new Map();

const withTheme = (Component, theme) => {
  let byTheme = wrapperCache.get(Component);
  if (!byTheme) {
    byTheme = new Map();
    wrapperCache.set(Component, byTheme);
  }
  const cached = byTheme.get(theme);
  if (cached) return cached;

  const Wrapped = (props) => (
    <ThemeProvider theme={theme}>
      <Component {...props} />
    </ThemeProvider>
  );
  Wrapped.displayName = `Themed(${Component.displayName || Component.name || 'Composition'})`;
  byTheme.set(theme, Wrapped);
  return Wrapped;
};

const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1);

/**
 * @param {object} project
 * @param {string} project.id            Base id; each composition becomes `${id}-${Format}`.
 * @param {React.ComponentType} project.component
 * @param {object} [project.theme]       Brand theme; omit only if the component provides its own.
 * @param {Array<string|object>} [project.formats=['landscape']]
 *        Format names from `FORMATS`, or format objects.
 * @param {number|Function} project.durationInFrames
 *        A frame count, or `(fps) => frames` for timebases that depend on fps.
 * @param {object} [project.schema]      Zod schema; drives the Studio sidebar and `--props`.
 * @param {object} [project.defaultProps]
 * @returns {Array<React.ReactElement>} <Composition> elements for Root.
 */
export const registerProject = ({
  id,
  component,
  theme,
  formats = ['landscape'],
  durationInFrames,
  schema,
  defaultProps,
}) => {
  if (!id) throw new Error('registerProject: `id` is required.');
  if (!component) throw new Error(`registerProject("${id}"): \`component\` is required.`);
  if (durationInFrames === undefined) {
    throw new Error(`registerProject("${id}"): \`durationInFrames\` is required.`);
  }

  const Component = theme ? withTheme(component, theme) : component;

  return formats.map((entry) => {
    const format = typeof entry === 'string' ? FORMATS[entry] : entry;
    if (!format) {
      throw new Error(
        `registerProject("${id}"): unknown format "${entry}". Known: ${Object.keys(FORMATS).join(', ')}.`,
      );
    }

    const frames =
      typeof durationInFrames === 'function' ? durationInFrames(format.fps) : durationInFrames;

    return (
      <Composition
        key={`${id}-${format.id}`}
        id={`${id}-${titleCase(format.id)}`}
        component={Component}
        durationInFrames={Math.max(1, Math.round(frames))}
        fps={format.fps}
        width={format.width}
        height={format.height}
        schema={schema}
        defaultProps={defaultProps}
      />
    );
  });
};

export default registerProject;
