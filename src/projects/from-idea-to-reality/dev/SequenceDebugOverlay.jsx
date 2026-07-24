import React from 'react';
import { useCurrentFrame } from 'remotion';
import { useFormat } from '@/framework';

/**
 * In-frame debug guides — safe area, beat markers, frame readout. DEV TOOL
 * ONLY. Rendered by both `opening.jsx` and `ending.jsx`, only when
 * `getRemotionEnvironment().isStudio`, and even then only the toggles the
 * Studio Props panel has switched on actually draw anything. Shared rather
 * than duplicated: the guides don't know or care which sequence they're
 * measuring.
 *
 * Lives inside the Scene (not a portal) because these guides describe the
 * FRAME — they need the same coordinate space as the content they're
 * measuring, not the browser window.
 */
export const SequenceDebugOverlay = ({ debug, markers, duration }) => {
  const frame = useCurrentFrame();
  const { gutter, safeTop, safeBottom, width, height } = useFormat();

  if (!debug.showSafeArea && !debug.showTimelineMarkers && !debug.showCurrentFrame) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 999 }}>
      {debug.showSafeArea ? (
        <div
          style={{
            position: 'absolute',
            left: gutter,
            right: gutter,
            top: safeTop,
            bottom: safeBottom,
            border: '1px dashed rgba(255, 80, 80, 0.6)',
          }}
        />
      ) : null}

      {debug.showTimelineMarkers ? (
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 24, height: 4 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }} />
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${Math.min(1, frame / duration) * 100}%`,
              background: 'rgba(240, 180, 95, 0.8)',
              borderRadius: 2,
            }}
          />
          {markers.map(({ label, at }) => (
            <div
              key={label}
              style={{
                position: 'absolute',
                left: `${Math.min(1, at / duration) * 100}%`,
                bottom: 10,
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.75)' }}>
                {label}
              </span>
              <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.5)' }} />
            </div>
          ))}
        </div>
      ) : null}

      {debug.showCurrentFrame ? (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            padding: '4px 10px',
            fontFamily: 'monospace',
            fontSize: 13,
            color: '#fff',
            background: 'rgba(0,0,0,0.55)',
            borderRadius: 4,
          }}
        >
          frame {frame} / {width}×{height}
        </div>
      ) : null}
    </div>
  );
};

export default SequenceDebugOverlay;
