import React from 'react';
import { Sequence, getRemotionEnvironment, useCurrentFrame } from 'remotion';
import { Scene, Text, animate, envelope, useTheme, useResponsive } from '@/framework';
import { ENDING_DEFAULT_PROPS, deriveEndingLayout } from './schema.js';
import { SequenceDebugOverlay } from '../dev/SequenceDebugOverlay.jsx';
import { centerRevealMask } from '../motion/centerReveal.js';

/**
 * From Idea to Reality — the ending.
 *
 * Plays after the main film's last shot (`Title`, unchanged — see
 * `index.jsx`), as its own silent coda. `Title` already carries the film's
 * narrative and emotional resolution; this is the separate, distinct beat
 * that closes the FILM AS A BRAND, mirroring the opening's register the way
 * credits differ from the story they follow.
 *
 * ── THREE BEATS, TWO DIFFERENT RELATIONSHIPS ────────────────────────────────
 * A reflective message fades up alone, then RESOLVES INTO the title — a
 * crossfade, `title`'s reveal deliberately starting inside `message`'s own
 * fade-out window, not after it (see `schema.js` for why this is the
 * one place in the film that overlaps on purpose). The studio wordmark then
 * returns once the title has settled — a distinct, sequential beat, not a
 * crossfade, guaranteed non-overlapping by the same floor pattern the
 * opening's wordmark/title fix established (`deriveEndingLayout`'s
 * `brandStart`). Finally title and brand fade to true black together, held
 * silently — "deliberate and complete," matched in spirit to the opening's
 * own black hold before `Void`.
 *
 * ── WHY THIS DOESN'T REPEAT THE OPENING ─────────────────────────────────────
 * The opening's wordmark scales and moves into a header; this brand mark
 * does neither — it simply fades in, already at its final, small, quiet
 * position. Same voice (mono, `eyebrow`, the secondary text colour), a
 * different gesture: a signature, not an introduction.
 *
 * The title reveal reuses `centerRevealMask` (`motion/centerReveal.js`) verbatim —
 * the same technique, same easing — because the title reappearing the same
 * way it first appeared IS the rhyme; inventing a second technique for it
 * would undercut the point. The atmosphere reuses the opening's exact
 * technique too: `GlowLayer` via `backgroundOverrides`, intensity driven by
 * `envelope()`, same accent colour, same restraint.
 *
 * ── TUNING ───────────────────────────────────────────────────────────────
 * See `schema.js` — same Studio-native `schema`/`defaultProps`
 * workflow as the opening, nested under `endingProps` in `index.jsx`/
 * `projects/registry.js` (a `<Composition>` takes one schema; nesting avoids
 * the opening's and ending's `title`/`debug` groups colliding).
 *
 * ── PORTRAIT IS A DIFFERENT COMPOSITION, NOT A SHRUNK ONE ───────────────────
 * `schema.js`'s `yPosition`/`scale` values are authored for landscape and stay
 * exactly that — landscape's reference composition. Portrait's 9:16 canvas has
 * far more vertical room than landscape's 16:9 one, and reusing the same three
 * percentages there left the whole group stranded in a thin band with a huge,
 * unintentional-looking void above and below it — a fit problem, not a design.
 * `useResponsive()`'s `responsive({ landscape, vertical })` (the same per-bucket
 * mechanism the wordmark fix in `opening/Opening.jsx` and the main film's
 * `Doubt`/`Traverse` shots already use) picks a SEPARATE, hand-composed
 * position/scale rhythm for the vertical bucket — bigger type (portrait has
 * the room to let type lead, per `formats/index.js`'s own note that vertical
 * formats want type LARGER relative to frame, not smaller) and a tighter,
 * intentional gap between the three beats, so the group reads as one composed
 * unit near the frame's centre rather than a landscape layout that happens to
 * still fit. Landscape's own numbers are untouched — `responsive()`'s
 * `landscape` branch is always exactly `schema.js`'s value.
 */

const TITLE_GLOW_INTENSITY = 0.07; // same peak as the opening's title-hold glow — one restrained vocabulary, not two

