import React from 'react';
import { Scene, Split, Stack, Badge, SectionHeader, FeatureList, Reveal, stagger } from '@/framework';
import { useEditorialAlign, flexAlign } from '../internal.js';

/**
 * A single subject given the frame, with its supporting copy alongside.
 *
 * Slots: `badge`, `title`, `description`, `features`, `media` (node), `actions`.
 * "Product" is the common case, but nothing here assumes commerce — it is the
 * generic "show one thing and explain it" beat, equally suited to a feature, a
 * device, a diagram or a character.
 */
export const ProductShowcase = ({
  badge,
  title,
  description,
  features = [],
  media,
  actions,
  mediaFirst = false,
  align,
  background = 'studio',
  camera = 'push',
  delay = 0,
  step = stagger.loose,
  style,
}) => {
  const resolved = useEditorialAlign(align);

  const copy = (
    <Stack gap={{ landscape: 40, vertical: 32 }} align={flexAlign(resolved)}>
      {badge ? <Badge delay={delay}>{badge}</Badge> : null}
      <SectionHeader align={resolved} title={title} description={description} rule delay={delay + step} step={step} />
      {features.length > 0 ? <FeatureList features={features} marker="dot" delay={delay + step * 4} /> : null}
      {actions ? <Reveal preset="settle" delay={delay + step * 5}>{actions}</Reveal> : null}
    </Stack>
  );

  const subject = (
    <Reveal preset="hero" delay={delay}>
      {media}
    </Reveal>
  );

  return (
    <Scene background={background} camera={camera} style={style}>
      <Split gap={{ landscape: 96, vertical: 56 }} ratio={[1, 1]} reverseWhenStacked={!mediaFirst}>
        {mediaFirst ? subject : copy}
        {mediaFirst ? copy : subject}
      </Split>
    </Scene>
  );
};

export default ProductShowcase;
