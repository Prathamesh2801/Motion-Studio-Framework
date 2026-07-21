import React from 'react';
import { TransitionSeries, resolveTransition, Soundtrack } from '@/framework';

/**
 * The standard film skeleton: a built timeline plus a map of scenes, laid into a
 * TransitionSeries with an optional music bed.
 *
 * This is the boilerplate every assembler was otherwise repeating. A project
 * becomes a timeline (data), a scene map (templates) and — at most — a
 * soundtrack:
 *
 *   <StandardFilm
 *     timeline={filmTimeline(fps)}
 *     scenes={{ open: <TitleScene … />, close: <OutroScene … /> }}
 *   />
 *
 * `scenes` values may be elements or components; both are accepted so simple
 * scenes can be written inline and richer ones kept as components.
 *
 * ── WHY TRANSITION DURATION IS NOT PER-SCENE ────────────────────────────────
 * A scene may choose its transition TYPE via `transition` on its plan entry, but
 * the LENGTH always comes from the timeline's overlap. Scene positions were
 * computed against that overlap; letting a transition run a different length
 * would slide every subsequent cut. Type is free, duration is derived.
 */
export const StandardFilm = ({ timeline, scenes, transition = 'fade', soundtrack, children }) => {
  const { scenes: entries, overlap, derived } = timeline;

  const renderScene = (scene) => {
    const entry = scenes?.[scene.id];
    if (!entry) {
      throw new Error(
        `StandardFilm: no scene registered for "${scene.id}". ` +
          `Timeline ids: ${entries.map((s) => s.id).join(', ')}.`,
      );
    }
    if (React.isValidElement(entry)) return entry;
    const SceneComponent = entry;
    return <SceneComponent />;
  };

  const transitionFor = (scene) => {
    const spec = scene.transition ?? transition;
    const normalised = typeof spec === 'string' ? { type: spec } : spec;
    // Duration is always the timeline's overlap — see the note above.
    return resolveTransition({ ...normalised, duration: overlap });
  };

  return (
    <>
      <TransitionSeries>
        {entries.flatMap((scene, index) => {
          const nodes = [
            <TransitionSeries.Sequence key={scene.id} durationInFrames={scene.durationInFrames} name={scene.id}>
              {renderScene(scene)}
            </TransitionSeries.Sequence>,
          ];

          if (index < entries.length - 1 && overlap > 0) {
            const { presentation, timing } = transitionFor(scene);
            nodes.push(
              <TransitionSeries.Transition key={`${scene.id}-transition`} presentation={presentation} timing={timing} />,
            );
          }
          return nodes;
        })}
      </TransitionSeries>

      {soundtrack ? (
        <Soundtrack cuts={derived?.musicCuts} {...soundtrack} />
      ) : null}

      {children}
    </>
  );
};

export default StandardFilm;
