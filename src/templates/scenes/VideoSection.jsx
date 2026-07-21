import React from 'react';
import { Scene, FullBleed, Stack, Eyebrow, SectionTitle, Description, stagger } from '@/framework';
import { flexAlign } from '../internal.js';

/**
 * Edge-to-edge footage or imagery with copy anchored over it.
 *
 * Slots: `media` (node — a `<Video>`, `<Img>` or `MediaFrame`), `eyebrow`,
 * `title`, `caption`. The scrim is handled by the layout, because type over
 * uncontrolled footage is illegible without one and that is not a decision each
 * scene should re-make.
 *
 * `Scene` runs unpadded here: the media must reach the frame edge, and
 * `FullBleed` applies the safe area to the copy instead.
 */
export const VideoSection = ({
  media,
  eyebrow,
  title,
  caption,
  anchor = 'bottom-left',
  scrim = 'bottom',
  background = 'flat',
  camera = 'static',
  delay = 0,
  step = stagger.loose,
  style,
}) => {
  const align = anchor.includes('right') ? 'right' : anchor === 'center' || anchor === 'bottom' || anchor === 'top' ? 'center' : 'left';

  return (
    <Scene background={background} camera={camera} padded={false} style={style}>
      <FullBleed media={media} scrim={scrim} anchor={anchor}>
        <Stack gap={{ landscape: 16, vertical: 14 }} align={flexAlign(align)} maxWidth={{ landscape: 1200, vertical: 900 }} fill={false}>
          {eyebrow ? <Eyebrow delay={delay}>{eyebrow}</Eyebrow> : null}
          {title ? (
            <SectionTitle align={align} delay={delay + step}>
              {title}
            </SectionTitle>
          ) : null}
          {caption ? (
            <Description align={align} delay={delay + step * 2}>
              {caption}
            </Description>
          ) : null}
        </Stack>
      </FullBleed>
    </Scene>
  );
};

export default VideoSection;
