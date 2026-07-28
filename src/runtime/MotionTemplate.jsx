import React, { forwardRef, useEffect, useMemo } from 'react';
import { Player } from '@remotion/player';
import { PackHost } from '@/packs/PackHost.jsx';
import { tryResolvePack } from '@/packs/resolve.js';
import { resolveTemplate } from './templates.js';
import { toDocument } from './document.js';
import { configureMotionRuntime } from './config.js';
import { TemplateErrorBoundary } from './ErrorBoundary.jsx';

/**
 * `<MotionTemplate>` — the runtime's one component (Ring 5, the SDK).
 *
 * Everything the framework knows how to do arrives here as two props:
 *
 *   <MotionTemplate template="football-player" data={player} />
 *
 * A consumer never sees `PackHost`, `resolvePack`, `withTheme`, a ViewModel, a
 * timeline, a format token or `<Player>`. Those are not hidden for tidiness —
 * they are the moving parts that let the same template serve a video render and
 * a web page, and a consumer who reached for them would be coupled to decisions
 * this layer exists to be free to change.
 *
 * ── WHAT IT DOES, IN ORDER ──────────────────────────────────────────────────
 *   1. resolve the template name        → a pack manifest
 *   2. wrap `data` in a document        → envelope + prop overrides
 *   3. resolve the document             → ViewModel, theme, duration, dimensions
 *   4. mount it in a Remotion clock     → <Player>
 *
 * Steps 3 and 4 are the ones that cannot be done in plain React: framework
 * components read `useCurrentFrame()`, which needs Remotion's timing context.
 * `<Player>` supplies it. That is the whole reason this component exists rather
 * than a plain `<div>` — and the reason Remotion stays a dependency of the
 * runtime while disappearing from the consumer's vocabulary.
 *
 * @param {string}  props.template  Template name — see `listTemplates()`.
 * @param {object}  props.data      A payload for this template, or a full document.
 * @param {string}  [props.format]  'landscape' | 'reel' | 'square'.
 * @param {string}  [props.theme]   Brand name. Defaults to the template's own.
 * @param {string}  [props.accent]  Hex colour override.
 * @param {string}  [props.pace]    'tight' | 'normal' | 'relaxed'.
 * @param {boolean} [props.autoPlay=true]
 * @param {boolean} [props.loop=true]
 * @param {boolean} [props.controls=false] Show the built-in transport bar.
 * @param {boolean} [props.clickToPlay]
 * @param {string}  [props.assetBase] Where template assets are served from.
 * @param {node}    [props.fallback] Rendered instead of the template on error.
 * @param {Function}[props.onError]  `(error) => void`. Data and render errors both.
 * @param {Function}[props.onReady]  `({ width, height, fps, durationInFrames, durationInSeconds }) => void`
 * @param {object}  [ref]
 *   Escape hatch to the underlying player (play/pause/seek), used by first-party
 *   tooling such as the editor. Deliberately undocumented for product use: it is
 *   the one place the Remotion object is reachable, and depending on it forfeits
 *   the insulation the rest of this API provides.
 */
export const MotionTemplate = forwardRef(function MotionTemplate(
  {
    template,
    data,
    format,
    theme,
    accent,
    pace,
    autoPlay = true,
    loop = true,
    controls = false,
    clickToPlay,
    assetBase,
    fallback = null,
    onError,
    onReady,
    className,
    style,
  },
  ref,
) {
  // Applied during render, not in an effect: asset paths are resolved inside
  // `tryResolvePack` below, which runs before any effect would have fired.
  configureMotionRuntime({ assetBase });

  const resolution = useMemo(() => {
    try {
      const pack = resolveTemplate(template);
      const document = toDocument(data, pack, { format, theme, accent, pace });
      const attempt = tryResolvePack(pack, document, document.format);

      if (!attempt.ok) {
        const detail = attempt.issues
          .map((issue) => `${issue.path ? `${issue.path}: ` : ''}${issue.message}`)
          .join('; ');
        return { error: new Error(`<MotionTemplate template="${template}">: ${detail}`) };
      }
      return { pack, document, mount: attempt.mount };
    } catch (error) {
      // Unknown template name, or `data` that is not an object at all.
      return { error };
    }
  }, [template, data, format, theme, accent, pace]);

  const { mount, document, pack, error } = resolution;

  useEffect(() => {
    if (error) onError?.(error);
  }, [error, onError]);

  useEffect(() => {
    if (!mount) return;
    onReady?.({
      width: mount.width,
      height: mount.height,
      fps: mount.fps,
      durationInFrames: mount.durationInFrames,
      durationInSeconds: mount.durationInFrames / mount.fps,
    });
  }, [mount, onReady]);

  // `inputProps` identity drives the Player's re-resolution. Memoised so that a
  // re-render of the consumer's page — which they do not control and we cannot
  // predict — does not restart the animation.
  const inputProps = useMemo(
    () => (mount ? { packId: pack.id, document, format: document.format } : null),
    [mount, pack, document],
  );

  if (!mount) return fallback;

  // The boundary's `resetKey` is the `data` PROP, never the derived `document`.
  // `toDocument` builds a fresh object inside the memo above, so `document` gets
  // a new identity whenever this component REMOUNTS — and React remounts the
  // subtree after an error boundary catches. Keyed on `document`, the boundary
  // would then see a "new" document, clear the error, re-render the throwing
  // child, catch, remount, and repeat: an infinite loop surfacing as
  // "Maximum update depth exceeded". `data` comes from the caller and survives a
  // remount unchanged, so the boundary resets only on genuinely new data.
  return (
    <TemplateErrorBoundary fallback={fallback} onError={onError} resetKey={data}>
      <div
        className={className}
        style={{
          // Responsive by default: the template fills its container's width and
          // takes its height from the composition's own aspect ratio. A fixed
          // pixel size here would make every consumer write the same override.
          width: '100%',
          aspectRatio: `${mount.width} / ${mount.height}`,
          ...style,
        }}
      >
        <Player
          ref={ref}
          component={PackHost}
          inputProps={inputProps}
          durationInFrames={mount.durationInFrames}
          fps={mount.fps}
          compositionWidth={mount.width}
          compositionHeight={mount.height}
          style={{ width: '100%', height: '100%' }}
          autoPlay={autoPlay}
          loop={loop}
          controls={controls}
          clickToPlay={clickToPlay ?? controls}
          acknowledgeRemotionLicense
        />
      </div>
    </TemplateErrorBoundary>
  );
});

export default MotionTemplate;
