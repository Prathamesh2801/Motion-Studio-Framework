import React from 'react';
import { useCurrentFrame } from 'remotion';
import {
  Scene,
  Text,
  animate,
  stagger as staggerTokens,
  durations,
  useFormat,
  useResponsive,
  useSceneProgress,
  useTheme,
  alpha,
} from '@/framework';
import { Mark } from '../components/Mark.jsx';
import { ATMOSPHERE, CAMERA, WORDS } from '../narrative.js';

/**
 * MOVEMENTS I-III — THE DESCENT (shots 1-5).
 *
 * The film's energy falls for its first third. That is the choice most versions
 * of this story refuse to make, and it is the reason the second half feels
 * earned rather than announced.
 *
 * Every shot here reads its atmosphere and camera from `narrative.js` rather than
 * hardcoding them, so the film's lighting and camera arcs stay legible as two
 * columns you can read top to bottom.
 */

/** Shared: pulls a shot's direction out of the content maps by id. */
const useShot = (id) => ({ background: ATMOSPHERE[id], camera: CAMERA[id] });

/**
 * 1 · VOID — 3 bars. Nothing has begun.
 *
 * The hardest shot in the film to get right, because almost nothing happens and
 * "almost nothing" has to be distinguishable from "nothing rendered". The
 * `flat` atmosphere supplies grain and a deep vignette, which is what gives the
 * frame a SURFACE — without it this is a black rectangle and the audience reads
 * it as a fault rather than as space.
 *
 * The film's opening fade-up lives here rather than in the timeline: there is
 * no scene before this one to dissolve from, so a transition could not express
 * it. A scene that opens the film owns its own arrival.
 */
export const Void = () => {
  const frame = useCurrentFrame();
  const { background, camera } = useShot('void');

  // Slow lift out of pure black across the first second and a half.
  const wake = animate({ frame, from: 0, to: 1, duration: durations.cinematic, easing: 'smooth' });

  return (
    <Scene background={background} camera={camera} style={{ opacity: wake }} />
  );
};

/**
 * 2 · SPARK — 2 bars. The idea arrives.
 *
 * A single amber point, dead centre, that simply IS there — a long opacity ramp
 * with no pop, because an idea does not announce itself. The one genuinely
 * lovely shot in the first half, which matters: we are about to take it away.
 *
 * No words. The audience meets the idea in silence; the first text in the film
 * is the cold count two shots later.
 */
export const Spark = () => {
  const { background, camera } = useShot('spark');

  return (
    <Scene background={background} camera={camera}>
      <Mark shape="point" tone="warm" breathing />
    </Scene>
  );
};

/**
 * 3 · DOUBT — 2 bars. The warmth is withdrawn.
 *
 * The atmosphere drops to `flat` ON THE CUT, with no transition to soften it —
 * the audience is not eased out of the warm shot, it is taken from them. The
 * handheld camera enters here and runs for three shots.
 *
 * ── THE FIRST GENUINE PER-FORMAT DIVERGENCE ─────────────────────────────────
 * Isolation is expressed by putting the mark far from the frame's centre. In
 * 16:9 that room is horizontal; in 9:16 it does not exist, so the same offset
 * would push the mark almost off-screen while looking timid. The offset is
 * therefore authored as a per-bucket MAP through `useResponsive` — in portrait
 * the isolation goes vertical instead. This is what the docs mean by layouts
 * owning reflow: the decision is data, not an `if (isVertical)`.
 */
export const Doubt = () => {
  const frame = useCurrentFrame();
  const { background, camera } = useShot('doubt');
  const { px } = useFormat();
  const { responsive } = useResponsive();

  const offset = responsive({
    landscape: { x: -300, y: 40 },
    ultrawide: { x: -620, y: 40 },
    vertical: { x: -110, y: -280 },
  });

  // The mark loses its footing over the shot — a slow, unmoored drift.
  const slip = animate({ frame, from: 0, to: 26, duration: 90, easing: 'smooth' });

  return (
    <Scene background={background} camera={camera}>
      <div
        style={{
          transform: `translate3d(${px(offset.x)}px, ${px(offset.y) + slip}px, 0)`,
        }}
      >
        <Mark shape="point" tone="warm" scale={0.78} glow={0.6} breathing />
      </div>
    </Scene>
  );
};

/**
 * 4 · DRIFT — 1 bar. A flinch.
 *
 * The shortest shot so far, and it should register as one. The mark is now
 * small and pushed toward a corner; the frame is mostly empty. One bar, cut.
 */
export const Drift = () => {
  const { background, camera } = useShot('drift');
  const { px } = useFormat();
  const { responsive } = useResponsive();

  const offset = responsive({
    landscape: { x: 420, y: -230 },
    ultrawide: { x: 980, y: -230 },
    vertical: { x: 150, y: 420 },
  });

  return (
    <Scene background={background} camera={camera}>
      <div style={{ transform: `translate3d(${px(offset.x)}px, ${px(offset.y)}px, 0)` }}>
        <Mark shape="point" tone="warm" scale={0.5} glow={0.4} breathing />
      </div>
    </Scene>
  );
};

