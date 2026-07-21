import React from 'react';
import { Scene, Center, Stack, Text, SectionHeader, stagger } from '@/framework';
import { useEditorialAlign, flexAlign } from '../internal.js';

/**
 * A chapter marker: an optional large index, then the section's heading.
 *
 * Slots: `index` ("01"), `eyebrow`, `title`, `description`. Used between acts so
 * a long film has visible structure.
 */
export const SectionIntro = ({
  index,
  eyebrow,
  title,
  description,
  align,
  background = 'workshop',
  camera = 'push',
  delay = 0,
  step = stagger.loose,
  style,
}) => {
  const resolved = useEditorialAlign(align);

  return (
    <Scene background={background} camera={camera} style={style}>
      <Center align={resolved} textAlign={resolved} maxWidth={{ landscape: 1500, vertical: 900 }}>
        <Stack gap={{ landscape: 20, vertical: 16 }} align={flexAlign(resolved)}>
          {index ? (
            <Text
              variant="stat"
              motion={{ preset: 'unmask', delay, duration: 30 }}
              style={{ opacity: 0.22 }}
            >
              {index}
            </Text>
          ) : null}
          <SectionHeader
            align={resolved}
            eyebrow={eyebrow}
            title={title}
            description={description}
            rule
            delay={delay + step}
            step={step}
          />
        </Stack>
      </Center>
    </Scene>
  );
};

export default SectionIntro;
