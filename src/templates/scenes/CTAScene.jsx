import React from 'react';
import { Scene, Center, CTASection, stagger } from '@/framework';

/**
 * The ask.
 *
 * Slots: `eyebrow`, `title`, `description`, `primaryAction`, `secondaryAction`,
 * `contact`. One primary action, at most one secondary — a video with three
 * calls to action has none.
 */
export const CTAScene = ({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  contact,
  align = 'center',
  background = 'hearth',
  camera = 'pushIn',
  delay = 0,
  step = stagger.loose,
  style,
}) => (
  <Scene background={background} camera={camera} style={style}>
    <Center textAlign={align}>
      <CTASection
        align={align}
        eyebrow={eyebrow}
        title={title}
        description={description}
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        contact={contact}
        delay={delay}
        step={step}
      />
    </Center>
  </Scene>
);

export default CTAScene;
