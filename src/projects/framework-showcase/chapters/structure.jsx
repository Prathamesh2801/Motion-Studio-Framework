import React from 'react';
import { Sequence, useVideoConfig } from 'remotion';
import {
  Stack,
  Grid,
  Split,
  Center,
  FullBleed,
  Text,
  Caption,
  Eyebrow,
  useFormat,
  useTheme,
  useResponsive,
} from '@/framework';
import {
  TitleScene,
  HeroScene,
  SectionIntro,
  FeatureShowcase,
  StatisticsScene,
  TimelineScene,
  QuoteScene,
  GalleryScene,
  ProductShowcase,
  VideoSection,
  CTAScene,
  OutroScene,
} from '@/templates';
import { Chapter } from '../Chapter.jsx';
import { swatch, LOREM, SUBSYSTEMS, STATS } from '../content.js';

/**
 * Chapters 06 and 07 — layout primitives, then the template library.
 *
 * Chapter 06 draws every primitive with a VISIBLE boundary. Reflow is the thing
 * being tested, and reflow is only legible in a still if you can see where each
 * slot begins and ends — an un-outlined `Split` that failed to stack looks much
 * like one that stacked correctly.
 */

/** A slot with a visible edge, so layout structure reads in a still. */
const Slot = ({ children, tone = 'primary' }) => {
  const { px } = useFormat();
  const theme = useTheme();
  return (
    <div
      style={{
        minWidth: 0,
        padding: px(18),
        borderRadius: theme.radii.sm,
        border: `1px dashed ${theme.colors.borderStrong}`,
        background: theme.colors.surfaceOverlay,
        color: theme.colors[tone],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: px(72),
      }}
    >
      {children}
    </div>
  );
};

export const LayoutsChapter = () => {
  const { px } = useFormat();
  const { bucket } = useResponsive();

  return (
    <Chapter
      index={6}
      subsystem="Layouts"
      validates={`Stack · Center · Split · Grid · FullBleed — reflowing for "${bucket}"`}
      background="workshop"
    >
      <Stack gap={{ landscape: 22, vertical: 16 }} style={{ width: '100%' }}>
        <Eyebrow>Reflow is decided once, by the layout</Eyebrow>

        {/* Split: row on wide canvases, stacked on portrait/square. */}
        <Stack gap={8}>
          <Caption>Split — ratio [2, 1]</Caption>
          <Split ratio={[2, 1]} gap={{ landscape: 20, vertical: 12 }}>
            <Slot>start (2fr)</Slot>
            <Slot tone="secondary">end (1fr)</Slot>
          </Split>
        </Stack>

        {/* Grid: drops columns as the canvas narrows. 4 / 3 / 2 / 1. */}
        <Stack gap={8}>
          <Caption>Grid — ultrawide 4 · landscape 3 · square 2 · portrait 1</Caption>
          <Grid gap={16}>
            {SUBSYSTEMS.map((item) => (
              <Slot key={item.id}>{item.title}</Slot>
            ))}
          </Grid>
        </Stack>

        {/* Center: caps measure so long copy never runs edge to edge. */}
        <Stack gap={8}>
          <Caption>Center — measure capped per bucket</Caption>
          <Center>
            <Text
              variant="description"
              motion={{ preset: 'fade', delay: 8 }}
              style={{ textAlign: 'center', fontSize: px(22) }}
            >
              {LOREM}
            </Text>
          </Center>
        </Stack>

        {/* FullBleed: media to the edges, with the layout owning the scrim. */}
        <Stack gap={8}>
          <Caption>FullBleed — layout owns the scrim</Caption>
          <div
            style={{
              width: '100%',
              height: px(140),
              position: 'relative',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <FullBleed
              media={
                <img
                  src={swatch('FullBleed', '#4338ca', '#0d0f16', { width: 1600, height: 400 })}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              }
              anchor="bottom-left"
              scrim="bottom"
              padded={false}
            >
              <div style={{ padding: px(20) }}>
                <Caption>anchored bottom-left</Caption>
              </div>
            </FullBleed>
          </div>
        </Stack>
      </Stack>
    </Chapter>
  );
};

/**
 * Chapter 07 — every scene template, as a montage.
 *
 * Each template gets an equal slice of the chapter. This is deliberately a
 * SEQUENCE rather than a nested TransitionSeries: transitions would overlap the
 * slices and make it ambiguous which template a given still belongs to, and
 * attribution is worth more here than polish.
 *
 * Templates are listed rather than iterated because each one takes a different
 * slot shape — that IS their API, and a generic loop could only exercise the
 * props they happen to share, which is the least interesting part of them.
 */
export const TemplatesChapter = () => {
  const { fps } = useVideoConfig();
  const theme = useTheme();

  const media = (label, from) => (
    <img
      src={swatch(label, from, theme.colors.background)}
      alt=""
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );

  const slides = [
    <TitleScene kicker="Templates" title="Twelve archetypes." subtitle="Each one a slot API." />,
    <HeroScene
      eyebrow="Hero"
      title="Media beside copy."
      description="Slots take arbitrary nodes."
      media={media('hero', theme.colors.primary)}
    />,
    <SectionIntro index="01" eyebrow="Chapter" title="Section intro." />,
    <FeatureShowcase eyebrow="Features" title="Marked list." features={SUBSYSTEMS} />,
    <StatisticsScene eyebrow="Statistics" title="Counted." stats={STATS} />,
    <TimelineScene
      eyebrow="Timeline"
      title="Ordered beats."
      items={SUBSYSTEMS.map((s, i) => ({ id: s.id, label: `0${i + 1}`, title: s.title }))}
    />,
    <QuoteScene quote={'Make every change at the lowest layer\nthat can express it.'} attribution="Principle" />,
    <GalleryScene
      eyebrow="Gallery"
      title="A grid of media."
      items={SUBSYSTEMS.map((s) => ({ id: s.id, src: swatch(s.title, theme.colors.secondary, theme.colors.background) }))}
    />,
    <ProductShowcase
      badge="Showcase"
      title="Object beat."
      description="Badge, copy and media."
      features={['Composable', 'Theme-driven']}
      media={media('product', theme.colors.accent)}
    />,
    <VideoSection eyebrow="Video" title="Full bleed." caption="Scrim owned by the layout." media={media('footage', '#1e3a8a')} />,
    <CTAScene eyebrow="Call to action" title="Do the thing." primaryAction="Primary" secondaryAction="Secondary" />,
    <OutroScene brandName="Motion Studio" tagline="One architecture." website="motion-studio-framework" />,
  ];

  const slice = Math.floor((12 * fps) / slides.length);

  return (
    <>
      {slides.map((slide, index) => (
        <Sequence
          key={index}
          from={index * slice}
          durationInFrames={slice}
          name={`template ${index + 1}`}
        >
          {slide}
        </Sequence>
      ))}
    </>
  );
};
