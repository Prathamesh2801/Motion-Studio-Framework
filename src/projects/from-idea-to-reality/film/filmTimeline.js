import { buildTimeline, createBarGrid } from '@/framework';

/**
 * From Idea to Reality — structure.
 *
 * A MUSIC-LOCKED film. Every length is in bars, nothing is in seconds, and no
 * frame number appears anywhere in this project. The edit is derived from the
 * musical grid, which is what makes the cuts land on the beat rather than near
 * it.
 *
 * ── THE ONE NUMBER THAT MATTERS ─────────────────────────────────────────────
 * `BPM` below is the film's single tempo constant. Change it and all 18 cuts,
 * the composition length and (later) the audio edit re-derive together. That is
 * the whole reason the film was planned in bars rather than seconds: the score
 * is being licensed AFTER the picture is built, so the picture has to adapt to
 * the track rather than the track being forced to fit the picture.
 */

// ── Tempo ───────────────────────────────────────────────────────────────────
/**
 * MEASURED, not composed-to-picture. `departed-forever_main-full.wav` (2:33,
 * `public/projects/from-idea-to-reality/music/`) is a found/licensed cue, not
 * a bespoke score — so tempo was extracted from the actual waveform (onset
 * envelope + beat tracking) rather than chosen. 139.675 BPM, confirmed against
 * ~270 detected beats at a consistent ~0.43s interval from roughly bar 8.5
 * onward (the track has no pulse before then — see the sourceBar note below).
 *
 * `downbeatSeconds` stays 0: source bar 0 = source second 0, which is where
 * the picture's own bar 0 (`void`) starts. The track's pre-pulse intro (0 to
 * ~14.9s) is not silence — it's already the right atmosphere for movements
 * I–III, playing at its own pace with no beat to be on or off.
 */
export const BPM = 139.675;

export const GRID = createBarGrid({ bpm: BPM, beatsPerBar: 4, downbeatSeconds: 0 });

// ── Transition policy ───────────────────────────────────────────────────────
/**
 * The overlap every transition runs for, film-wide. A scene chooses its
 * transition TYPE; the LENGTH is always this, because scene positions are
 * computed against it and a longer transition somewhere would slide every cut
 * after it off the bar line.
 *
 * ── WHY THIS IS NOT `cut` (0 FRAMES) ────────────────────────────────────────
 * The film is 16 hard cuts and 1 dissolve. An overlap of 0 would make the hard
 * cuts trivially correct — and the dissolve impossible, because StandardFilm
 * only emits a transition at all when the overlap is greater than zero.
 *
 * So the overlap stays at `base` and the hard cuts are expressed as the `none`
 * transition TYPE instead. `none` stacks the incoming scene opaquely over the
 * outgoing one for the whole window, so the picture changes on the transition's
 * FIRST frame — which is the bar line. A hard cut, exactly on the beat, with
 * one real dissolve still available.
 */
export const TRANSITION_OVERLAP = 'base';

/**
 * The 18-shot edit.
 *
 * Read it as the film: seven movements, energy falling for the first third,
 * stillness at the hinge, then accelerating to a peak and releasing. The cut
 * DENSITY is the story — one shot in the first phrase, six in the sixth.
 *
 * `none` is the default transition set on <StandardFilm>; only the dissolve
 * is stated here, which keeps the exception visible.
 *
 * ── A SCENE'S `transition` IS THE ONE THAT FOLLOWS IT ───────────────────────
 * StandardFilm emits the transition AFTER each scene's sequence, configured by
 * that scene. So the one dissolve in the film, INTO `form`, is declared on
 * `peak` — and `handover`, the film's last scene, carries no `transition`,
 * because that would be dead config: nothing follows it inside the film
 * itself (`Ending` begins in its own `Sequence`, past a hard boundary a
 * dissolve can't cross).
 *
 * The film's opening fade-up from black is therefore NOT a transition — there
 * is no scene before `void` to dissolve from. It belongs inside the Void shot
 * itself, and it is built there in Step 4.
 */
