import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { zIndex as zIndexTokens } from '../../formats/index.js';
import { useFormat } from '../../hooks/useFormat.js';
import { alpha } from '../../helpers/color.js';
import { lerp, seededRandom } from '../../helpers/math.js';
import { driftMotion } from '../../camera/index.js';

/**
 * A handful of soft, out-of-focus motes drifting behind content — atmosphere,
 * not a particle system. Deliberately sparse (see `count`'s default): this is
 * seasoning, the same way `GlowLayer`'s pools are, not a simulated dust field.
 *
 * Colour is a plain resolved string, not a `tone` enum — this component has no
 * opinion on what "warm" or "cool" means for a given film. That mapping is
 * project-specific (see `Mark.jsx`'s own `toneColor()`), so the caller decides
 * which theme colour to pass, exactly like `GlowLayer`'s `glows[]` entries
 * already carry a resolved `color` rather than a brand concept.
 *
 * All placement/motion is derived from `seededRandom` (deterministic, already
 * used by the `handheld` camera preset) — never `Math.random()` — so the field
 * is identical every render and stays seam-free across concurrent render
 * workers.
 *
 * @param {number} [count]     Particle count. Kept low on purpose — dust that
 *                              can be individually counted has stopped being
 *                              atmosphere.
 * @param {number} [seed]      Field seed. Vary this per shot/atmosphere so
 *                              different scenes don't show the same field.
 * @param {string} [color]     Resolved colour (e.g. `theme.colors.accent`).
 * @param {{min:number,max:number}} [size]      Diameter range, design px.
 * @param {{min:number,max:number}} [opacity]   Peak opacity range.
 * @param {{x:[number,number], y:[number,number]}} [region]  Percent bounds
 *                              particles spawn within.
 * @param {number} [blur]      Blur radius, design px.
 * @param {{min:number,max:number}} [amplitude] Drift amplitude range, design px.
 * @param {{min:number,max:number}} [period]    Drift period range, frames.
 * @param {number} [zIndex]    Stacking override; defaults to the same layer
 *                              as `GlowLayer` (behind content).
 */

/** One field, generated once per (count, seed) — not re-rolled per frame. */
const buildParticles = ({ count, seed, size, opacity, region, amplitude, period }) => {
  const particles = [];
  for (let i = 0; i < count; i += 1) {
    const at = (offset) => seededRandom(seed + i * 37 + offset);
    particles.push({
      x: lerp(region.x[0], region.x[1], at(1)),
      y: lerp(region.y[0], region.y[1], at(2)),
      size: lerp(size.min, size.max, at(3)),
      opacity: lerp(opacity.min, opacity.max, at(4)),
      amplitude: lerp(amplitude.min, amplitude.max, at(5)),
      period: lerp(period.min, period.max, at(6)),
      phase: at(7) * 360,
    });
  }
  return particles;
};

export const DustLayer = ({
  count = 12,
  seed = 0,
  color,
  size = { min: 4, max: 14 },
  opacity = { min: 0.06, max: 0.16 },
  region = { x: [10, 90], y: [10, 90] },
  blur = 3,
  amplitude = { min: 20, max: 60 },
  period = { min: 380, max: 620 },
  zIndex,
  style,
}) => {
  const frame = useCurrentFrame();
  const { px } = useFormat();

  // Deliberately keyed on [count, seed] only — this is an authored field, not
  // a live-tunable one; the ranges below are set once per call site.
  const particles = useMemo(
    () => buildParticles({ count, seed, size, opacity, region, amplitude, period }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, seed],
  );

  const blurRadius = px(blur);

  return (
    <AbsoluteFill style={{ zIndex: zIndex ?? zIndexTokens.glow, pointerEvents: 'none', ...style }}>
      {particles.map((particle, i) => {
        const motion = driftMotion({
          frame,
          amplitude: px(particle.amplitude),
          period: particle.period,
          phase: particle.phase,
        });
        const diameter = px(particle.size);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: diameter,
              height: diameter,
              marginLeft: -diameter / 2,
              marginTop: -diameter / 2,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(color, particle.opacity)} 0%, ${alpha(color, 0)} 70%)`,
              filter: `blur(${blurRadius}px)`,
              ...motion,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export default DustLayer;
