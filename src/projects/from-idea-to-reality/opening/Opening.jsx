import React from 'react';
import { Sequence, getRemotionEnvironment, useCurrentFrame } from 'remotion';
import { Scene, Text, animate, envelope, useTheme, useResponsive } from '@/framework';
import { OPENING_DEFAULT_PROPS, deriveOpeningLayout } from './schema.js';
import { SequenceDebugOverlay } from '../dev/SequenceDebugOverlay.jsx';
import { centerRevealMask } from '../motion/centerReveal.js';

/**
 * From Idea to Reality — the opening.
 *
 * Per `docs/archive/from-idea-to-reality/OPENING_ENDING_DIRECTION.md`: silent,
 * entirely before `Void` begins. Not part of `SCENE_PLAN` — this isn't
 * bar-locked or scored, so it lives outside `film/filmTimeline.js` rather
 * than forcing a silent pre-roll into a system built for cutting on a beat
 * that hasn't started yet.
 *
 * ── ONE COMPOSITION, NOT TWO TITLE CARDS ────────────────────────────────────
 * The wordmark and the title share ONE Scene and ONE Sequence. The wordmark
 * fades up centred, holds, then settles — scale and position only, opacity
 * untouched — into a small header, and the title fades in beneath it as the
 * settled composition's hero. The wordmark never disappears; only the final
 * beat fades both away together, into `Void`.
 *
 * The opacity fades (`Text`'s `motion` prop, `fade` preset) and the wordmark's
 * scale/position move (a plain `animate()` call on a wrapping div) are two
 * independent style channels on the same element — `fade` only ever emits
 * `opacity`, never `transform` (see `presets/entrances.js`), so they can't
 * collide. Static camera throughout; `smooth` easing (the same curve
 * `Depth`/`Traverse` use for their moves) — calm, no spring, no bounce.
 *
 * ── TUNING ───────────────────────────────────────────────────────────────
 * Scale/position/timing are regular component props, not constants — see
 * `schema.js` for the schema/defaults and why this is the framework's
 * standard tuning workflow (Remotion Studio's native Props panel, via the
 * `schema`/`defaultProps` the project is registered with in
 * `projects/registry.js`). This file only consumes `wordmark`/`title`/
 * `opening`/`debug`; it has no opinion on where their values came from.
 *
 * To carry a tuning session back into code: in Studio, select this
 * composition (nothing in the timeline selected), open the Inspector's
 * "Default Props" section, and switch its Schema/JSON toggle to JSON — that
 * shows the current live values as plain copyable text. Paste into
 * `OPENING_DEFAULT_PROPS` in `schema.js`. This project deliberately
 * has no export button for this: Remotion's own Inspector already does it,
 * and adding project code to duplicate a Studio-native feature would be
 * exactly the parallel system this framework's tuning convention (see
 * `docs/AUTHORING.md` §8) says not to build.
 */

/**
 * Peak intensity of the title-hold glow — deliberately far below the ending's
 * `hearth` pool (0.2) and even its own secondary haze wash (0.06, see
 * `design/brands/atelier/index.js`), per the direction to keep this "significantly
 * softer than the ending": felt, not noticed.
 */
const TITLE_GLOW_INTENSITY = 0.07;

/**
 * The wordmark + title, as one evolving composition.
 *
 * Both elements are absolutely positioned so the title's centre position
 * doesn't depend on flex layout shifting once the wordmark vacates it. The
 * wordmark's `top`/`scale` are plain numbers from `animate()`, read straight
 * off `frame` — no spring, no overshoot.
 */
