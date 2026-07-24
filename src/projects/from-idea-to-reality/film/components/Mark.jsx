import React from 'react';
import { useCurrentFrame } from 'remotion';
import {
  animate,
  breathe,
  mergeMotion,
  transform,
  alpha,
  useFormat,
  useTheme,
  durations,
} from '@/framework';

/**
 * THE MARK — the film's protagonist.
 *
 * ── WHY THIS LIVES IN THE PROJECT, NOT THE FRAMEWORK ────────────────────────
 * Ring 1 (`framework/`) is brand-agnostic and extractable; it earns its keep by
 * being reusable across every film. A dot that becomes a stroke that becomes a
 * grid is not a general capability — it is THIS film's protagonist. Putting it
 * in `framework/components/` would make the framework carry a prop for one
 * video forever, which is exactly the sprawl the ring rule exists to prevent.
 *
 * So it imports FROM `@/framework` and never the reverse. The dependency arrow
 * stays pointed inward, and the film remains deletable as one directory.
 *
 * ── THREE SHAPES, FIVE STATES ───────────────────────────────────────────────
 * The storyboard names five states — point, stroke, rhythm, plane, form. Only
 * three of them are things you can DRAW:
 *
 *   point    a single luminous dot          the idea
 *   stroke   one line, drawn, imperfect     the decision
 *   plane    a surface with depth           the accumulation
 *
 * `rhythm` and `form` are ARRANGEMENTS of those — many strokes on a grid, many
 * planes resolved into an object. They belong in `MarkField.jsx`, not here.
 * Collapsing an arrangement into the atom would give this component a `count`
 * prop and a layout responsibility, and it would stop being one thing.
 *
 * ── EACH SHAPE OWNS ITS OWN ENTRANCE ────────────────────────────────────────
 * A point cannot be "drawn" and a stroke should never fade in — a line that
 * fades has not been made by anyone, and the whole hinge of the film is that
 * someone made a mark. So the entrance grammar is a property of the shape, not
 * a prop the caller has to remember. `SHAPES` below is a small registry, the
 * same idiom the framework uses for presets, cameras and transitions.
 */

/** Amber is the human, indigo is the system. The film's argument, in one map. */
const toneColor = (theme, tone) =>
  tone === 'cool' ? theme.colors.primary : theme.colors.accent;

const SHAPES = {
  /**
   * The idea. Arrives by simply BEING there — a long opacity ramp and a
   * whisper of scale, no pop. Nothing about the spark should look authored.
   */
  point: {
    defaults: { width: 34, height: 34, radius: '50%', duration: durations.cinematic },
    enter: ({ frame, delay, duration, easing }) => ({
      opacity: animate({ frame, delay, duration, easing: easing ?? 'entrance' }),
      transform: transform({
        scale: animate({ frame, from: 0.55, to: 1, delay, duration, easing: easing ?? 'entrance' }),
      }),
    }),
  },

  /**
   * The decision. DRAWN, not faded: scaleY from a bottom origin, so the line
   * grows along its own length the way a pen lays down ink.
   *
   * `origin` is exposed because a stroke growing downward from the top is a
   * different gesture from one growing up from the ground, and Structure uses
   * both to keep a field of strokes from looking mechanically identical.
   */
  stroke: {
    defaults: { width: 7, height: 190, radius: 4, duration: durations.slow },
    enter: ({ frame, delay, duration, easing, origin = 'bottom' }) => ({
      transform: transform({
        scaleY: animate({ frame, from: 0, to: 1, delay, duration, easing: easing ?? 'entrance' }),
      }),
      transformOrigin: origin,
    }),
  },

  /**
   * The accumulation. A surface rather than a line — it has area, a hairline
   * edge and a faint fill, so a stack of them reads as depth instead of as
   * more lines. Unmasks upward and settles from slightly small.
   */
  plane: {
    defaults: { width: 240, height: 150, radius: 10, duration: durations.base },
    enter: ({ frame, delay, duration, easing }) => {
      const progress = animate({ frame, delay, duration, easing: easing ?? 'entrance' });
      return {
        opacity: progress,
        transform: transform({ scale: 0.94 + progress * 0.06 }),
      };
    },
  },
};

