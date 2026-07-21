import React from 'react';
import { Scene, Stack, Grid, SectionHeader, StatCard, stagger } from '@/framework';
import { useEditorialAlign, flexAlign } from '../internal.js';

/**
 * Proof, as counted numbers.
 *
 * Slots: `eyebrow`, `title`, `stats` (`{ value, label, prefix, suffix, format }`).
 * The grid drops to fewer columns as the canvas narrows, so the same stats read
 * on a banner and on a phone. Each figure counts up — motion applied to meaning
 * rather than decoration.
 */
export const StatisticsScene = ({
  eyebrow,
  title,
  description,
  stats = [],
  columns,
  bare = false,
  align,
  background = 'studio',
  camera = 'push',
  delay = 0,
  step = stagger.loose,
  style,
}) => {
  const resolved = useEditorialAlign(align);

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

        {/* Undefined on purpose — Grid owns the default column counts. */}
        <Grid columns={columns}>
          {stats.map((stat, index) => (
            <StatCard
              key={stat.id ?? stat.label}
              {...stat}
              bare={bare}
              delay={delay + step * 3 + index * step}
            />
          ))}
        </Grid>
      </Stack>
    </Scene>
  );
};

export default StatisticsScene;
