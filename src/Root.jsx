import React from 'react';
import { Folder } from 'remotion';

import './styles/tailwind.css';

import { registerProject } from '@/framework';
import { projectsByFolder } from './projects/registry.js';
import { registerTemplates } from '@/runtime';

/**
 * Composition registry — the root the renderer sees.
 *
 * This file is deliberately mechanical. Every project is declared once in
 * `projects/registry.js` and registered here through the same code path, so
 * there is no way for one project to be wired up differently from another —
 * which is exactly what had happened before: three demos were registered by hand
 * with literal frame counts and rendered outside the theme provider.
 *
 * `registerProject` emits one <Composition> per declared format and wraps each
 * in the project's ThemeProvider. A project's duration may be a number or
 * `(fps) => frames`, because a timeline's length depends on fps — the timeline
 * stays the single source of truth for it, never a literal copied into this file.
 */
export const RemotionRoot = () => (
  <>
    {/* Templates are data-driven video PRODUCTS, not films — one composition
        per (template x format), whose document is swapped via props rather than
        by adding a registry entry.

        Studio reaches them through the RUNTIME's published surface, the same
        door the editor and any external React app use. See src/runtime/. */}
    <Folder name="Templates">{registerTemplates()}</Folder>

    {projectsByFolder().map(([folder, projects]) => (
      <Folder key={folder} name={folder}>
        {projects.map(({ id, component, theme, formats, duration, schema, defaultProps }) =>
          registerProject({
            id,
            component,
            theme,
            formats,
            durationInFrames: duration,
            schema,
            defaultProps,
          }),
        )}
      </Folder>
    ))}
  </>
);

export default RemotionRoot;
