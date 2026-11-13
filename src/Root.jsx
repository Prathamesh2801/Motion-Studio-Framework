import React from 'react';
import { Folder } from 'remotion';

import './styles/tailwind.css';

import { registerProject } from '@/framework';
import { projectsByFolder } from './projects/registry.js';
import { SpriteSheetComposition } from './SpriteSheet.jsx';

/**
 * Composition root. Every project is declared once in `projects/registry.js`;
 * `registerProject` emits one <Composition> per declared format, wrapped in the
 * project's theme.
 */
export const RemotionRoot = () => (
  <>
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

    <Folder name="Tools">
      <SpriteSheetComposition />
    </Folder>
  </>
);

export default RemotionRoot;
