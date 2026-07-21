import React from 'react';
import { Stagger } from '../primitives/Stagger.jsx';
import { Text } from '../typography/Text.jsx';
import { useTheme } from '../../theme/index.js';
import { useFormat } from '../../hooks/useFormat.js';
import { stagger as staggerTokens } from '../../motion/index.js';
import { alpha } from '../../helpers/color.js';
import { pad } from '../../helpers/format.js';

/**
 * A single feature row. Exported so scenes can place one on its own. `marker`
 * picks the leading element: a numbered chip, a dot, or a caller-supplied icon.
 */
export const FeatureItem = ({ feature, index = 0, marker = 'number', accent }) => {
  const theme = useTheme();
  const { px } = useFormat();
  const accentColor = accent ?? theme.colors.primary;
  const label = typeof feature === 'string' ? feature : feature.title;
  const detail = typeof feature === 'string' ? null : feature.detail;

  const markers = {
    number: (
      <div
        style={{
          minWidth: px(52),
          height: px(52),
          borderRadius: theme.radii.sm,
          background: alpha(accentColor, 0.14),
          boxShadow: `inset 0 0 0 1px ${alpha(accentColor, 0.3)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text variant="eyebrow" color={accentColor} motion={null}>
          {pad(index + 1)}
        </Text>
      </div>
    ),
    dot: (
      <div
        style={{
          width: px(12),
          height: px(12),
          marginTop: px(14),
          borderRadius: theme.radii.circle,
          background: accentColor,
          boxShadow: `0 0 ${px(24)}px ${alpha(accentColor, 0.8)}`,
        }}
      />
    ),
    icon: typeof feature === 'object' ? (feature.icon ?? null) : null,
    none: null,
  };

  return (
    <div style={{ display: 'flex', gap: px(theme.spacing.md), alignItems: 'flex-start' }}>
      {markers[marker] ?? null}
      <div>
        <Text variant="subtitle" motion={null}>
          {label}
        </Text>
        {detail ? (
          <Text variant="description" color={theme.colors.text.muted} motion={null} style={{ marginTop: px(theme.spacing.xxs) }}>
            {detail}
          </Text>
        ) : null}
      </div>
    </div>
  );
};

/**
 * Feature bullets that animate in sequence. Accepts strings or
 * `{ title, detail, icon }` objects, so simple lists stay simple and richer ones
 * are possible without a second component.
 */
export const FeatureList = ({ features = [], marker = 'number', accent, delay = 0, step = staggerTokens.loose, gap, direction = 'column', preset = 'rise', style }) => {
  const theme = useTheme();
  return (
    <Stagger preset={preset} delay={delay} step={step} gap={gap ?? theme.spacing.lg} direction={direction} style={style}>
      {features.map((feature, index) => (
        <FeatureItem
          key={typeof feature === 'string' ? feature : (feature.id ?? feature.title)}
          feature={feature}
          index={index}
          marker={marker}
          accent={accent}
        />
      ))}
    </Stagger>
  );
};

export default FeatureList;
