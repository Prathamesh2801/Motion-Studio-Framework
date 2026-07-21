import React from 'react';
import { Scene, Center, Stack, Eyebrow, HeroTitle, Subtitle, Divider, stagger } from '@/framework';

/**
 * A pure title card — the film's name, a chapter head, or a hard statement.
 *
 * Slots: `kicker`, `title`, `subtitle`. Deliberately sparse: one idea per card.
 */
export const TitleScene = ({
  kicker,
  title,
  subtitle,
  rule = true,
  background = 'hearth',
  camera = 'pushIn',
  delay = 0,
  step = stagger.loose,
  style,
}) => (
  <Scene background={background} camera={camera} style={style}>
    <Center gap={{ landscape: 28, vertical: 24 }}>
      <Stack gap={{ landscape: 28, vertical: 24 }} align="center">
        {kicker ? <Eyebrow delay={delay}>{kicker}</Eyebrow> : null}
        {title ? (
          <HeroTitle align="center" gradient delay={delay + step}>
            {title}
          </HeroTitle>
        ) : null}
        {rule ? <Divider width="38%" origin="center" fade={false} delay={delay + step * 2} style={{ opacity: 0.5 }} /> : null}
        {subtitle ? (
          <Subtitle align="center" maxWidth={1000} delay={delay + step * 3}>
            {subtitle}
          </Subtitle>
        ) : null}
      </Stack>
    </Center>
  </Scene>
);

export default TitleScene;
