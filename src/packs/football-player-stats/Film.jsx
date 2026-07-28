import React from 'react';
import { useVideoConfig } from 'remotion';
import { StandardFilm, SubjectIntro, StatBoard, MetricSpotlight, OutroScene } from '@/templates';
import { heroMetric, emptyViewModel } from '@/engine';
import { buildPackTimeline } from './timeline.js';

/**
 * The football film — a pure function of a ViewModel.
 *
 * Read what is NOT here: no player name, no club, no number, no colour, no
 * frame offset, no `if (isVertical)`. Every visible value arrives in `vm`, every
 * position comes from the timeline, and every colour comes from the theme the
 * host wrapped this in. Swapping `messi.json` for `haaland.json` changes the
 * portrait, the name, the number, the crest, the flag, the league mark, the five
 * figures, the season, the competition AND the accent colour — without this file
 * being touched.
 *
 * It is also host-agnostic. `<Composition>` mounts it to render an MP4;
 * `<Player>` mounts it to drive the live website. It cannot tell which, and
 * there is exactly one of it.
 *
 * @param {object} props.vm    A normalised ViewModel (see engine/viewmodel.js).
 * @param {number} props.pace  Timeline multiplier from the document's `timing`.
 */
export const Film = ({ vm = emptyViewModel(), pace = 1 }) => {
  const { fps } = useVideoConfig();
  const timeline = buildPackTimeline(vm, fps, pace);
  const hero = heroMetric(vm);

  // The context strip is composed here rather than in a scene: joining "2024/25"
  // and "UEFA Champions League" into one line is a presentation decision, and
  // scenes take strings so they never learn what a season is.
  const contextLine = vm.context.map((item) => item.value).join(' · ');

  const scenes = {
    intro: <SubjectIntro subject={vm.subject} chips={vm.identity} />,

    board: (
      <StatBoard
        metrics={vm.metrics}
        eyebrow={contextLine}
        title={vm.subject.shortName ?? vm.subject.name}
      />
    ),

    // Only ever mounted when the timeline scheduled it, which only happens when
    // a metric declared `emphasis: 'hero'` — so `hero` cannot be null here.
    spotlight: hero ? (
      <MetricSpotlight
        metric={hero}
        caption={vm.subject.shortName ?? vm.subject.name}
        footnote={contextLine}
      />
    ) : null,

    signoff: (
      <OutroScene
        brandName={vm.subject.name}
        tagline={vm.subject.role}
        website={contextLine}
      />
    ),
  };

  return <StandardFilm timeline={timeline} transition="fade" scenes={scenes} />;
};

export default Film;
