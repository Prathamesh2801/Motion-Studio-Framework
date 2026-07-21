import React from 'react';
import { useVideoConfig } from 'remotion';
import { StandardFilm } from '@/templates';
import { Scene, Text, useSceneProgress } from '@/framework';
import { fromIdeaToRealityTimeline, fromIdeaToRealityDuration, SCENE_PLAN } from './timeline.js';
import { ATMOSPHERE } from './content.js';

/**
 * From Idea to Reality — the assembler.
 *
 * A timeline (structure) plus a scene map (what plays each beat). No frame
 * offsets, no layout maths, no per-format branching: those belong to the
 * timeline, the layouts and StandardFilm respectively.
 *
 * ── CURRENT STATE: SLATES ───────────────────────────────────────────────────
 * Every beat renders a SLATE — a dev harness naming the shot, its length and
 * its atmosphere. Real shots replace them movement by movement across Steps
 * 4-7.
 *
 * Building the edit before the images is deliberate: it lets the film's TIMING
 * be reviewed on its own. Timing is the half that is hardest to fix later and
 * impossible to judge from a shot list on paper.
 */

/** Temporary dev harness. Deleted once every beat has a real shot. */
const Slate = ({ id, bars }) => {
  const { frame, durationInFrames } = useSceneProgress();

  return (
    <Scene background={ATMOSPHERE[id]} camera="static">
      <Text variant="eyebrow" align="center">
        {ATMOSPHERE[id]}
      </Text>
      <Text variant="hero" align="center">
        {id}
      </Text>
      <Text variant="eyebrow" align="center">
        {bars} bar{bars === 1 ? '' : 's'} · {frame} / {durationInFrames}
      </Text>
    </Scene>
  );
};

const slates = Object.fromEntries(
  SCENE_PLAN.map((scene) => [scene.id, <Slate key={scene.id} id={scene.id} bars={scene.bars} />]),
);

export const FromIdeaToReality = () => {
  const { fps } = useVideoConfig();

  return (
    <StandardFilm
      timeline={fromIdeaToRealityTimeline(fps)}
      // Hard cuts are this film's house style; the three dissolves are declared
      // per-scene in the plan. See the transition note in `timeline.js`.
      transition="none"
      scenes={slates}
    />
  );
};

export { fromIdeaToRealityDuration };
export default FromIdeaToReality;
