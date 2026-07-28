import React from 'react';
import {
  Scene,
  Center,
  Stack,
  Eyebrow,
  Caption,
  Text,
  CountUp,
  RatingArc,
  ProgressBar,
  SplitText,
  useTheme,
  stagger,
  durations,
} from '@/framework';

/**
 * One metric, given the whole frame.
 *
 * Slots: `metric` (a single ViewModel metric) plus `caption`/`footnote` strings
 * the pack composed. The scene never asks what the metric measures.
 *
 * ── THE ONE BRANCH, AND WHY IT IS ALLOWED ───────────────────────────────────
 * A bounded metric draws an arc; an unbounded one draws a number over a rule.
 * That reads like a conditional on content — which the architecture forbids —
 * but it is a branch on the SHAPE of the metric (`max` present or not), never on
 * which metric it is. A tally has no ceiling, so the alternative is inventing
 * one, and an invented denominator is a lie the frame tells confidently.
 */
export const MetricSpotlight = ({
  metric,
  caption,
  footnote,
  background = 'hearth',
  camera = 'pushIn',
  delay = 0,
  step = stagger.loose,
  style,
}) => {
  const theme = useTheme();
  if (!metric) return null;

  const bounded = metric.max !== undefined;

  const number = (
    <CountUp
      value={metric.value}
      display={metric.display}
      format={metric.format === 'decimal' ? 'plain' : metric.format}
      decimals={metric.decimals}
      prefix={metric.prefix}
      suffix={metric.suffix}
      align="center"
      delay={delay + step}
      duration={durations.cinematic}
      // Inside the arc the number shares the frame with the ring, so it steps
      // down a level; alone it is the whole shot.
      variant={bounded ? 'sectionTitle' : 'hero'}
    />
  );

  return (
    <Scene background={background} camera={camera} style={style}>
      <Center gap={{ landscape: 32, vertical: 24 }}>
        <Stack gap={{ landscape: 26, vertical: 20 }} align="center">
          <Eyebrow delay={delay}>{metric.label}</Eyebrow>

          {bounded ? (
            <RatingArc
              value={metric.value}
              max={metric.max}
              size={340}
              delay={delay + step}
              duration={durations.cinematic}
            >
              {number}
              <Caption color={theme.colors.text.muted}>{`of ${metric.max}`}</Caption>
            </RatingArc>
          ) : (
            <>
              {number}
              <ProgressBar
                value={1}
                max={1}
                thickness={6}
                style={{ maxWidth: 460 }}
                delay={delay + step * 2}
                duration={durations.slow}
              />
            </>
          )}

          {caption ? (
            <SplitText variant="subtitle" align="center" by="word" delay={delay + step * 3}>
              {caption}
            </SplitText>
          ) : null}

          {footnote ? (
            <Text
              variant="caption"
              color={theme.colors.text.muted}
              align="center"
              uppercase
              motion={{ preset: 'fade', delay: delay + step * 4 }}
            >
              {footnote}
            </Text>
          ) : null}
        </Stack>
      </Center>
    </Scene>
  );
};

export default MetricSpotlight;
