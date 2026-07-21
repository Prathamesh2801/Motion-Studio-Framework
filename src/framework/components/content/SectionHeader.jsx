import React from 'react';
import { Eyebrow } from '../typography/Eyebrow.jsx';
import { SectionTitle } from '../typography/SectionTitle.jsx';
import { Description } from '../typography/Description.jsx';
import { Divider } from '../primitives/Divider.jsx';
import { useTheme } from '../../theme/index.js';
import { useFormat } from '../../hooks/useFormat.js';
import { stagger } from '../../motion/index.js';

/**
 * Eyebrow + title + description, with the internal timing already tuned. Every
 * scene that introduces a topic uses this, which is what keeps pacing consistent
 * from video to video.
 */
export const SectionHeader = ({
  eyebrow,
  title,
  description,
  align = 'left',
  gradient = false,
  rule = false,
  delay = 0,
  step = stagger.loose,
  maxWidth,
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
        maxWidth: maxWidth === undefined ? undefined : px(maxWidth),
        ...style,
      }}
    >
      {eyebrow ? <Eyebrow delay={delay}>{eyebrow}</Eyebrow> : null}

      {title ? (
        <SectionTitle
          align={align}
          gradient={gradient}
          delay={delay + step}
          style={{ marginTop: eyebrow ? px(theme.spacing.md) : 0 }}
        >
          {title}
        </SectionTitle>
      ) : null}

      {rule ? (
        <Divider
          width={px(160)}
          delay={delay + step * 2}
          origin={isCentered ? 'center' : 'left'}
          fade={!isCentered}
          style={{ marginTop: px(theme.spacing.md) }}
        />
      ) : null}

      {description ? (
        <Description align={align} delay={delay + step * 2} style={{ marginTop: px(theme.spacing.md) }}>
          {description}
        </Description>
      ) : null}
    </div>
  );
};

export default SectionHeader;
