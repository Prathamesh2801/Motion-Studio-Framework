import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Scene, Text, useFormat, useTheme, useMotion } from '@/framework';

/**
 * The frame every showcase chapter sits in.
 *
 * Its one job is ATTRIBUTION. This film exists to fail loudly when a subsystem
 * regresses, and a still is only useful if it says which subsystem it was
 * testing — otherwise "chapter 6 looks wrong" means opening every module in the
 * framework. The corner slug (`06 · LAYOUTS`) means a rendered PNG identifies
 * its own scope without needing the timeline next to it.
 *
 * The format readout on the right is here for the same reason: layouts reflow
 * per bucket, so a still that does not name its bucket is ambiguous evidence.
 */
export const Chapter = ({ index, subsystem, validates, children, background = 'studio', camera = 'push' }) => {
  const { format, bucket } = useFormat();
  const theme = useTheme();
  const { px } = useFormat();

  const label = useMotion({ preset: 'fade', duration: 14 });

  return (
    <Scene background={background} camera={camera} justify="center">
      {children}

      {/* Chapter slug — deliberately outside the content flow, in the safe margin. */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            top: px(48),
            left: px(56),
            right: px(56),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: px(24),
            ...label,
          }}
        >
          <Text
            variant="eyebrow"
            motion={null}
            style={{ color: theme.colors.primarySoft ?? theme.colors.primary }}
          >
            {String(index).padStart(2, '0')} · {subsystem}
          </Text>

          <Text
            variant="eyebrow"
            motion={null}
            style={{ color: theme.colors.text.muted, textAlign: 'right' }}
          >
            {format.id} · {bucket} · {format.width}×{format.height}
          </Text>
        </div>

        {validates ? (
          <div
            style={{
              position: 'absolute',
              bottom: px(48),
              left: px(56),
              right: px(56),
              ...label,
            }}
          >
            <Text
              variant="caption"
              motion={null}
              style={{ color: theme.colors.text.muted, fontSize: px(18) }}
            >
              {validates}
            </Text>
          </div>
        ) : null}
      </AbsoluteFill>
    </Scene>
  );
};

export default Chapter;
