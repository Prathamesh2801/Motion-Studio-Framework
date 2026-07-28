import React, { useEffect, useState } from 'react';

/**
 * Playback transport (Ring 4).
 *
 * `<Player controls>` already draws a bar; this sits above it because the
 * application needs playback state it can also DISPLAY — the frame counter, the
 * elapsed time, and a scrub that keeps working while the document is being
 * edited underneath it.
 *
 * ── WHY IT SUBSCRIBES RATHER THAN POLLS ─────────────────────────────────────
 * The player emits `frameupdate`; reading `getCurrentFrame()` on a timer would
 * either lag the playhead or burn a render per animation frame. Subscribing
 * costs one setState per emitted frame and stays exact.
 *
 * The listeners are re-attached whenever the player instance changes, because
 * switching format remounts it — miss that and the transport silently detaches
 * from the thing it is controlling.
 */
export const Transport = ({ playerRef, durationInFrames, fps }) => {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return undefined;

    const onFrame = (event) => setFrame(event.detail.frame);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    player.addEventListener('frameupdate', onFrame);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);
    return () => {
      player.removeEventListener('frameupdate', onFrame);
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
    };
    // `durationInFrames` is in the deps as a proxy for "the player was
    // remounted" — a format or document change swaps the instance, and stale
    // listeners would leave the transport pointing at a dead player.
  }, [playerRef, durationInFrames]);

  const seek = (next) => {
    const clamped = Math.max(0, Math.min(durationInFrames - 1, next));
    playerRef.current?.seekTo(clamped);
    setFrame(clamped);
  };

  const time = (f) => {
    const seconds = f / fps;
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  };

  const button =
    'rounded-md bg-white/8 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/15 hover:text-white';

  return (
    <div className="flex items-center gap-3">
      <button type="button" className={button} onClick={() => seek(0)} title="Restart">
        ⏮
      </button>
      <button
        type="button"
        className={button}
        onClick={() => playerRef.current?.toggle()}
        title={playing ? 'Pause' : 'Play'}
      >
        {playing ? '❚❚' : '▶'}
      </button>

      <input
        type="range"
        min={0}
        max={Math.max(0, durationInFrames - 1)}
        value={frame}
        onChange={(event) => seek(Number(event.target.value))}
        className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/15
                   [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-white"
      />

      <span className="w-28 text-right font-mono text-[11px] text-white/40">
        {time(frame)} / {time(durationInFrames)}
      </span>
    </div>
  );
};

export default Transport;
