import React from 'react';
import { useCurrentFrame } from 'remotion';
import {
  Scene,
  Text,
  animate,
  durations,
  stagger as staggerTokens,
  useFormat,
  useResponsive,
  useTheme,
  alpha,
} from '@/framework';
import { Mark } from '../components/Mark.jsx';
import { MarkRow, MarkGrid } from '../components/MarkField.jsx';
import { ATMOSPHERE, CAMERA, WORDS } from '../narrative.js';

/**
 * MOVEMENT V — STRUCTURE (shots 7-10, 7 bars).
 *
 * Repetition becomes form. The single human mark is copied, aligned, gridded
 * and finally outnumbered — and the audience should feel this as GOOD BUT
 * SLIGHTLY COLD. The system is beautiful and it is swallowing the idea.
 *
 * ── THE FREE STORYTELLING BEAT ──────────────────────────────────────────────
 * All four shots run the `workshop` atmosphere, which is the only recipe in the
 * framework with `grid: true`. The drafting grid therefore SURFACES at the
 * exact moment repetition begins — structure becoming literally visible. It
 * costs one prop and does more narrative work than any animation here.
 *
 * The stagger step also tightens across the movement (loose → base → tight),
 * which is the acceleration the score is building underneath.
 */

const useShot = (id) => ({ background: ATMOSPHERE[id], camera: CAMERA[id] });

/**
 * 7 · REPEAT — 2 bars. The system arrives as a copy.
 *
 * A second stroke joins the first, and it is COOL. That single colour choice is
 * the entire beat: the copy is not the person who made the original. Indigo
 * enters the film here and does not leave until the final shot.
 */
export const Repeat = () => {
  const { background, camera } = useShot('repeat');
  const { px } = useFormat();

  return (
    <Scene background={background} camera={camera}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: px(64) }}>
        <Mark shape="stroke" tone="warm" height={230} angle={2.4} duration={durations.fast} />
        <Mark
          shape="stroke"
          tone="cool"
          height={218}
          angle={-1.2}
          delay={staggerTokens.dramatic}
          duration={durations.slow}
        />
      </div>
    </Scene>
  );
};

/**
 * 8 · ROW — 2 bars. Amber is outnumbered.
 *
 * Six strokes, the original still amber at the head of the line. `MarkRow`
 * handles the per-format count so portrait shows four rather than cramming six
 * into a phone frame.
 */
export const Row = () => {
  const { background, camera } = useShot('row');

  return (
    <Scene background={background} camera={camera}>
      <MarkRow count={6} warmIndex={0} step={staggerTokens.loose} height={210} />
    </Scene>
  );
};

/**
 * 9 · GRID — 2 bars. The lattice.
 *
 * A full 3x5 field entering on a diagonal wave. One cell stays warm — the
 * original mark, still in there, no longer findable at a glance. That is the
 * point of the shot and the reason the warm cell is off-centre rather than
 * in the middle.
 */
export const GridShot = () => {
  const { background, camera } = useShot('grid');

  return (
    <Scene background={background} camera={camera}>
      <MarkGrid rows={3} columns={5} warmCell={6} step={staggerTokens.base} height={120} />
    </Scene>
  );
};

/**
 * 10 · FIELD — 1 bar. Density, and the system's own vocabulary.
 *
 * The shot tightens to a single bar and the field doubles. The mono register
 * returns — REPEAT / ALIGN / REPEAT — this time as the machine describing what
 * it is doing, not as a fact about a person. Same typeface, opposite speaker.
 */
export const Field = () => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const { background, camera } = useShot('field');
  const { px } = useFormat();

  return (
    <Scene background={background} camera={camera}>
      <MarkGrid rows={4} columns={9} warmCell={20} step={staggerTokens.tight} height={86} gap={26} />

      <Text
        variant="eyebrow"
        align="center"
        color={alpha(theme.colors.text.secondary, 0.8)}
        style={{
          marginTop: px(70),
          opacity: animate({ frame, delay: 12, duration: durations.base, easing: 'entrance' }),
        }}
      >
        {WORDS.structure}
      </Text>
    </Scene>
  );
};
