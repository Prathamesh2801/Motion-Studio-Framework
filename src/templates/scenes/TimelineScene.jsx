import React from 'react';
import {
  Scene,
  Stack,
  Grid,
  Surface,
  SectionHeader,
  Text,
  Divider,
  Reveal,
  useFormat,
  useResponsive,
  stagger,
} from '@/framework';
import { useEditorialAlign, flexAlign } from '../internal.js';

/**
 * An ordered sequence of moments — a roadmap, a process, a history.
 *
 * Slots: `eyebrow`, `title`, `items` (`{ label, title, detail }`), where `label`
 * is the marker (a year, a step number, a phase).
 *
 * Reflows by ORIENTATION rather than just size: a horizontal track reads well
 * across a wide canvas, while a phone wants the same moments stacked as a
 * vertical run. Both are the same data.
 */
export const TimelineScene = ({
  eyebrow,
  title,
  description,
  items = [],
  orientation,
  align,
  background = 'workshop',
  camera = 'push',
  delay = 0,
  step = stagger.loose,
  style,
}) => {
  const resolved = useEditorialAlign(align);
  const { px } = useFormat();
  const { responsive } = useResponsive();
  const flow = responsive(orientation) ?? responsive({ landscape: 'horizontal', vertical: 'vertical' });
  const isHorizontal = flow === 'horizontal';

  const entries = items.map((item, index) => (
    <Reveal key={item.id ?? item.label} preset="rise" delay={delay + step * 3 + index * step}>
      <Surface padding={px(0)} background="transparent" elevation="none" bordered={false} style={{ boxShadow: 'none' }}>
        <Stack gap={{ landscape: 14, vertical: 12 }}>
          <Text variant="eyebrow" motion={null}>
            {item.label}
          </Text>
          {/* The connector: a drawn rule that reads as the track itself. */}
          <Divider width={isHorizontal ? '100%' : px(160)} thickness={2} fade={false} delay={delay + step * 3 + index * step} style={{ opacity: 0.45 }} />
          <Text variant="cardTitle" motion={null}>
            {item.title}
          </Text>
          {item.detail ? (
            <Text variant="description" motion={null} style={{ opacity: 0.72 }}>
              {item.detail}
            </Text>
          ) : null}
        </Stack>
      </Surface>
    </Reveal>
  ));

  return (
    <Scene background={background} camera={camera} style={style}>
      <Stack gap={{ landscape: 64, vertical: 48 }} align={flexAlign(resolved)}>
        {title || eyebrow ? (
          <SectionHeader
            align={resolved}
            eyebrow={eyebrow}
            title={title}
            description={description}
            rule
            delay={delay}
            step={step}
          />
        ) : null}

        {isHorizontal ? (
          <Grid columns={Math.min(items.length, 4)} gap={40}>
            {entries}
          </Grid>
        ) : (
          <Stack gap={36}>{entries}</Stack>
        )}
      </Stack>
    </Scene>
  );
};

export default TimelineScene;
