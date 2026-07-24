import React from 'react';
import { Sequence, useVideoConfig } from 'remotion';
import { StandardFilm } from '@/templates';
import { fromIdeaToRealityTimeline, fromIdeaToRealityDuration as filmDuration } from './film/filmTimeline.js';
import { Opening } from './opening/Opening.jsx';
import { OPENING_DEFAULT_PROPS, deriveOpeningLayout } from './opening/schema.js';
import { Ending } from './ending/Ending.jsx';
import { ENDING_DEFAULT_PROPS, deriveEndingLayout } from './ending/schema.js';
import { Void, Spark, Doubt, Drift, Count, FirstMark } from './film/shots/descent.jsx';
import { Repeat, Row, GridShot, Field } from './film/shots/structure.jsx';
import { Planes, Layers, Lattice, Depth, Traverse, Peak } from './film/shots/momentum.jsx';
import { Form, Handover } from './film/shots/resolution.jsx';
import { asset } from './film/narrative.js';

/**
 * From Idea to Reality — the assembler.
 *
 * A silent, score-driven short about the distance between having an idea and
 * making it real. Eighteen shots, twenty-six bars, no voiceover.
 *
 * ── WHAT IS AND IS NOT HERE ─────────────────────────────────────────────────
 * This file is a MAP, and that is the whole point of the architecture. There
 * are no frame numbers, no durations, no layout maths, no `if (isVertical)`
 * branches and no transition wiring, because:
 *
 *   structure  →  film/filmTimeline.js   (bars, derived from one BPM constant)
 *   direction  →  film/narrative.js      (atmosphere, camera and words per shot)
 *   images     →  film/shots/*.jsx       (one file per movement)
 *   assembly   →  here
 *
 * Re-pacing the film is editing a bar count. Re-lighting it is editing a
 * column in `film/narrative.js`. Neither touches this file.
 *
 * The keys below must match the `id`s in SCENE_PLAN — a missing one throws by
 * name and lists the ids the timeline has, rather than rendering a black frame.
 *
 * ── TEMPORARY: BOOKEND ISOLATION MODE ───────────────────────────────────────
 * `BYPASS_FILM` skips the middle film's `Sequence` entirely so the composition
 * becomes `Opening → Ending`, for iterating on the two reusable framework
 * bookends without re-rendering (or re-watching) the 18-shot narrative film
 * every time. This is a runtime assembly change ONLY — no film code, shot, or
 * timeline/narrative data is touched; `filmTimeline.js` and `film/narrative.js`
 * are untouched and the film Sequence below is fully intact, just not mounted.
 * Flip this back to `false` (or delete the flag) to reconnect the film.
 */
const BYPASS_FILM = true;
export const FromIdeaToReality = ({
  openingProps = OPENING_DEFAULT_PROPS,
  endingProps = ENDING_DEFAULT_PROPS,
}) => {
  const { fps } = useVideoConfig();
  const openingFrames = deriveOpeningLayout(openingProps).total;
  const filmFrames = filmDuration(fps);
  const endingFrames = deriveEndingLayout(endingProps).total;
  // When bypassed, Ending starts right after Opening — the film's length
  // simply isn't added to its offset. See BOOKEND ISOLATION MODE above.
  const endingFrom = openingFrames + (BYPASS_FILM ? 0 : filmFrames);

  return (
    <>
      <Opening {...openingProps} />
      {!BYPASS_FILM && (
        /**
         * The main film mounts inside its own `Sequence`, offset by the
         * opening's length. Everything inside — `Void`'s fade-up, the
         * soundtrack's splice sync tuned against `Void` being picture-frame 0
         * — is untouched: Remotion scopes `useCurrentFrame()` (and therefore
         * `StandardFilm`'s `Soundtrack`) to start counting from 0 again at this
         * offset, so the opening being silent and the film's existing audio
         * sync are both true for free, not because anything downstream knows
         * the opening exists.
         */
        (<Sequence from={openingFrames} name="film">
          <StandardFilm
            timeline={fromIdeaToRealityTimeline(fps)}
            /**
             * Hard cuts are this film's house style. On a bar-locked edit a 20-frame
             * dissolve smears the downbeat — the picture change arrives AROUND the
             * beat instead of ON it, which loses exactly the quality the `bars`
             * timebase was chosen for. The two dissolves are declared per-scene in
             * the plan. See the transition note in `film/filmTimeline.js`.
             */
            transition="none"
            scenes={{
              // I-III · The descent. Energy falls; the camera loses its footing.
              void: <Void />,
              spark: <Spark />,
              doubt: <Doubt />,
              drift: <Drift />,
              count: <Count />,

              // IV · The hinge. The camera stops. ⭐
              'first-mark': <FirstMark />,

              // V · Structure. Repetition becomes form, and the grid surfaces.
              repeat: <Repeat />,
              row: <Row />,
              grid: <GridShot />,
              field: <Field />,

              // VI · Momentum. One shot per bar.
              planes: <Planes />,
              layers: <Layers />,
              lattice: <Lattice />,
              depth: <Depth />,
              traverse: <Traverse />,
              peak: <Peak />,

              // VII · Reality. The release, and the film's last shot.
              form: <Form />,
              handover: <Handover />,
            }}
            /**
             * SOUNDTRACK (Step 8). `musicCuts` is read off `timeline` automatically
             * by `StandardFilm` — the one splice declared in `film/filmTimeline.js`
             * (on `peak`) is all this prop needs to know about.
             */
            soundtrack={{ src: asset.music('departed-forever_main-full.wav') }}
          />
        </Sequence>)
      )}
      {/**
       * The ending mounts in its own `Sequence`, offset by `endingFrom` —
       * opening + film normally, or opening alone in bookend isolation mode.
       * Either way it plays entirely in silence: the `Soundtrack` component
       * is scoped to the film's own `Sequence` above, so nothing further is
       * needed to keep the coda quiet.
       */}
      <Sequence from={endingFrom} name="ending">
        <Ending {...endingProps} />
      </Sequence>
    </>
  );
};

/**
 * Opening + main film + ending — the one place all three lengths are summed.
 *
 * Uses `OPENING_DEFAULT_PROPS`/`ENDING_DEFAULT_PROPS`, not live props: a
 * `<Composition>`'s registered `durationInFrames` isn't reactive to prop
 * edits (that needs `calculateMetadata`, which this project doesn't use, to
 * keep the tuning workflow simple — see `opening/schema.js`/`ending/
 * schema.js`). This is what keeps the composition's total length, and
 * therefore production renders, pinned to the approved defaults regardless
 * of what's being tuned live in Studio.
 *
 * Respects `BYPASS_FILM` too, so the registered composition length always
 * matches what actually mounts — otherwise Studio would reserve several
 * seconds of blank timeline where the film would have played.
 */
export const fromIdeaToRealityDuration = (fps) =>
  deriveOpeningLayout(OPENING_DEFAULT_PROPS).total +
  (BYPASS_FILM ? 0 : filmDuration(fps)) +
  deriveEndingLayout(ENDING_DEFAULT_PROPS).total;

export default FromIdeaToReality;
