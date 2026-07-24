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
 * `BPM` below is the film's single tempo constant. Change it and all 19 cuts,
 * the composition length and (later) the audio edit re-derive together. That is
 * the whole reason the film was planned in bars rather than seconds: the score
 * is being licensed AFTER the picture is built, so the picture has to adapt to
 * the track rather than the track being forced to fit the picture.
 */

// ── Tempo ───────────────────────────────────────────────────────────────────
/**
 * PLACEHOLDER. The licensed track has not been selected yet.
 *
 * When it is, three values from it replace these and nothing else changes:
 *   bpm              exact tempo, decimals included
 *   beatsPerBar      4 — a meter change would break the grid entirely
 *   downbeatSeconds  where the first downbeat lands; must be 0
 *
 * If the chosen track opens with atmosphere BEFORE the first downbeat, trim the
 * head of the audio file rather than compensating here. Every position in this
 * film is measured from bar 0, so moving that origin moves all 19 cuts.
 */
export const BPM = 84;

export const GRID = createBarGrid({ bpm: BPM, beatsPerBar: 4, downbeatSeconds: 0 });

// ── Transition policy ───────────────────────────────────────────────────────
/**
 * The overlap every transition runs for, film-wide. A scene chooses its
 * transition TYPE; the LENGTH is always this, because scene positions are
 * computed against it and a longer transition somewhere would slide every cut
 * after it off the bar line.
 *
 * ── WHY THIS IS NOT `cut` (0 FRAMES) ────────────────────────────────────────
 * The film is 16 hard cuts and 3 dissolves. An overlap of 0 would make the hard
 * cuts trivially correct — and the 3 dissolves impossible, because StandardFilm
 * only emits a transition at all when the overlap is greater than zero.
 *
 * So the overlap stays at `base` and the hard cuts are expressed as the `none`
 * transition TYPE instead. `none` stacks the incoming scene opaquely over the
 * outgoing one for the whole window, so the picture changes on the transition's
 * FIRST frame — which is the bar line. A hard cut, exactly on the beat, with
 * three real dissolves still available.
 */
export const TRANSITION_OVERLAP = 'base';

/**
 * The 19-shot edit.
 *
 * Read it as the film: seven movements, energy falling for the first third,
 * stillness at the hinge, then accelerating to a peak and releasing. The cut
 * DENSITY is the story — one shot in the first phrase, six in the sixth.
 *
 * `none` is the default transition set on <StandardFilm>; only the dissolves
 * are stated here, which keeps the exceptions visible.
 *
 * ── A SCENE'S `transition` IS THE ONE THAT FOLLOWS IT ───────────────────────
 * StandardFilm emits the transition AFTER each scene's sequence, configured by
 * that scene. So the dissolve INTO `form` is declared on `peak`, the one into
 * `title` is declared on `handover`, and the last scene's `transition` would be
 * dead config because nothing follows it.
 *
 * The film's opening fade-up from black is therefore NOT a transition — there
 * is no scene before `void` to dissolve from. It belongs inside the Void shot
 * itself, and it is built there in Step 4.
 */
export const SCENE_PLAN = [
  // ── I. VOID ── nothing has begun. Held long enough to be uncomfortable.
  { id: 'void', bars: 3 },

  // ── II. SPARK ── the idea arrives, quietly.
  { id: 'spark', bars: 2 },

  // ── III. DOUBT ── the warmth is withdrawn. Handheld, drifting, alone.
  { id: 'doubt', bars: 2 },
  { id: 'drift', bars: 1 }, // one bar — the shortest shot yet, a flinch
  { id: 'count', bars: 2 }, // the film's only fact, in the mono register

  // ── IV. THE FIRST MARK ── the hinge. Camera stops. Pulse enters. ⭐
  { id: 'first-mark', bars: 3 },

  // ── V. STRUCTURE ── repetition becomes form. Cold, mechanical, accelerating.
  { id: 'repeat', bars: 2 }, // a second stroke — the system arrives as a copy
  { id: 'row', bars: 2 },
  { id: 'grid', bars: 2 },
  { id: 'field', bars: 1 },

  // ── VI. MOMENTUM ── one shot per bar. The cuts ARE the propulsion.
  { id: 'planes', bars: 1 },
  { id: 'layers', bars: 1 },
  { id: 'lattice', bars: 1 },
  { id: 'depth', bars: 1 },
  { id: 'traverse', bars: 1 },
  // The dissolve into `form` is declared HERE — the release lands after the
  // peak, and it is the only dissolve in ~14 cuts of hard cutting.
  { id: 'peak', bars: 1, transition: 'fade' },

  // ── VII. REALITY ── release. The first long shots since the hinge.
  { id: 'form', bars: 3 },
  { id: 'handover', bars: 2, transition: 'fade' }, // settles into the title
  { id: 'title', bars: 2 },
];

/** Derived, so a number quoted in review is never a stale comment. */
export const TOTAL_BARS = SCENE_PLAN.reduce((sum, scene) => sum + scene.bars, 0);

/**
 * ── NOTE ON AUDIO (Step 8, deliberately absent) ─────────────────────────────
 * No scene carries a `sourceBar`, so the timeline derives no `musicCuts` and the
 * score will play as one continuous bed. That is the right default for a track
 * composed to picture — but this score is being LICENSED, so it was not written
 * to our shape. If the chosen track's arrangement peaks in the wrong place,
 * adding `sourceBar` to the scenes that need it turns the bed into a spliced
 * edit landing on our beats, with equal-power crossfades handled by the audio
 * engine. The seam is here; it costs one field per scene.
 */

export const fromIdeaToRealityTimeline = (fps) =>
  buildTimeline(SCENE_PLAN, {
    fps,
    timebase: 'bars',
    transition: TRANSITION_OVERLAP,
    grid: GRID,
  });

export const fromIdeaToRealityDuration = (fps) => fromIdeaToRealityTimeline(fps).durationInFrames;
