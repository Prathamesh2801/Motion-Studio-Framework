import React from 'react';
import { Scene, Outro } from '@/framework';

/**
 * The closing card: mark, name, one line of positioning, contact.
 *
 * Slots: `brandName`, `logo` (node), `tagline`, `cta`, `website`. Every slot is
 * optional, so the same template covers a hard end-card and a soft sign-off.
 *
 * The camera is deliberately quiet here — after a film of movement, stillness is
 * the strongest available full stop.
 */
export const OutroScene = ({
  brandName,
  logo,
  tagline,
  cta,
  ctaVariant = 'outline',
  website,
  background = 'hearth',
  camera = 'static',
  delay = 0,
  style,
}) => (
  <Scene background={background} camera={camera} style={style}>
    <Outro
      brandName={brandName}
      logo={logo}
      tagline={tagline}
      cta={cta}
      ctaVariant={ctaVariant}
      website={website}
      delay={delay}
    />
  </Scene>
);

export default OutroScene;