const IdentityTitle = ({ wordmark, title, debug, revealStart, fadeAllStart, identityDuration, isStudio }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const { responsive } = useResponsive();

  const wordmarkTop = animate({
    frame,
    from: wordmark.initialY,
    to: wordmark.finalY,
    delay: wordmark.moveStartFrame,
    duration: wordmark.moveDuration,
    easing: 'smooth',
  });
  const wordmarkScale = animate({
    frame,
    from: wordmark.initialScale,
    to: wordmark.finalScale,
    delay: wordmark.moveStartFrame,
    duration: wordmark.moveDuration,
    easing: 'smooth',
  });

  /**
   * `wordmark.initialScale`/`finalScale` are authored against landscape's
   * 1920px canvas. "MOTION STUDIO FRAMEWORK" — mono, uppercase, widest
   * tracking — is wide enough at those multipliers that on a portrait/square
   * canvas (1080px or less) it runs off both edges; unlike body copy, a
   * single uppercase line has nowhere to wrap. This is a responsive
   * CALCULATION, not a second implementation or a new schema field: the
   * schema's scale values stay exactly what a director tunes for landscape,
   * and `useResponsive()` — the same per-bucket mechanism `Doubt`/`Traverse`
   * already use in the main film — scales that one number down for the
   * vertical buckets so the mark stays inside the frame everywhere.
   */
  const wordmarkVerticalFactor = responsive({ landscape: 1, vertical: 0.56 });
  const wordmarkScaleResponsive = wordmarkScale * wordmarkVerticalFactor;

  // Same window the title already reveals and holds in — reusing
  // `revealStart`/`revealDuration`/`fadeAllStart` (all derived in
  // `schema.js`) rather than adding new timing controls. The glow
  // builds as the title uncovers (light and text emerging together),
  // plateaus through the hold, and fades with everything else at
  // `fadeAllStart` — never its own, separate beat.
  const titleGlow =
    envelope({
      frame,
      delay: revealStart,
      duration: fadeAllStart - revealStart,
      exitAt: fadeAllStart,
      exitDuration: title.fadeOutDuration,
    }) * TITLE_GLOW_INTENSITY;

  const titleReveal = animate({
    frame,
    delay: revealStart,
    duration: title.revealDuration,
    easing: 'smooth',
  });

  return (
    <Scene
      background="flat"
      camera="static"
      backgroundOverrides={{
        glows: [
          {
            color: theme.colors.accent,
            position: { x: 50, y: title.yPosition },
            size: 150,
            intensity: titleGlow,
            ambient: 'drift',
            ambientOptions: { amplitude: 6, period: 700 },
          },
        ],
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: `${wordmarkTop}%`,
            transform: `translate(-50%, -50%) scale(${wordmarkScaleResponsive})`,
          }}
        >
          <Text
            variant="eyebrow"
            align="center"
            color={theme.colors.text.secondary}
            motion={{
              preset: 'fade',
              duration: wordmark.fadeInDuration,
              exitPreset: 'fade',
              exitAt: fadeAllStart,
              exitDuration: wordmark.fadeOutDuration,
            }}
          >
            MOTION STUDIO FRAMEWORK
          </Text>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: `${title.yPosition}%`,
            transform: `translate(-50%, -50%) scale(${title.scale})`,
          }}
        >
          <Text
            variant="sectionTitle"
            align="center"
            // Entrance is the centre-out mask below, not opacity — `preset:
            // 'none'` leaves this element at its natural opacity (1) so the
            // mask alone controls how much of it is visible. Exit is
            // untouched: still a plain fade, still shared with the wordmark
            // at `fadeAllStart`.
            motion={{
              preset: 'none',
              exitPreset: 'fade',
              exitAt: fadeAllStart,
              exitDuration: title.fadeOutDuration,
            }}
            style={centerRevealMask(titleReveal)}
          >
            From Idea to Reality
          </Text>
        </div>

        {isStudio ? (
          <SequenceDebugOverlay
            debug={debug}
            duration={identityDuration}
            markers={[
              { label: 'move', at: wordmark.moveStartFrame },
              { label: 'reveal', at: revealStart },
              { label: 'fade', at: fadeAllStart },
            ]}
          />
        ) : null}
      </div>
    </Scene>
  );
};

export const Opening = ({
  wordmark = OPENING_DEFAULT_PROPS.wordmark,
  title = OPENING_DEFAULT_PROPS.title,
  opening = OPENING_DEFAULT_PROPS.opening,
  debug = OPENING_DEFAULT_PROPS.debug,
}) => {
  const { revealStart, fadeAllStart, identityDuration } = deriveOpeningLayout({ wordmark, title, opening });
  const { preRollDuration, blackHoldDuration } = opening;
  const isStudio = getRemotionEnvironment().isStudio;

  return (
    <>
      <Sequence from={0} durationInFrames={preRollDuration} name="opening-preroll">
        <Scene background="flat" camera="static" />
      </Sequence>
      <Sequence from={preRollDuration} durationInFrames={identityDuration} name="opening-identity">
        <IdentityTitle
          wordmark={wordmark}
          title={title}
          debug={debug}
          revealStart={revealStart}
          fadeAllStart={fadeAllStart}
          identityDuration={identityDuration}
          isStudio={isStudio}
        />
      </Sequence>
      <Sequence
        from={preRollDuration + identityDuration}
        durationInFrames={blackHoldDuration}
        name="opening-hold">
        <Scene background="flat" camera="static" />
      </Sequence>
    </>
  );
};

export default Opening;
