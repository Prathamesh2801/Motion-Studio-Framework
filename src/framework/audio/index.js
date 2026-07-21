export { Soundtrack } from './Soundtrack.jsx';
export {
  buildSoundtrackEdit,
  crossfadeForGrid,
  DEFAULT_BED_GAIN,
  DEFAULT_FADES,
} from './soundtrack.js';

/**
 * Audio (Ring 1).
 *
 * Today this module does exactly one thing: a music bed, optionally spliced into
 * a multi-segment edit with equal-power joins. Narration and sound design are
 * NOT implemented — whether the first cinematic project is narrated is still
 * undecided, and building a voice pipeline before there is a voice to play would
 * be guessing at an API.
 *
 * ── THE VOICE SEAM ──────────────────────────────────────────────────────────
 * What IS decided is where narration plugs in, so that adding it later is
 * additive rather than a restructure. Three points, in the order they would be
 * built:
 *
 * 1. TIMING — a `voiceover` timebase.
 *    Scene lengths would come from VO cue timings rather than being guessed.
 *    This needs NO engine change: the timebase contract in
 *    `framework/timeline/strategies.js` already accepts any strategy with a
 *    `lengthOf`, and `registerTimebase('voiceover', …)` makes it selectable by
 *    name. `scripts/test-timeline.mjs` proves a cue-list strategy works against
 *    the current engine, so this seam is verified, not merely asserted.
 *
 * 2. PLAYBACK — a `Voice` component alongside `Soundtrack`.
 *    Same shape: take resolved `src` plus cue timings owned by the timeline,
 *    mount `<Sequence><Audio/></Sequence>` per cue. It does not need to know
 *    about music, and music does not need to know about it — they are siblings
 *    in the assembler, which is why `StandardFilm` renders `children` after the
 *    soundtrack.
 *
 * 3. MIXING — ducking, via `Soundtrack`'s `gain`.
 *    `gain` already accepts a function of the ABSOLUTE timeline frame, so a duck
 *    envelope derived from VO cues is passed in from the assembler. The mix
 *    decision stays with the project; the bed just plays what it is told.
 *
 * Deliberately NOT decided here: transcript parsing, caption rendering, and the
 * shape of a duck envelope. Those are real design problems that should be solved
 * against a real script, not invented in advance.
 */
