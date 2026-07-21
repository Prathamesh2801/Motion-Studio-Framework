import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  useMotion,
  useStaggeredMotion,
  useAmbientMotion,
  useSceneProgress,
  useResponsive,
  useFormat,
  cameraPush,
} from '@/framework';

/**
 * Phase 1 verification composition.
 *
 * Exercises the ported motion core through the `@/framework` public barrel:
 * useMotion presets, useStaggeredMotion, useAmbientMotion, useSceneProgress +
 * cameraPush, useResponsive reflow and useFormat px() scaling. It uses inline
 * colours on purpose — the visual ThemeProvider path arrives with the component
 * library in Phase 2. Replaced by a real demo project in Phase 5.
 */
const INK = '#f4f5fa';
const DIM = 'rgba(244,245,250,0.62)';
const CANVAS = '#08090d';
const ACCENT = '#6366f1';
const CHIPS = ['Compose', 'Animate', 'Reflow', 'Render'];

export const MotionDemo = () => {
  const { px, isVertical } = useFormat();
  const { responsive } = useResponsive();
  const { frame, durationInFrames } = useSceneProgress();

  const eyebrow = useMotion({ preset: 'rise', delay: 6, duration: 20 });
  const title = useMotion({ preset: 'unmask', delay: 14, duration: 34 });
  const line = useMotion({ preset: 'fade', delay: 30, duration: 24 });
  const chipAt = useStaggeredMotion({ count: CHIPS.length, preset: 'settle', delay: 44, step: 5 });
  const glow = useAmbientMotion({ preset: 'drift' });

  // Whole-scene ~6% push, driven by scene length rather than a magic number.
  const camera = cameraPush({ frame, duration: durationInFrames, amount: 0.06 });

  return (
    <AbsoluteFill style={{ backgroundColor: CANVAS }}>
      {/* Ambient glow blob, continuously drifting. */}
      <AbsoluteFill style={glow}>
        <div
          style={{
            position: 'absolute',
            top: '18%',
            left: '50%',
            width: px(900),
            height: px(900),
            marginLeft: px(-450),
            borderRadius: '50%',
            background: `radial-gradient(circle, ${ACCENT}44 0%, transparent 62%)`,
            filter: 'blur(20px)',
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={camera}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isVertical ? 'center' : 'flex-start',
            justifyContent: 'center',
            textAlign: isVertical ? 'center' : 'left',
            paddingLeft: responsive({ landscape: px(180), vertical: px(80) }),
            paddingRight: responsive({ landscape: px(180), vertical: px(80) }),
            fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
            color: INK,
          }}
        >
          <div
            style={{
              ...eyebrow,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: px(responsive({ landscape: 22, vertical: 30 })),
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: ACCENT,
              marginBottom: px(24),
            }}
          >
            Framework · Phase 1
          </div>

          <div
            style={{
              ...title,
              fontSize: px(responsive({ landscape: 96, vertical: 84 })),
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              maxWidth: px(responsive({ landscape: 1200, vertical: 900 })),
            }}
          >
            The motion core is online.
          </div>

          <div
            style={{
              ...line,
              fontSize: px(responsive({ landscape: 30, vertical: 34 })),
              color: DIM,
              marginTop: px(28),
              maxWidth: px(responsive({ landscape: 820, vertical: 820 })),
            }}
          >
            Pure animations, named presets, camera and hooks — one timeline,
            every format.
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: isVertical ? 'center' : 'flex-start',
              gap: px(16),
              marginTop: px(48),
            }}
          >
            {CHIPS.map((chip, i) => (
              <div
                key={chip}
                style={{
                  ...chipAt(i),
                  padding: `${px(12)}px ${px(24)}px`,
                  borderRadius: px(999),
                  border: '1px solid rgba(244,245,250,0.16)',
                  background: 'rgba(244,245,250,0.05)',
                  fontSize: px(responsive({ landscape: 22, vertical: 26 })),
                  color: INK,
                }}
              >
                {chip}
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default MotionDemo;