/**
 * ── DIRECTOR'S CUT, RE-TIMED TO THE REAL TRACK ──────────────────────────────
 * 18 shots (the original 19-shot cut, minus the old closing `title` card —
 * superseded by `ending/Ending.jsx`'s own title reveal, see that file), same
 * 7 movements, same `narrative.js` direction. Bar counts
 * are re-balanced from the Director's Cut (which ran a placeholder 84 BPM
 * with no audio) to actually ride `departed-forever_main-full.wav`:
 *
 *   - Movements I–IV (void → first-mark) total 10.5 bars, landing First Mark
 *     at source-time ~14.6s — right where the track's own pulse enters
 *     (first detected beat: 14.907s). "Pulse enters" is no longer just a
 *     code comment; it is now what actually happens on the hinge.
 *   - Movements V–VI play out straight through the source (no splice) across
 *     its natural early build. `traverse` is given an explicit `sourceBar`
 *     purely so the ONE splice below has a defined predecessor to compare
 *     against — see the `barsTimebase.derive` contract in
 *     `framework/timeline/strategies.js`. It is not itself a cut.
 *   - `peak` is the film's one splice, jumping from a quiet mid-track build
 *     to source bar 52 (~89.35s) — the real track's climactic wall, which
 *     holds through its two loudest peaks (89s, 93s) and the crash where it
 *     finally breaks (~95.5s). At 4 bars, `peak` rides that whole arc, so the
 *     fade into `form` lands AFTER the crash, on the breakdown — the "exhale"
 *     the shot has always been written for, now scored by an actual release
 *     in the track rather than implied by the cut alone.
 *   - `form` and `handover` carry no `sourceBar`: they continue playing the
 *     source forward from wherever `peak` left it (~96.2s), riding the
 *     track's own quiet tail out of the film and into the silent `Ending`.
 */
export const SCENE_PLAN = [
  // ── I. VOID ── nothing has begun. A beat, not a hold.
  { id: 'void', bars: 1.5 },

  // ── II. SPARK ── the idea arrives, quietly.
  { id: 'spark', bars: 2 },

  // ── III. DOUBT ── the warmth is withdrawn. Handheld, drifting, alone.
  { id: 'doubt', bars: 2 },
  { id: 'drift', bars: 1 }, // the shortest shot yet — a flinch
  { id: 'count', bars: 2 }, // the film's only fact, in the mono register

  // ── IV. THE FIRST MARK ── the hinge. Camera stops. Pulse enters. ⭐
  // Cumulative 8.5 bars here = source ~14.6s — the track's real pulse-in.
  { id: 'first-mark', bars: 2 },

  // ── V. STRUCTURE ── repetition becomes form. Cold, mechanical, accelerating.
  { id: 'repeat', bars: 1 }, // a second stroke — the system arrives as a copy
  { id: 'row', bars: 1 },
  { id: 'grid', bars: 1 },
  { id: 'field', bars: 1 },

  // ── VI. MOMENTUM ── one shot per bar. The cuts ARE the propulsion.
  { id: 'planes', bars: 1 },
  { id: 'layers', bars: 1 },
  { id: 'lattice', bars: 1 },
  { id: 'depth', bars: 1 },
  // No cut here — `sourceBar` only exists so `peak`'s jump below has a
  // predecessor to diverge from. See the movement note above.
  { id: 'traverse', bars: 1, sourceBar: 18.5 },
  // THE SPLICE. Source bar 52 (phrase-aligned, 52 % 4 === 0) = ~89.35s — the
  // track's climactic wall through its crash. The dissolve into `form` is
  // declared here, same as the Director's Cut; what changed is what it now
  // dissolves OUT OF.
  { id: 'peak', bars: 4, sourceBar: 52, transition: 'fade' },

  // ── VII. REALITY ── release, not a fourth act.
  { id: 'form', bars: 1.5 },
  { id: 'handover', bars: 1 }, // the last shot of the film; settles into Ending
];

/** Derived, so a number quoted in review is never a stale comment. */
export const TOTAL_BARS = SCENE_PLAN.reduce((sum, scene) => sum + scene.bars, 0);

/**
 * ── NOTE ON AUDIO ────────────────────────────────────────────────────────────
 * `peak` carries the film's one `sourceBar`, so the timeline derives one
 * `musicCuts` entry and the score plays as two segments — a straight bed
 * through the first ~33.5s of picture, then a splice to the track's real
 * climax — joined with the equal-power crossfade `Soundtrack` already
 * applies at every cut. Wired in `index.jsx` via the `soundtrack` prop on
 * `StandardFilm`, which reads `musicCuts` off this timeline automatically.
 */

export const fromIdeaToRealityTimeline = (fps) =>
  buildTimeline(SCENE_PLAN, {
    fps,
    timebase: 'bars',
    transition: TRANSITION_OVERLAP,
    grid: GRID,
  });

export const fromIdeaToRealityDuration = (fps) => fromIdeaToRealityTimeline(fps).durationInFrames;
