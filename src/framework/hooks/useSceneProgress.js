import { useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp } from '../helpers/math.js';

/**
 * Normalised position within the current Sequence.
 *
 * Useful for scene-length effects (camera pushes, background drifts) that
 * should scale with however long the scene happens to be, rather than assuming
 * a fixed frame count.
 */
export const useSceneProgress = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const progress = clamp(frame / Math.max(1, durationInFrames - 1));

  return {
    frame,
    fps,
    durationInFrames,
    progress,
    seconds: frame / fps,
    /** Frames remaining — handy for triggering exits near the end. */
    remaining: durationInFrames - frame,
    /** True in the final `n` frames of the scene. */
    isEnding: (n = 20) => frame >= durationInFrames - n,
  };
};

export default useSceneProgress;
