import React from 'react';
import { AbsoluteFill } from 'remotion';
import { LogoMark } from './LogoMark.jsx';
import { Text } from '../typography/Text.jsx';
import { Subtitle } from '../typography/Subtitle.jsx';
import { CTA } from '../typography/CTA.jsx';
import { Divider } from '../primitives/Divider.jsx';
import { useTheme } from '../../theme/index.js';
import { useFormat } from '../../hooks/useFormat.js';
import { useMotion } from '../../hooks/useMotion.js';
import { durations } from '../../motion/index.js';

/**
 * The closing card: mark, brand name, one line of positioning, and the
 * contact/CTA. Everything is optional so the same component covers a hard
 * end-card and a soft sign-off. Fully generic — the brand name/logo are props.
 */
export const Outro = ({ brandName = 'Studio', logo, tagline, cta, ctaVariant = 'outline', website, delay = 0, style }) => {
  const theme = useTheme();
  const { px } = useFormat();
  const markMotion = useMotion({ preset: 'settle', delay, duration: durations.slow });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', ...style }}>
      <div style={markMotion}>{logo ?? <LogoMark size={px(112)} />}</div>

      <Text
        variant="sectionTitle"
        align="center"
        gradient={theme.colors.gradients.text}
        style={{ marginTop: px(theme.spacing.lg) }}
        motion={{ preset: 'unmask', delay: delay + 8, duration: durations.slow }}
      >
        {brandName}
      </Text>

      {tagline ? (
        <Subtitle align="center" maxWidth={900} delay={delay + 16} style={{ marginTop: px(theme.spacing.sm) }}>
          {tagline}
        </Subtitle>
      ) : null}

      <Divider width={px(280)} delay={delay + 22} origin="center" fade={false} style={{ marginTop: px(theme.spacing.xl), opacity: 0.4 }} />

      {cta ? (
        <div style={{ marginTop: px(theme.spacing.xl) }}>
          <CTA variant={ctaVariant} delay={delay + 28}>
            {cta}
          </CTA>
        </div>
      ) : null}

      {website ? (
        <Text
          variant="eyebrow"
          color={theme.colors.text.muted}
          align="center"
          style={{ marginTop: px(theme.spacing.lg) }}
          motion={{ preset: 'fade', delay: delay + 36, duration: durations.base }}
        >
          {website}
        </Text>
      ) : null}
    </AbsoluteFill>
  );
};

export default Outro;
