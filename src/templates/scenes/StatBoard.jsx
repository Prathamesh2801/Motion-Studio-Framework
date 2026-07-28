import React from 'react';
import {
  Scene,
  Stack,
  Grid,
  Surface,
  Reveal,
  SectionHeader,
  CountUp,
  ProgressBar,
  Caption,
  Text,
  useTheme,
  useFormat,
  stagger,
  durations,
} from '@/framework';

/**
 * The numbers, as a board.
 *
 * Slots: `metrics` — the ViewModel array, straight through. `eyebrow`/`title`
 * are strings the pack composed; this scene never reads a domain field.
 *
 * ── COUNTER OR BAR IS A DATA DECISION ───────────────────────────────────────
 * A metric with a `max` renders a bar under its number, one without renders the
 * number alone. That is a branch on the SHAPE of a metric, never on which metric
 * it is — a rating out of 10 is meaningless without its ceiling, and a goal
 * tally has no ceiling to draw. Any pack gets this for free by setting `max`.
 *
 * The tiles stagger rather than appearing together, because a board of six
 * numbers landing at once has no reading order and the eye picks one at random.
 */
export const StatBoard = ({
  metrics = [],
  eyebrow,
  title,
  columns,
  background = 'studio',
  camera = 'push',
  delay = 0,
  step = stagger.loose,
  style,
}) => {
  const theme = useTheme();
  const { px } = useFormat();

  return (
    <Scene background={background} camera={camera} style={style}>
      <Stack gap={{ landscape: 56, vertical: 40 }}>
        {title || eyebrow ? (
          <SectionHeader eyebrow={eyebrow} title={title} rule delay={delay} step={step} />
        ) : null}

        {/* Undefined by default on purpose — Grid owns the per-bucket columns. */}
        <Grid columns={columns}>
          {metrics.map((metric, index) => {
            const at = delay + step * 3 + index * step;
            return (
              // `Surface` is chrome only — it has no motion of its own, so the
              // tile is wrapped rather than handed a `delay` it would ignore.
              // Without this the whole board lands at once and the stagger the
              // rest of this scene is built around silently does nothing.
              <Reveal key={metric.id} preset="rise" delay={at}>
                <Surface padding={theme.spacing.lg} style={{ height: '100%' }}>
                  <Stack gap={{ landscape: 10, vertical: 8 }}>
                    <CountUp
                      value={metric.value}
                      display={metric.display}
                      // `decimal` is a data-level intent ("show one place"); the
                      // renderer only knows plain/separated/compact.
                      format={metric.format === 'decimal' ? 'plain' : metric.format}
                      decimals={metric.decimals}
                      prefix={metric.prefix}
                      suffix={metric.suffix}
                      delay={at}
                      duration={durations.slower}
                    />

                    <Caption color={theme.colors.text.muted} uppercase delay={at}>
                      {metric.label}
                    </Caption>

                    {metric.max !== undefined ? (
                      <Stack gap={6} style={{ marginTop: px(theme.spacing.xs) }}>
                        <ProgressBar
                          value={metric.value}
                          max={metric.max}
                          thickness={6}
                          delay={at}
                          duration={durations.slower}
                        />
                        <Text
                          variant="caption"
                          color={theme.colors.text.muted}
                          align="right"
                          motion={{ preset: 'fade', delay: at }}
                        >
                          {`/ ${metric.max}`}
                        </Text>
                      </Stack>
                    ) : null}
                  </Stack>
                </Surface>
              </Reveal>
            );
          })}
        </Grid>
      </Stack>
    </Scene>
  );
};

export default StatBoard;
