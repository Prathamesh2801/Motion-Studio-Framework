import React from 'react';
import { useVideoConfig } from 'remotion';
import {
  buildTimeline,
  TransitionSeries,
  resolveTransition,
  Scene,
  Stack,
  Center,
  Split,
  Grid,
  FullBleed,
  Surface,
  Text,
  Eyebrow,
  HeroTitle,
  Description,
  SectionTitle,
  Reveal,
  useFormat,
} from '@/framework';

/**
 * Layout gallery — Phase 4 verification.
 *
 * One scene per responsive primitive so each can be inspected in every format.
 * Nothing here contains a breakpoint or an `isVertical` branch: each layout is
 * given the same content in both orientations and reflows itself.
 */
const PLAN = [
  { id: 'stack', seconds: 2.5 },
  { id: 'center', seconds: 2.5 },
  { id: 'split', seconds: 2.5 },
  { id: 'grid', seconds: 2.5 },
  { id: 'fullbleed', seconds: 2.5 },
];

export const layoutsTimeline = (fps) =>
  buildTimeline(PLAN, { fps, timebase: 'seconds', transition: 'quick' });
export const layoutsDuration = (fps) => layoutsTimeline(fps).durationInFrames;

/** A labelled cell, so the arrangement itself is what you read. */
const Block = ({ label, tall = false, delay = 0 }) => {
  const { px } = useFormat();
  return (
    <Reveal preset="settle" delay={delay}>
      <Surface
        padding={px(28)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: px(tall ? 340 : 150),
        }}
      >
        <Text variant="subtitle" motion={null}>
          {label}
        </Text>
      </Surface>
    </Reveal>
  );
};

const Caption = ({ title, note }) => (
  <Stack gap={10} fill={false}>
    <Eyebrow delay={0}>{title}</Eyebrow>
    <Description delay={4} maxWidth={900}>
      {note}
    </Description>
  </Stack>
);

const SCENES = {
  stack: () => (
    <Scene background="workshop">
      <Stack gap={{ landscape: 28, vertical: 22 }}>
        <Caption title="Stack" note="Flow container. Direction and gap are per-format data." />
        <Stack direction={{ landscape: 'row', vertical: 'column' }} gap={{ landscape: 28, vertical: 20 }}>
          <Block label="One" delay={8} />
          <Block label="Two" delay={12} />
          <Block label="Three" delay={16} />
        </Stack>
      </Stack>
    </Scene>
  ),

  center: () => (
    <Scene background="hearth">
      <Center gap={{ landscape: 24, vertical: 20 }}>
        <Eyebrow delay={2}>Center</Eyebrow>
        <HeroTitle align="center" gradient delay={8}>
          Capped measure.
        </HeroTitle>
        <Description align="center" delay={18} maxWidth={1000}>
          The measure narrows per format so a line never runs the width of an ultrawide canvas.
        </Description>
      </Center>
    </Scene>
  ),

  split: () => (
    <Scene background="studio">
      <Stack gap={{ landscape: 36, vertical: 26 }}>
        <Caption title="Split" note="Row on wide canvases, stacked on portrait and square." />
        <Split gap={{ landscape: 56, vertical: 24 }} ratio={[3, 2]}>
          <Stack gap={14}>
            <SectionTitle delay={10}>Two slots.</SectionTitle>
            <Description delay={16}>The reflow is decided once, by the layout — never by the scene.</Description>
          </Stack>
          <Block label="Media slot" tall delay={12} />
        </Split>
      </Stack>
    </Scene>
  ),

  grid: () => (
    <Scene background="workshop">
      <Stack gap={{ landscape: 32, vertical: 24 }}>
        <Caption title="Grid" note="Drops columns as the canvas narrows: 3 across, 1 down a phone." />
        <Grid gap={{ landscape: 26, vertical: 18 }}>
          {['01', '02', '03', '04', '05', '06'].map((label, i) => (
            <Block key={label} label={label} delay={8 + i * 3} />
          ))}
        </Grid>
      </Stack>
    </Scene>
  ),

  fullbleed: () => {
    const { px } = useFormat();
    return (
      <Scene background="flat" camera="static" padded={false}>
        <FullBleed
          scrim="bottom"
          anchor="bottom-left"
          media={
            <div
              style={{
                width: '100%',
                height: '100%',
                background:
                  'radial-gradient(120% 90% at 25% 20%, #4338ca 0%, #1e1b4b 45%, #08090d 100%)',
              }}
            />
          }
        >
          <Stack gap={12} fill={false} maxWidth={{ landscape: 1100, vertical: 860 }}>
            <Eyebrow delay={4}>FullBleed</Eyebrow>
            <SectionTitle delay={10} style={{ marginTop: px(4) }}>
              Edge to edge, with a scrim.
            </SectionTitle>
            <Description delay={18}>
              Type over uncontrolled imagery needs a scrim — so the layout owns it, not the scene.
            </Description>
          </Stack>
        </FullBleed>
      </Scene>
    );
  },
};

export const LayoutsDemo = () => {
  const { fps } = useVideoConfig();
  const timeline = layoutsTimeline(fps);
  const transition = resolveTransition({ type: 'fade', duration: 'quick' });

  return (
    <TransitionSeries>
      {timeline.scenes.flatMap((scene, index) => {
        const SceneComponent = SCENES[scene.id];
        const nodes = [
          <TransitionSeries.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
            <SceneComponent />
          </TransitionSeries.Sequence>,
        ];
        if (index < timeline.scenes.length - 1) {
          nodes.push(
            <TransitionSeries.Transition
              key={`${scene.id}-t`}
              presentation={transition.presentation}
              timing={transition.timing}
            />,
          );
        }
        return nodes;
      })}
    </TransitionSeries>
  );
};

export default LayoutsDemo;
