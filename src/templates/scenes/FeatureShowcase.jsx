import React from 'react';
import { Scene, Split, Stack, SectionHeader, FeatureList, Reveal, stagger } from '@/framework';
import { useEditorialAlign, flexAlign } from '../internal.js';

/**
 * A heading plus a list of features, optionally beside a media slot.
 *
 * Slots: `eyebrow`, `title`, `description`, `features` (strings or
 * `{ title, detail, icon }`), `media` (node). The workhorse "here is what it
 * does" beat.
 */
export const FeatureShowcase = ({
  eyebrow,
  title,
  description,
  features = [],
  media,
  marker = 'number',
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
    <Stack gap={{ landscape: 48, vertical: 40 }} align={flexAlign(resolved)}>
      <SectionHeader
        align={resolved}
        eyebrow={eyebrow}
        title={title}
        description={description}
        rule
        delay={delay}
        step={step}
      />
      <FeatureList features={features} marker={marker} delay={delay + step * 3} />
    </Stack>
  );

  if (!media) {
    return (
      <Scene background={background} camera={camera} style={style}>
        {copy}
      </Scene>
    );
  }

  const mediaSlot = (
    <Reveal preset="depth" delay={delay + step}>
      {media}
    </Reveal>
  );

  return (
    <Scene background={background} camera={camera} style={style}>
      <Split gap={{ landscape: 96, vertical: 56 }} reverseWhenStacked={mediaFirst}>
        {mediaFirst ? mediaSlot : copy}
        {mediaFirst ? copy : mediaSlot}
      </Split>
    </Scene>
  );
};

export default FeatureShowcase;