const EndingComposition = ({ message, title, brand, messageExitStart, brandStart, fadeAllStart, sequenceDuration, debug, isStudio }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const { responsive } = useResponsive();

  const titleReveal = animate({ frame, delay: title.revealStart, duration: title.revealDuration, easing: 'smooth' });

  // Same window/technique as the opening's title-hold glow: builds as the
  // title uncovers, keeps developing while brand appears, fades with both at
  // `fadeAllStart`.
  const glow =
    envelope({
      frame,
      delay: title.revealStart,
      duration: fadeAllStart - title.revealStart,
      exitAt: fadeAllStart,
      exitDuration: Math.max(title.fadeDuration, brand.fadeDuration),
    }) * TITLE_GLOW_INTENSITY;

  /**
   * Portrait's own composition — see the file header's "PORTRAIT IS A
   * DIFFERENT COMPOSITION" note. `landscape` always resolves to `schema.js`'s
   * own value, so landscape is byte-for-byte what it was before this pass.
   * `vertical` is a hand-composed rhythm, not a formula: message sits near
   * true centre (it's alone on screen at that point, and should read as
   * centred, not perched in the upper third); title is pulled noticeably
   * larger to lead the composition the way it already does compositionally
   * on landscape, just under-sized for portrait's extra room; brand stays
   * closest to its landscape scale — "a signature, not a second headline"
   * holds regardless of format — but moves up closer to the title so the
   * three beats read as one composed group instead of three islands.
   */
  const messageYPosition = responsive({ landscape: message.yPosition, vertical: 36 });
  const messageScale = message.scale * responsive({ landscape: 1, vertical: 1.12 });
  const titleYPosition = responsive({ landscape: title.yPosition, vertical: 56 });
  const titleScale = title.scale * responsive({ landscape: 1, vertical: 1.3 });
  const brandYPosition = responsive({ landscape: brand.yPosition, vertical: 70 });
  const brandScale = brand.scale * responsive({ landscape: 1, vertical: 1.05 });

  return (
    <Scene
      background="flat"
      camera="static"
      backgroundOverrides={{
        glows: [
          {
            color: theme.colors.accent,
            position: { x: 50, y: titleYPosition },
            size: 150,
            intensity: glow,
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
            top: `${messageYPosition}%`,
            transform: `translate(-50%, -50%) scale(${messageScale})`,
          }}
        >
          <Text
            variant="cardTitle"
            align="center"
            motion={{
              preset: 'fade',
              delay: message.revealStart,
              duration: message.revealDuration,
              exitPreset: 'fade',
              exitAt: messageExitStart,
              exitDuration: message.fadeDuration,
            }}
          >
            Somewhere, another idea is just beginning.
          </Text>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: `${titleYPosition}%`,
            transform: `translate(-50%, -50%) scale(${titleScale})`,
          }}
        >
          <Text
            variant="sectionTitle"
            align="center"
            // Same split as the opening: entrance is the mask, not opacity —
            // `preset: 'none'` leaves natural opacity (1) so the mask alone
            // controls visibility. Exit is a plain shared fade with brand.
            motion={{
              preset: 'none',
              exitPreset: 'fade',
              exitAt: fadeAllStart,
              exitDuration: title.fadeDuration,
            }}
            style={centerRevealMask(titleReveal)}
          >
            From Idea to Reality
          </Text>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: `${brandYPosition}%`,
            transform: `translate(-50%, -50%) scale(${brandScale})`,
          }}
        >
          <Text
            variant="eyebrow"
            align="center"
            color={theme.colors.text.secondary}
            motion={{
              preset: 'fade',
              delay: brandStart,
              duration: brand.revealDuration,
              exitPreset: 'fade',
              exitAt: fadeAllStart,
              exitDuration: brand.fadeDuration,
            }}
          >
            MOTION STUDIO FRAMEWORK
          </Text>
        </div>

        {isStudio ? (
          <SequenceDebugOverlay
            debug={debug}
            duration={sequenceDuration}
            markers={[
              { label: 'message', at: message.revealStart },
              { label: 'title', at: title.revealStart },
              { label: 'brand', at: brandStart },
              { label: 'fade', at: fadeAllStart },
            ]}
          />
        ) : null}
      </div>
    </Scene>
  );
};

export const Ending = ({
  message = ENDING_DEFAULT_PROPS.message,
  title = ENDING_DEFAULT_PROPS.title,
  brand = ENDING_DEFAULT_PROPS.brand,
  ending = ENDING_DEFAULT_PROPS.ending,
  debug = ENDING_DEFAULT_PROPS.debug,
}) => {
  const { messageExitStart, brandStart, fadeAllStart, sequenceDuration } = deriveEndingLayout({
    message,
    title,
    brand,
    ending,
  });
  const isStudio = getRemotionEnvironment().isStudio;

  return (
    <>
      <Sequence from={0} durationInFrames={ending.pauseBeforeMessage} name="ending-preroll">
        <Scene background="flat" camera="static" />
      </Sequence>

      <Sequence from={ending.pauseBeforeMessage} durationInFrames={sequenceDuration} name="ending-composition">
        <EndingComposition
          message={message}
          title={title}
          brand={brand}
          messageExitStart={messageExitStart}
          brandStart={brandStart}
          fadeAllStart={fadeAllStart}
          sequenceDuration={sequenceDuration}
          debug={debug}
          isStudio={isStudio}
        />
      </Sequence>
    </>
  );
};

export default Ending;