export const MARK_SHAPES = Object.keys(SHAPES);

/**
 * @param {object} props
 * @param {'point'|'stroke'|'plane'} [props.shape]
 * @param {'warm'|'cool'} [props.tone]   warm = the human, cool = the system
 * @param {number} [props.width]         design px (1920x1080 space)
 * @param {number} [props.height]        design px
 * @param {number} [props.scale]         multiplies both dimensions
 * @param {number} [props.angle]         degrees; the film's imperfection knob
 * @param {number} [props.delay]         frames before the entrance starts
 * @param {number} [props.duration]      entrance length; defaults per shape
 * @param {string} [props.easing]        curve name; defaults per shape
 * @param {string} [props.origin]        stroke draw origin ('bottom' | 'top')
 * @param {number} [props.glow]          bloom strength, 0 disables
 * @param {number} [props.opacity]       static multiplier on the whole mark
 * @param {boolean} [props.breathing]    continuous ambient scale
 * @param {boolean} [props.solid]        plane occludes instead of blending
 */
export const Mark = ({
  shape = 'point',
  tone = 'warm',
  width,
  height,
  scale = 1,
  angle = 0,
  delay = 0,
  duration,
  easing,
  origin,
  glow = 1,
  opacity = 1,
  breathing = false,
  solid = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const { px } = useFormat();

  const spec = SHAPES[shape] ?? SHAPES.point;
  const { defaults } = spec;
  const color = toneColor(theme, tone);

  const w = px((width ?? defaults.width) * scale);
  const h = px((height ?? defaults.height) * scale);

  const entrance = spec.enter({
    frame,
    delay,
    duration: duration ?? defaults.duration,
    easing,
    origin,
  });

  // The rotation is applied as its own transform so `mergeMotion` CONCATENATES
  // it with the entrance rather than overwriting it. Spreading two style
  // objects would silently drop the first `transform` — merging is the whole
  // reason the framework ships `mergeMotion` rather than Object.assign.
  const motion = mergeMotion(
    { transform: transform({ rotate: angle }) },
    entrance,
    breathing ? breathe({ frame }) : null,
    { opacity },
  );

  // A plane is a surface: faint fill, hairline edge. A point or stroke is a
  // light source: solid colour, and a bloom sized to the mark rather than a
  // fixed radius, so the glow scales with the object across formats.
  const isSurface = shape === 'plane';
  const bloom = Math.max(w, h) * 0.9;

  /**
   * ── WHY `solid` EXISTS ──────────────────────────────────────────────────
   * A translucent plane is right for one plane and wrong for six. The first
   * build of Momentum stacked transparent planes over a stroke lattice and the
   * frame turned to mush: every layer summed with every other, nothing
   * occluded anything, and the shot read as a smudge instead of as depth.
   *
   * Depth requires OCCLUSION — a near surface has to hide what is behind it.
   * So a solid plane composites its tint over the theme's own deep background
   * rather than over whatever happens to be underneath, which makes stacking
   * order legible again. The tint is still a theme colour, so this stays
   * brand-correct: on a light brand the same code paints over light paper.
   */
  const surfaceFill = solid
    ? `linear-gradient(${alpha(color, 0.2)}, ${alpha(color, 0.2)}), ${theme.colors.backgroundDeep}`
    : alpha(color, 0.14);

  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: typeof defaults.radius === 'number' ? px(defaults.radius) : defaults.radius,
        background: isSurface ? surfaceFill : color,
        border: isSurface
          ? `${px(1.5)}px solid ${alpha(color, solid ? 0.55 : 0.42)}`
          : undefined,
        boxShadow: glow > 0 ? `0 0 ${bloom}px ${alpha(color, (isSurface ? 0.2 : 0.5) * glow)}` : undefined,
        flexShrink: 0,
        ...motion,
        ...style,
      }}
    />
  );
};

export default Mark;
