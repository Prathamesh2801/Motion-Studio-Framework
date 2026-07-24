import React from 'react';
import { useCurrentFrame } from 'remotion';
import {
  Scene,
  Center,
  Text,
  animate,
  durations,
  stagger as staggerTokens,
  useFormat,
  useResponsive,
  useSceneProgress,
  useTheme,
  alpha,
} from '@/framework';
import { Mark } from '../components/Mark.jsx';
import { MarkForm } from '../components/MarkField.jsx';
import { ATMOSPHERE, CAMERA, WORDS } from '../narrative.js';

/**
 * MOVEMENT VII — REALITY (shots 17-18, 5 bars).
 *
 * The release. After roughly fourteen consecutive hard cuts, shot 17 arrives on
 * a DISSOLVE — the only one in the body of the film — and it should land like
 * an exhale. Then one long, still shot: the first since the hinge, and the
 * length itself is the payoff. `Handover` is the film's last shot — the silent
 * `Ending` sequence (`ending/Ending.jsx`) begins immediately after it, past a
 * hard `Sequence` boundary a film transition can't cross.
 *
 * The peak of this film is bar 24, not bar 33. Everything here is decompression.
 */

const useShot = (id) => ({ background: ATMOSPHERE[id], camera: CAMERA[id] });

/**
 * 17 · THE FORM — 3 bars. Everything resolves. ⭐
 *
 * `MarkForm` builds the object out of PLANES with the cool ones converging
 * inward behind a warm one. The colour argument the whole film has been running
 * resolves here as geometry rather than as a grade: the system ends up BEHIND
 * the human mark, not over it. The finished thing is warm.
 *
 * The camera pulls back — the first `pull` in the film, and the classic
 * reveal-the-whole gesture. It is earned because nothing else has used it.
 */
export const Form = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useSceneProgress();
  const { background, camera } = useShot('form');
  const { px } = useFormat();

  return (
    <Scene background={background} camera={camera}>
      <MarkForm delay={0} duration={durations.slower} layers={3} />

      <Text
        variant="cardTitle"
        align="center"
        style={{
          marginTop: px(80),
          opacity: animate({
            frame,
            delay: Math.round(durationInFrames * 0.38),
            duration: durations.slower,
            easing: 'entrance',
          }),
        }}
      >
        {WORDS.form}
      </Text>
    </Scene>
  );
};

/**
 * 18 · HANDOVER — 2 bars. It exists without you.
 *
 * The film's last idea, and the one that makes it a story rather than a
 * process video: the thing is no longer the maker's. The form shrinks and takes
 * its place among others — still the warm one, still findable, no longer the
 * only thing in the frame.
 *
 * Deliberately quiet and deliberately still (`static`). Nothing is asked of the
 * audience here.
 */
export const Handover = () => {
  const frame = useCurrentFrame();
  const { background, camera } = useShot('handover');
  const { px } = useFormat();
  const { responsive } = useResponsive();

  const count = responsive({ landscape: 5, ultrawide: 7, vertical: 3 });
  const settle = animate({ frame, from: 0.86, to: 1, duration: durations.slower, easing: 'entrance' });
  const centre = Math.floor(count / 2);

  return (
    <Scene background={background} camera={camera}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: px(responsive({ landscape: 44, vertical: 30 })),
          transform: `scale(${settle})`,
        }}
      >
        {Array.from({ length: count }, (_, i) => {
          const isTheOne = i === centre;
          return (
            <Mark
              key={i}
              shape="plane"
              solid
              tone={isTheOne ? 'warm' : 'cool'}
              width={responsive({ landscape: 150, vertical: 120 })}
              height={responsive({ landscape: 94, vertical: 76 })}
              delay={Math.abs(i - centre) * staggerTokens.loose}
              duration={durations.slow}
              glow={isTheOne ? 0.9 : 0.15}
              opacity={isTheOne ? 1 : 0.55}
            />
          );
        })}
      </div>
    </Scene>
  );
};
