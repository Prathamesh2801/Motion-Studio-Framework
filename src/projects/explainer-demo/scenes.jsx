import React from 'react';
import {
  Scene,
  SectionHeader,
  StatRow,
  FeatureList,
  Badge,
  CTASection,
  useFormat,
  useResponsive,
} from '@/framework';

/**
 * Scenes for the explainer demo.
 *
 * Grouped in one file because these are throwaway verification scenes — Phase 4
 * introduces the scene TEMPLATE library (TitleCard, Statement, StatRow beat, …)
 * that real projects compose instead of hand-writing scenes like this.
 */

const useAlign = () => {
  const { responsive } = useResponsive();
  return responsive({ landscape: 'left', vertical: 'center' });
};

export const HookScene = () => {
  const align = useAlign();
  return (
    <Scene background="hearth" camera="push">
      <SectionHeader
        align={align}
        eyebrow="Seconds timebase"
        title={'Pacing that follows\nthe copy.'}
        description="No music, no bar grid — scene lengths are authored in plain seconds."
        gradient
        rule
        delay={4}
        maxWidth={1200}
      />
    </Scene>
  );
};

export const ProblemScene = () => {
  const align = useAlign();
  const { px } = useFormat();
  return (
    <Scene background="workshop" camera="push">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', gap: px(40), width: '100%', maxWidth: px(1300) }}>
        <Badge delay={2}>The problem</Badge>
        <SectionHeader align={align} title="One timeline, many shapes." delay={8} maxWidth={1100} />
        <FeatureList
          delay={22}
          marker="number"
          features={[
            { id: 'a', title: 'Frames', detail: 'The primitive everything compiles down to.' },
            { id: 'b', title: 'Seconds', detail: 'The default for copy-paced video.' },
            { id: 'c', title: 'Bars', detail: 'A grid-locked lattice, music optional.' },
          ]}
        />
      </div>
    </Scene>
  );
};

export const AnswerScene = () => {
  const { responsive } = useResponsive();
  return (
    <Scene background="studio" camera="push">
      <StatRow
        delay={6}
        direction={responsive({ landscape: 'row', vertical: 'column' })}
        stats={[
          { id: 'a', value: 3, label: 'Built-in timebases' },
          { id: 'b', value: 1, label: 'Engine' },
          { id: 'c', value: 0, label: 'Switch statements' },
        ]}
        style={{ width: '100%' }}
      />
    </Scene>
  );
};

export const CloseScene = () => (
  <Scene background="hearth" camera="pushIn">
    <CTASection
      align="center"
      eyebrow="Extensible"
      title="Add a timebase, not a code path."
      description="Register a strategy — or pass one inline — and the engine schedules it."
      primaryAction="Read the contract"
      delay={4}
    />
  </Scene>
);
