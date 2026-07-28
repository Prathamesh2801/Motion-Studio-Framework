import React, { useCallback, useMemo, useRef, useState } from 'react';
import { MotionTemplate } from '@/runtime';
import { tryResolvePack } from '@/packs/resolve.js';
import { useEditor } from '../state/EditorProvider.jsx';
import { Transport } from './Transport.jsx';

/**
 * The preview stage (Ring 4) — the editor as a CONSUMER of the runtime.
 *
 * This used to mount `<Player component={PackHost}>` itself. It no longer knows
 * that either exists: it renders `<MotionTemplate>`, exactly as an external
 * React application would. That is the point of the productisation — if the
 * editor cannot be built on the public API, the public API is not finished.
 *
 * ── WHERE IT STILL REACHES PAST THE SDK, AND WHY ────────────────────────────
 * Two places, both because this is a DEBUGGER rather than a product surface:
 *
 *   `tryResolvePack`  the editor shows validation issues per field and keeps
 *                     the last valid frame on screen while you type. The SDK
 *                     deliberately collapses that to `fallback` + `onError`,
 *                     because a product page wants "show something sensible",
 *                     not a diagnostic. Re-resolving here is cheap (it is pure)
 *                     and gives the inspector the issue list and the ViewModel.
 *
 *   the player `ref`  the transport needs play/pause/seek. The SDK forwards a
 *                     ref for exactly this first-party case and does not
 *                     document it for product use.
 *
 * Everything else — mounting, theme resolution, ViewModel conversion, duration,
 * dimensions, asset resolution — now happens inside the runtime.
 */
export const Stage = ({ onResolved }) => {
  const { pack, document, format, dispatch } = useEditor();
  const playerRef = useRef(null);
  const [ready, setReady] = useState(null);

  // The editor's own validation pass. `MotionTemplate` runs its own resolution
  // internally; this one exists to surface *issues*, which the SDK does not
  // expose by design.
  const resolved = useMemo(
    () => tryResolvePack(pack, document, format),
    [pack, document, format],
  );

  /**
   * Keep the last document that resolved.
   *
   * A document is invalid halfway through almost every edit. Blanking the
   * preview each time would make the editor unusable, so an invalid document
   * shows its errors in the inspector while the stage keeps rendering the last
   * good one. The render path throws instead — see `resolvePack`.
   */
  const lastGood = useRef(null);
  if (resolved.ok) lastGood.current = { document, format };
  const showing = resolved.ok ? { document, format } : lastGood.current;

  React.useEffect(() => {
    dispatch({ type: 'setIssues', issues: resolved.issues });
  }, [resolved.issues, dispatch]);

  React.useEffect(() => {
    if (resolved.ok) onResolved?.(resolved.mount);
  }, [resolved, onResolved]);

  const handleReady = useCallback((info) => setReady(info), []);

  if (!showing) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-red-300">
        This document cannot be rendered yet — fix the errors in the inspector.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex min-h-0 flex-1 items-center justify-center">
        {/* `h-full w-full` is load-bearing, both of them.

            Without `w-full`: this div is a flex ITEM with `width: auto`, so the
            browser shrink-to-fits it from its content — and its only content is
            <MotionTemplate>, whose root is `width: 100%`. A percentage against
            an indefinite width resolves to zero, so the wrapper collapsed to
            0x0, `aspect-ratio` gave it 0 height, and `overflow-hidden` clipped a
            fully-rendered film to nothing: a black viewport over correct DOM.

            Without `h-full`: the same trap one axis over. A portrait format
            (1080x1920) made the template 832x1479 inside a wrapper whose height
            was content-derived, and the child's `max-height: 100%` had no
            definite parent height to resolve against — so it did not clamp and
            the film was cropped rather than fitted.

            With both, the wrapper is a definite box and the template fills it;
            the Player letterboxes the composition inside, which is its job and
            is correct for every aspect ratio. */}
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg shadow-2xl ring-1 ring-white/10">
          <MotionTemplate
            ref={playerRef}
            template={pack.id}
            data={showing.document}
            format={showing.format}
            controls
            autoPlay
            loop
            // Both axes definite, so the wrapper — not the composition's aspect
            // ratio — decides the box. Overrides the SDK's default responsive
            // sizing on purpose: the editor has a fixed preview area to fill.
            style={{ width: '100%', height: '100%' }}
            onReady={handleReady}
          />
        </div>
      </div>

      {ready ? (
        <Transport
          playerRef={playerRef}
          durationInFrames={ready.durationInFrames}
          fps={ready.fps}
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/45">
        {ready ? (
          <>
            <span>
              {ready.width}x{ready.height} · {ready.fps} fps
            </span>
            <span>
              {ready.durationInFrames} frames · {ready.durationInSeconds.toFixed(1)}s
            </span>
          </>
        ) : null}
        {resolved.ok ? <span>{resolved.mount.vm.metrics.length} metrics</span> : null}
        {!resolved.ok ? <span className="text-amber-300">showing last valid document</span> : null}
      </div>
    </div>
  );
};

export default Stage;
