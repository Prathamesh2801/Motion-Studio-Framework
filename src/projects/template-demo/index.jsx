import React from 'react';
import { useVideoConfig, Img } from 'remotion';
import { CTA, MediaFrame } from '@/framework';
import {
  StandardFilm,
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
import { templateTimeline, templateDuration } from './timeline.js';
import { FEATURES, STATS, MILESTONES, GALLERY, placeholder } from './content.js';

/**
 * Template demo — Phase 4 verification.
 *
 * A COMPLETE film with no hand-written scenes: every beat is a template filled
 * with data from `content.js`, assembled by `StandardFilm` over a timeline. This
 * is the authoring workflow future projects use.
 *
 * Note what is absent: no `<Scene>`, no layout maths, no `if (isVertical)`, no
 * frame offsets, no transition wiring. Adding, cutting or re-ordering a beat is
 * an edit to `SCENE_PLAN` plus an entry in the scene map below.
 */
const HERO_MEDIA = (
  <MediaFrame src={placeholder('framework', '#4338ca', '#0d0f16')} preset="depth" kenBurns={0.06} style={{ width: '100%', aspectRatio: '4 / 3' }} />
);

export const TemplateDemo = () => {
  const { fps } = useVideoConfig();
  const timeline = templateTimeline(fps);

  return (
    <StandardFilm
      timeline={timeline}
      transition="fade"
      scenes={{
        title: (
          <TitleScene
            kicker="Motion Studio Framework"
            title={'Composed,\nnot written.'}
            subtitle="Every scene in this film is a template filled with data."
          />
        ),

        hero: (
          <HeroScene
            eyebrow="Authoring surface"
            title="Templates take slots."
            description="Meaningful content slots replace bespoke scene implementations."
            media={HERO_MEDIA}
            actions={<CTA variant="solid">See the slots</CTA>}
          />
        ),

        section: <SectionIntro index="01" eyebrow="Chapter" title="What the system provides." />,

        features: (
          <FeatureShowcase
            eyebrow="Composition"
            title="Built from parts that already exist."
            features={FEATURES}
            media={<MediaFrame src={placeholder('components', '#0891b2', '#0d0f16')} preset="settle" kenBurns={0.05} style={{ width: '100%', aspectRatio: '1 / 1' }} />}
            mediaFirst
          />
        ),

        stats: <StatisticsScene eyebrow="Surface area" title="One architecture." stats={STATS} />,

        milestones: (
          <TimelineScene
            eyebrow="Roadmap"
            title="How it was built."
            items={MILESTONES}
          />
        ),

        quote: (
          <QuoteScene
            quote={'Make every change at the lowest layer\nthat can express it.'}
            attribution="Architecture principle"
            role="Motion Studio Framework"
          />
        ),

        gallery: <GalleryScene eyebrow="Systems" title="Layers of the stack." items={GALLERY} />,

        product: (
          <ProductShowcase
            badge="Layout primitive"
            title="Split"
            description="Row on wide canvases, stacked on portrait — decided once, by the layout."
            features={['Composable', 'Content-agnostic', 'Ratio aware']}
            media={<MediaFrame src={placeholder('split', '#7c3aed', '#0d0f16')} preset="settle" kenBurns={0.05} style={{ width: '100%', aspectRatio: '4 / 3' }} />}
          />
        ),

        video: (
          <VideoSection
            eyebrow="Full bleed"
            title="Edge to edge, with a scrim."
            caption="The layout owns legibility over uncontrolled media."
            media={<Img src={placeholder('footage', '#1e3a8a', '#020617')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          />
        ),

        cta: (
          <CTAScene
            eyebrow="Next"
            title="Compose the next video."
            description="A new project is a timeline, a scene map and its data."
            primaryAction="Start a project"
            secondaryAction="Read the docs"
          />
        ),

        outro: (
          <OutroScene
            brandName="Motion Studio"
            tagline="One architecture, many kinds of video."
            website="motion-studio-framework"
          />
        ),
      }}
    />
  );
};

export { templateDuration };
export default TemplateDemo;
