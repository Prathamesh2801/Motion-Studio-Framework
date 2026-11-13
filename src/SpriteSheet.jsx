import React from 'react';
import { Composition, Freeze } from 'remotion';
import { FORMATS, withTheme } from '@/framework';
import { PROJECTS } from './projects/registry.js';

/**
 * Renders any registered project composition as a sprite-sheet still: a grid
 * where cell i shows the animation frozen at frame i * step. Driven by
 * `npm run sprite` (scripts/spritesheet.mjs), which computes the props.
 *
 * ponytail: children's useVideoConfig() reports the SHEET's size, not the
 * source's — fine for components that only read fps. Animations that lay out
 * from useVideoConfig().width/height would need a config override first.
 */
const resolve = (target) => {
  const cut = target.lastIndexOf('-');
  const project = PROJECTS.find((p) => p.id === target.slice(0, cut));
  const format = FORMATS[target.slice(cut + 1).toLowerCase()];
  if (!project || !format) throw new Error(`SpriteSheet: unknown composition "${target}".`);
  return { project, format };
};

const Sheet = ({ target, cols, frames, step, cell }) => {
  const { project, format } = resolve(target);
  const Component = project.theme ? withTheme(project.component, project.theme) : project.component;
  const scale = cell / Math.max(format.width, format.height);

  return Array.from({ length: frames }, (_, i) => (
    <div
      key={i}
      style={{
        position: 'absolute',
        left: (i % cols) * format.width * scale,
        top: Math.floor(i / cols) * format.height * scale,
        width: format.width,
        height: format.height,
        transform: `scale(${scale})`,
        transformOrigin: '0 0',
        overflow: 'hidden',
      }}
    >
      <Freeze frame={i * step}>
        <Component {...(project.defaultProps ?? {})} />
      </Freeze>
    </div>
  ));
};

export const SpriteSheetComposition = () => (
  <Composition
    id="SpriteSheet"
    component={Sheet}
    durationInFrames={1}
    fps={30}
    width={1}
    height={1}
    defaultProps={{ target: 'CloudSlash-Square', cols: 11, rows: 11, frames: 120, step: 1, cell: 256 }}
    calculateMetadata={({ props }) => {
      const { format } = resolve(props.target);
      const scale = props.cell / Math.max(format.width, format.height);
      return {
        // <Freeze> clamps to the composition's length, so it must span every
        // frozen frame even though only frame 0 is ever rendered.
        durationInFrames: Math.max(1, props.frames * props.step),
        fps: format.fps,
        width: Math.round(props.cols * format.width * scale),
        height: Math.round(props.rows * format.height * scale),
      };
    }}
  />
);
