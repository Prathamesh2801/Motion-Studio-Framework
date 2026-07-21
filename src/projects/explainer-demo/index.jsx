import React from 'react';
import { useVideoConfig } from 'remotion';
import { TransitionSeries, resolveTransition } from '@/framework';
import { explainerTimeline, explainerDuration, TRANSITION } from './timeline.js';
import { HookScene, ProblemScene, AnswerScene, CloseScene } from './scenes.jsx';

/**
 * Explainer demo — the NON-MUSICAL verification project (Phase 3).
 *
 * A thin assembler: build the timeline, look scenes up by id, lay them into a
 * TransitionSeries. There are no hand-summed `from` offsets anywhere — the
 * timeline owns positions, and each scene is authored as its advance plus the
 * transition overlap, which is exactly what TransitionSeries expects.
 */
const SCENES = {
  hook: HookScene,
  problem: ProblemScene,
  answer: AnswerScene,
  close: CloseScene,
};

export const ExplainerDemo = () => {
  const { fps } = useVideoConfig();
  const timeline = explainerTimeline(fps);
  const transition = resolveTransition({ type: 'fade', duration: TRANSITION });

  return (
    <TransitionSeries>
      {timeline.scenes.flatMap((scene, index) => {
        const SceneComponent = SCENES[scene.id];
        const nodes = [
          <TransitionSeries.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
            <SceneComponent />
          </TransitionSeries.Sequence>,
        ];
        if (index < timeline.scenes.length - 1) {
          nodes.push(
            <TransitionSeries.Transition
              key={`${scene.id}-transition`}
              presentation={transition.presentation}
              timing={transition.timing}
            />,
          );
        }
        return nodes;
      })}
    </TransitionSeries>
  );
};

export { explainerDuration };
export default ExplainerDemo;
