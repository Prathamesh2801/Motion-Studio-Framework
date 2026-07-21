import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * Phase 0 smoke-test composition.
 *
 * Deliberately self-contained — it reaches for nothing in `framework/` and hard-
 * codes its own values rather than depending on the theme — so it proves the
 * bundler, entry point and `@/` alias work before any framework or design code
 * exists. It is replaced by a real, theme-driven demo project in Phase 5.
 *
 * (It does NOT rely on the Tailwind `@theme` mirror: Tailwind v4 only emits the
 * theme variables that a utility class actually references, so raw `var(--ms-*)`
 * lookups tree-shake away. The framework's colour is JS-authoritative anyway;
 * the mirror is wired up properly via codegen in Phase 5.)
 */
const INK = '#f4f5fa';
const CANVAS = '#08090d';
const ACCENT = '#6366f1';

export const Hello = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 20, durationInFrames - 20, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const rise = interpolate(frame, [0, 24], [24, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: CANVAS,
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${rise}px)`,
          textAlign: 'center',
          color: INK,
        }}
      >
        <div
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: width * 0.011,
            letterSpacing: '0.34em',
            textTransform: 'uppercase',
            color: ACCENT,
            marginBottom: width * 0.014,
          }}
        >
          Motion Studio Framework
        </div>
        <div style={{ fontSize: width * 0.05, fontWeight: 700, lineHeight: 1.05 }}>
          Scaffold online.
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Hello;
