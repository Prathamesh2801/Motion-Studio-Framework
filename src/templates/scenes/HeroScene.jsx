import React from 'react';
import { Scene, Split, Center, Stack, SectionHeader, Reveal, stagger } from '@/framework';
import { useEditorialAlign, flexAlign } from '../internal.js';

/**
 * The opening statement of a film.
 *
 * Slots: `eyebrow`, `title`, `description`, `actions` (node), `media` (node).
 * With `media` it becomes a split; without, a centred measure. One per video.
 *
 *   <HeroScene eyebrow="2026" title="From idea to reality." actions={<CTA>Start</CTA>} />
 */
export const HeroScene = ({
  eyebrow,
  title,
  description,
  actions,
  media,
  align,
  background = 'hearth',
  camera = 'push',
  delay = 0,
  step = stagger.loose,
  style,
}) => {
  const resolved = useEditorialAlign(align);

  const content = (
    <Stack gap={{ landscape: 48, vertical: 40 }} align={flexAlign(resolved)}>
      <SectionHeader
        align={resolved}
        eyebrow={eyebrow}
        title={title}
        description={description}
        gradient
        rule
        delay={delay}
        step={step}
      />
      {actions ? (
        <Reveal preset="settle" delay={delay + step * 4}>
          {actions}
        </Reveal>
      ) : null}
    </Stack>
  );

  return (
    <Scene background={background} camera={camera} style={style}>
      {media ? (
        <Split gap={{ landscape: 96, vertical: 56 }} ratio={[3, 2]}>
          {content}
          <Reveal preset="depth" delay={delay + step}>
            {media}
          </Reveal>
        </Split>
      ) : (
        <Center align={resolved} textAlign={resolved}>
          {content}
        </Center>
      )}
    </Scene>
  );
};

export default HeroScene;
