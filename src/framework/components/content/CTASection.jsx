import React from 'react';
import { SectionTitle } from '../typography/SectionTitle.jsx';
import { Description } from '../typography/Description.jsx';
import { CTA } from '../typography/CTA.jsx';
import { Eyebrow } from '../typography/Eyebrow.jsx';
import { useTheme } from '../../theme/index.js';
import { useFormat } from '../../hooks/useFormat.js';
import { stagger } from '../../motion/index.js';

/**
 * The ask. One primary action, at most one secondary — a video with three calls
 * to action has none.
 */
export const CTASection = ({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  contact,
  align = 'center',
  delay = 0,
  step = stagger.loose,
  style,
}) => {
  const theme = useTheme();
  const { px } = useFormat();
  const isCentered = align === 'center';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isCentered ? 'center' : 'flex-start',
        textAlign: align,
        ...style,
      }}
    >
      {eyebrow ? <Eyebrow delay={delay}>{eyebrow}</Eyebrow> : null}

      {title ? (
        <SectionTitle align={align} gradient delay={delay + step} style={{ marginTop: eyebrow ? px(theme.spacing.md) : 0 }}>
          {title}
        </SectionTitle>
      ) : null}

      {description ? (
        <Description align={align} delay={delay + step * 2} style={{ marginTop: px(theme.spacing.md) }}>
          {description}
        </Description>
      ) : null}

      {primaryAction || secondaryAction ? (
        <div
          style={{
            display: 'flex',
            gap: px(theme.spacing.md),
            marginTop: px(theme.spacing.xl),
            justifyContent: isCentered ? 'center' : 'flex-start',
          }}
        >
          {primaryAction ? (
            <CTA variant="solid" delay={delay + step * 3}>
              {primaryAction}
            </CTA>
          ) : null}
          {secondaryAction ? (
            <CTA variant="outline" delay={delay + step * 3 + stagger.base}>
              {secondaryAction}
            </CTA>
          ) : null}
        </div>
      ) : null}

      {contact ? (
        <Description align={align} color={theme.colors.text.muted} delay={delay + step * 4} style={{ marginTop: px(theme.spacing.lg) }}>
          {contact}
        </Description>
      ) : null}
    </div>
  );
};

export default CTASection;
