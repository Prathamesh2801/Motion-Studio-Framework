import React from 'react';
import { Scene, Stack, Grid, SectionHeader, MediaFrame, Text, Reveal, stagger } from '@/framework';
import { useEditorialAlign, flexAlign } from '../internal.js';

/**
 * A set of images shown together.
 *
 * Slots: `eyebrow`, `title`, `items` (`{ src, alt, caption }`). The grid drops
 * columns per format; each tile enters on a stagger so the set reads as one
 * gesture rather than a slideshow.
 */
export const GalleryScene = ({
  eyebrow,
  title,
  description,
  items = [],
  columns,
  aspectRatio = 4 / 3,
  align,
  background = 'studio',
  camera = 'push',
  delay = 0,
  step = stagger.base,
  style,
}) => {
  const resolved = useEditorialAlign(align);

  return (
    <Scene background={background} camera={camera} style={style}>
      <Stack gap={{ landscape: 56, vertical: 44 }} align={flexAlign(resolved)}>
        {title || eyebrow ? (
          <SectionHeader
            align={resolved}
            eyebrow={eyebrow}
            title={title}
            description={description}
            delay={delay}
            step={stagger.loose}
          />
        ) : null}

        {/* No `columns` fallback here on purpose: re-inlining Grid's own default
            would mean Grid could never change it. Undefined lets Grid decide. */}
        <Grid columns={columns}>
          {items.map((item, index) => (
            <Stack key={item.id ?? item.src} gap={12}>
              <MediaFrame
                src={item.src}
                alt={item.alt}
                preset="settle"
                delay={delay + step * 4 + index * step}
                kenBurns={0.05}
                style={{ width: '100%', aspectRatio: String(aspectRatio) }}
              />
              {item.caption ? (
                <Reveal preset="fade" delay={delay + step * 5 + index * step}>
                  <Text variant="caption" motion={null} style={{ opacity: 0.66 }}>
                    {item.caption}
                  </Text>
                </Reveal>
              ) : null}
            </Stack>
          ))}
        </Grid>
      </Stack>
    </Scene>
  );
};

export default GalleryScene;
