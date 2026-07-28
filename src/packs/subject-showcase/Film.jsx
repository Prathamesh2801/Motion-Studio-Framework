import React from 'react';
import { useVideoConfig } from 'remotion';
import {
  StandardFilm,
  TitleScene,
  StatisticsScene,
  MetricSpotlight,
  OutroScene,
} from '@/templates';
import { heroMetric, emptyViewModel } from '@/engine';
import { buildPackTimeline } from './timeline.js';

/**
 * The film — a pure function of a ViewModel.
 *
 * Note what is NOT here: no names, no numbers, no labels, no colours, no frame
 * offsets, no `if (isVertical)`. Every visible value arrives in `vm`; every
 * position comes from the timeline; every colour comes from the theme the host
 * wrapped this in. That is the whole claim of the subsystem, and this file is
 * where it is either true or not.
 *
 * It is also host-agnostic. `<Composition>` mounts it to render an MP4 and
 * `<Player>` mounts it to drive the editor preview; it cannot tell which, and
 * there is exactly one of it.
 *
 * @param {object} props.vm    A normalised ViewModel (see engine/viewmodel.js).
 * @param {number} props.pace  Timeline multiplier from the document's `timing`.
 */
export const Film = ({ vm = emptyViewModel(), pace = 1 }) => {
  const { fps } = useVideoConfig();
  const timeline = buildPackTimeline(vm, fps, pace);
  const hero = heroMetric(vm);

  // Scenes read slices of the ViewModel. The mapping from a Metric to a
  // StatCard's props is deliberately mechanical — the moment it needs a
  // condition on a specific metric, the decision has escaped the data.
  const asStat = (metric) => ({
    id: metric.id,
    label: metric.label,
    value: metric.value,
    prefix: metric.prefix,
    suffix: metric.suffix,
    format: metric.format === 'decimal' ? 'plain' : metric.format,
    decimals: metric.decimals,
  });

  const scenes = {
    intro: (
      <TitleScene
        kicker={[vm.subject.role, ...vm.identity.map((chip) => chip.value)]
          .filter(Boolean)
          .join(' · ')}
        title={vm.subject.name}
        subtitle={vm.subject.secondaryName}
      />
    ),

    figures: (
      <StatisticsScene
        eyebrow={vm.context.map((item) => item.value).join(' · ')}
        title={vm.subject.shortName ?? vm.subject.name}
        stats={vm.metrics.map(asStat)}
      />
    ),

    // Only ever mounted when the timeline scheduled it, which only happens when
    // a metric declared `emphasis: 'hero'` — so `hero` cannot be null here.
    spotlight: hero ? (
      <MetricSpotlight metric={hero} caption={vm.subject.shortName ?? vm.subject.name} />
    ) : null,

    outro: (
      <OutroScene
        brandName={vm.subject.name}
        tagline={vm.subject.secondaryName}
        website={vm.context.at(-1)?.value}
      />
    ),
  };

  return <StandardFilm timeline={timeline} transition="fade" scenes={scenes} />;
};

export default Film;
