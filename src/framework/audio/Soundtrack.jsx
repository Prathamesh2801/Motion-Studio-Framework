import React from 'react';
import { Audio, Sequence, useVideoConfig } from 'remotion';
import { buildSoundtrackEdit, DEFAULT_BED_GAIN, DEFAULT_FADES } from './soundtrack.js';
import { clamp } from '../helpers/math.js';
import { scaleFrames } from '../helpers/frames.js';

/** Linear ramp, guarded against zero-length fades. Used at the film's ends. */
const ramp = (position, length) => (length <= 0 ? 1 : clamp(position / length, 0, 1));

/**
 * Equal-power ramp, for joins.
 *
 * A linear crossfade between two correlated signals dips about 3 dB in the
 * middle, which is exactly the "something happened" the ear latches onto. Sine
 * and cosine legs sum to constant POWER rather than constant amplitude, so
 * loudness holds flat straight through the join.
 */
const powerRamp = (position, length) =>
  length <= 0 ? 1 : Math.sin(clamp(position / length, 0, 1) * (Math.PI / 2));

/**
 * A music bed, optionally as a multi-segment edit.
 *
 * Cut timings are OWNED BY THE TIMELINE and passed in, rather than re-derived
 * here where they could drift out of sync with the picture. With no `cuts` this
 * is simply one continuous bed with head and tail fades.
 *
 * @param {object} props
 * @param {string} props.src  Resolved source (e.g. via `staticFile`).
 * @param {Array<{from:number, sourceSeconds:number}>} [props.cuts]
 * @param {number|((frame:number)=>number)} [props.gain]
 *   Linear bed level. A FUNCTION receives the ABSOLUTE timeline frame (not the
 *   segment-relative one) and returns the level for that frame.
 *
 *   ── DUCKING SEAM ─────────────────────────────────────────────────────────
 *   This is the extension point for ducking music under narration. No ducking
 *   behaviour is implemented here — that belongs with a voice layer, which does
 *   not exist yet. What matters is that the frame reference is absolute: a duck
 *   envelope is authored against the film's timeline ("drop to 0.05 while the VO
 *   runs from frame 300 to 480"), and if this callback exposed segment-relative
 *   frames, every consumer would have to un-do the segment offset itself and
 *   would get it wrong at the first music cut. Fixing that later would be a
 *   breaking change to every caller; fixing it now costs three lines.
 * @param {number} [props.crossfadeFrames]  Join length; defaults to ~0.5s.
 */
export const Soundtrack = ({ src, cuts, gain = DEFAULT_BED_GAIN, crossfadeFrames, fades = DEFAULT_FADES, label = 'Music' }) => {
  const { fps, durationInFrames } = useVideoConfig();

  if (!src) return null;

  const crossfade = crossfadeFrames ?? Math.round(fps / 2);
  const segments = buildSoundtrackEdit({ fps, cuts, totalFrames: durationInFrames, crossfadeFrames: crossfade });

  // `DEFAULT_FADES` is authored in frames at 30fps; `scaleFrames` is the one
  // place that conversion lives, rather than a bare `fps / 30` here.
  const fadeIn = scaleFrames(fades.in, fps);
  const fadeOut = scaleFrames(fades.out, fps);

  return (
    <>
      {segments.map((segment, index) => {
        // Joins get an equal-power leg; the head and tail get ordinary linear
        // fades, where there is nothing on the other side to balance against.
        const rise = (frame) => (segment.crossfadeIn ? powerRamp(frame, crossfade) : ramp(frame, fadeIn));
        const fall = (remaining) =>
          segment.crossfadeOut ? powerRamp(remaining, crossfade) : ramp(remaining, fadeOut);

        // `frame` here is segment-relative (Remotion scopes it to the Sequence),
        // but a gain envelope is authored against the whole film — so translate.
        const levelAt =
          typeof gain === 'function' ? (frame) => gain(segment.from + frame) : () => gain;

        const volume = (frame) =>
          levelAt(frame) * rise(frame) * fall(segment.durationInFrames - frame);

        return (
          <Sequence
            key={`${segment.from}-${index}`}
            from={segment.from}
            durationInFrames={segment.durationInFrames}
            name={`${label} — segment ${index + 1}`}
          >
            <Audio src={src} trimBefore={segment.trimBefore} volume={volume} />
          </Sequence>
        );
      })}
    </>
  );
};

export default Soundtrack;
