/**
 * Soundtrack edit machinery (Ring 1) — track-agnostic.
 *
 * The reference implementation welded this to one measured WAV. Here every
 * number is a parameter: the caller supplies the source, the cut list and the
 * crossfade length. Videos with no music, one continuous bed, or a spliced edit
 * all use the same code path.
 */

/**
 * Bed level, linear gain. 0.18 ≈ -14.9 dB, which leaves roughly 15 dB of
 * headroom for voiceover and effects to sit above the music.
 */
export const DEFAULT_BED_GAIN = 0.18;

/** Head/tail fade lengths in frames @30fps; scaled by fps at the use site. */
export const DEFAULT_FADES = { in: 10, out: 24 };

/**
 * Crossfade length for a bar grid, in beats. Four beats (one bar) is the
 * default for spliced music: a short taper avoids a click but not an audible
 * edit — the arrangement still swaps in an instant. When both sides are the same
 * track at the same tempo starting on a downbeat they are phase-locked, so a
 * bar-long overlap reads as the arrangement thickening rather than as a cut.
 */
export const crossfadeForGrid = (grid, fps, beats = 4) => Math.round(beats * grid.beatSeconds * fps);

/**
 * Build a multi-segment edit from a cut list.
 *
 * Each cut says "at this film frame, play from this point in the source". The
 * timeline owns those film frames — they are the same numbers that position the
 * picture, which is what keeps sound and image locked.
 *
 * Segments OVERLAP by one crossfade centred on each cut: the incoming segment
 * starts half a crossfade early and the outgoing one runs half a crossfade late.
 * The `crossfadeIn/Out` flags tell the player which edges are joins and which are
 * the film's actual head and tail.
 *
 * @param {object} args
 * @param {number} args.fps
 * @param {Array<{from:number, sourceSeconds:number}>} [args.cuts]
 *   Ordered by `from`; the first entry starts at frame 0. Defaults to a single
 *   continuous segment from the top of the source.
 * @param {number} args.totalFrames  Film length.
 * @param {number} [args.crossfadeFrames]
 */
export const buildSoundtrackEdit = ({ fps, cuts, totalFrames, crossfadeFrames = 0 }) => {
  const list = cuts && cuts.length > 0 ? cuts : [{ from: 0, sourceSeconds: 0 }];
  const half = Math.round(crossfadeFrames / 2);

  return list.map((cut, index) => {
    const next = list[index + 1];
    const isFirst = index === 0;
    const isLast = index === list.length - 1;

    const from = isFirst ? 0 : cut.from - half;
    const until = isLast ? totalFrames : next.from + half;

    return {
      from,
      durationInFrames: Math.max(1, until - from),
      trimBefore: Math.max(0, Math.round(cut.sourceSeconds * fps) - (isFirst ? 0 : half)),
      crossfadeIn: !isFirst,
      crossfadeOut: !isLast,
    };
  });
};