/**
 * 5 · THE COUNT — 2 bars. The film's only fact.
 *
 * The beat that converts an abstract animation into somebody's actual life. It
 * is small, typographic and cold, and it is the most important shot in the
 * first half.
 *
 * The mono register (uppercase, 0.18em tracking) is the film's SYSTEM voice —
 * fact, label, measurement — as opposed to the serif human voice that speaks at
 * the hinge. The two never appear in the same shot.
 *
 * Words assemble one at a time at `dramatic` spacing (12 frames), the widest
 * stagger the framework ships. A fast assembly would read as a UI loading; this
 * reads as a fact being weighed.
 */
export const Count = () => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const { background, camera } = useShot('count');
  const { px } = useFormat();

  const words = WORDS.count.split(' ');

  return (
    <Scene background={background} camera={camera}>
      {/* The mark is still here — smaller, above the fact, still alive. */}
      <div style={{ marginBottom: px(90) }}>
        <Mark shape="point" tone="warm" scale={0.42} glow={0.35} breathing />
      </div>

      <div style={{ display: 'flex', gap: px(14), flexWrap: 'wrap', justifyContent: 'center' }}>
        {words.map((word, i) => (
          <Text
            key={`${word}-${i}`}
            variant="eyebrow"
            color={word === '·' ? alpha(theme.colors.text.muted, 0.5) : theme.colors.text.secondary}
            style={{
              opacity: animate({
                frame,
                delay: i * staggerTokens.dramatic,
                duration: durations.slow,
                easing: 'entrance',
              }),
            }}
          >
            {word}
          </Text>
        ))}
      </div>
    </Scene>
  );
};

/**
 * 6 · THE FIRST MARK — 3 bars. THE HINGE. ⭐
 *
 * Everything turns here, and everything turns AT ONCE: the atmosphere returns
 * to `hearth`, the camera goes `static` after three shots of handheld, and the
 * point becomes a stroke.
 *
 * ── STILLNESS AS THE EMPHASIS ───────────────────────────────────────────────
 * In a film where something is always drifting, absolute stillness is the
 * loudest gesture available. The camera stopping dead IS the decision — it
 * costs one word in `narrative.js` and it does more work than any animation in
 * the film.
 *
 * ── THE ONE OVERSHOOT ───────────────────────────────────────────────────────
 * `emphasized` is the only easing curve in the framework with overshoot
 * ([0.34, 1.28, 0.42, 1]). It is spent HERE and nowhere else. Once in eighty
 * seconds it reads as a heartbeat; twice and it is a house style that means
 * nothing.
 *
 * The stroke is deliberately off-axis by 2.4°. A perfectly vertical line is a
 * UI element; a slightly crooked one was made by a person.
 */
export const FirstMark = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useSceneProgress();
  const { background, camera } = useShot('first-mark');
  const { px } = useFormat();

  // The point is still present as the stroke grows out of it, then it is simply
  // part of the line. The two are one object, not a cut between two images.
  const strokeDelay = durations.base;

  return (
    <Scene background={background} camera={camera}>
      <div style={{ display: 'grid', placeItems: 'center' }}>
        <div style={{ gridArea: '1 / 1' }}>
          <Mark
            shape="stroke"
            tone="warm"
            height={230}
            angle={2.4}
            delay={strokeDelay}
            duration={durations.slower}
            easing="emphasized"
            origin="bottom"
          />
        </div>

        {/* The originating point, fading as the stroke takes over. */}
        <div
          style={{
            gridArea: '1 / 1',
            alignSelf: 'end',
            marginBottom: px(-14),
            opacity: 1 - animate({
              frame,
              delay: strokeDelay + durations.base,
              duration: durations.slow,
              easing: 'exit',
            }),
          }}
        >
          <Mark shape="point" tone="warm" scale={0.7} duration={durations.fast} />
        </div>
      </div>

      {/* The human voice, once. Serif, quiet, well after the mark is made — the
          image says it first and the words only confirm it.

          `cardTitle` rather than `subtitle`: the human register is SERIF, and
          only the display-family text styles resolve to Instrument Serif.
          `subtitle` maps to `family: 'body'` and rendered this line in Inter —
          the system's voice speaking the film's most human sentence. */}
      <Text
        variant="cardTitle"
        align="center"
        style={{
          marginTop: px(70),
          opacity: animate({
            frame,
            delay: Math.round(durationInFrames * 0.42),
            duration: durations.slower,
            easing: 'entrance',
          }),
        }}
      >
        {WORDS.firstMark}
      </Text>
    </Scene>
  );
};
