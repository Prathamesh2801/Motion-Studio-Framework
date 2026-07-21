import React from 'react';
import { Composition, Folder } from 'remotion';

import './styles/tailwind.css';

import { registerProject } from '@/framework';
import { defaultTheme, editorialTheme } from '@/design';

import { Hello } from './projects/hello/index.jsx';
import { MotionDemo } from './projects/motion-demo/index.jsx';
import { ComponentsDemo } from './projects/components-demo/index.jsx';
import { ExplainerDemo, explainerDuration } from './projects/explainer-demo/index.jsx';
import { MusicalDemo, musicalDuration } from './projects/musical-demo/index.jsx';
import { LayoutsDemo, layoutsDuration } from './projects/layouts-demo/index.jsx';
import { TemplateDemo, templateDuration } from './projects/template-demo/index.jsx';
import { FrameworkShowcase, showcaseDuration } from './projects/framework-showcase/index.jsx';
import { TortureTest, tortureDuration } from './projects/torture-test/index.jsx';

/**
 * Composition registry — the root the renderer sees.
 *
 * Projects declare what they are once and `registerProject` emits one
 * <Composition> per requested format, wrapped in the project's ThemeProvider.
 * `durationInFrames` is passed as a function because a timeline's length depends
 * on fps — the timeline is the single source of truth for it, never a literal
 * copied into this file.
 *
 * The earlier Phase 0-2 demos stay registered manually; they predate the helper
 * and are useful as minimal, dependency-free smoke tests.
 */
export const RemotionRoot = () => (
  <>
    <Folder name="Smoke-Test">
      <Composition id="Hello-Landscape" component={Hello} durationInFrames={120} fps={30} width={1920} height={1080} />
      <Composition id="Hello-Reel" component={Hello} durationInFrames={120} fps={30} width={1080} height={1920} />
    </Folder>

    <Folder name="Motion-Demo">
      <Composition id="MotionDemo-Landscape" component={MotionDemo} durationInFrames={150} fps={30} width={1920} height={1080} />
      <Composition id="MotionDemo-Reel" component={MotionDemo} durationInFrames={150} fps={30} width={1080} height={1920} />
    </Folder>

    <Folder name="Components-Demo">
      <Composition id="ComponentsDemo-Landscape" component={ComponentsDemo} durationInFrames={150} fps={30} width={1920} height={1080} />
      <Composition id="ComponentsDemo-Reel" component={ComponentsDemo} durationInFrames={150} fps={30} width={1080} height={1920} />
    </Folder>

    {/* Phase 3 — non-musical: scene lengths in plain seconds. */}
    <Folder name="Explainer-Demo">
      {registerProject({
        id: 'ExplainerDemo',
        component: ExplainerDemo,
        theme: defaultTheme,
        formats: ['landscape', 'reel'],
        durationInFrames: explainerDuration,
      })}
    </Folder>

    {/* Phase 3 — grid-locked: cuts on a bar lattice, audio spliced from the same starts. */}
    <Folder name="Musical-Demo">
      {registerProject({
        id: 'MusicalDemo',
        component: MusicalDemo,
        theme: defaultTheme,
        formats: ['landscape', 'reel'],
        durationInFrames: musicalDuration,
      })}
    </Folder>

    {/* Phase 4 — one scene per responsive layout primitive. */}
    <Folder name="Layouts-Demo">
      {registerProject({
        id: 'LayoutsDemo',
        component: LayoutsDemo,
        theme: defaultTheme,
        formats: ['landscape', 'reel'],
        durationInFrames: layoutsDuration,
      })}
    </Folder>

    {/* Phase 4 — a complete film composed entirely from scene templates. */}
    <Folder name="Template-Demo">
      {registerProject({
        id: 'TemplateDemo',
        component: TemplateDemo,
        theme: defaultTheme,
        formats: ['landscape', 'reel'],
        durationInFrames: templateDuration,
      })}
    </Folder>

    {/*
      Phase 5 — the SAME film under a deliberately opposite brand: light paper
      instead of dark, editorial serif instead of geometric sans, warm shadows
      instead of cool. Not decoration — it is the test. One component that
      hardcoded "text is near-white" or "shadows are black" shows up here
      immediately, and nowhere else.
    */}
    {/*
      Phase 5 — the official engineering validation film. One chapter per
      subsystem; re-render this after any framework change or dependency upgrade.
    */}
    <Folder name="Showcase">
      {registerProject({
        id: 'FrameworkShowcase',
        component: FrameworkShowcase,
        theme: defaultTheme,
        formats: ['landscape', 'reel'],
        durationInFrames: showcaseDuration,
      })}
    </Folder>

    {/*
      Phase 5 — robustness. The only place `ultrawide` and `exhibition` are
      rendered; both have been defined since Phase 1 and never looked at.
    */}
    <Folder name="Torture-Test">
      {registerProject({
        id: 'TortureTest',
        component: TortureTest,
        theme: defaultTheme,
        formats: ['landscape', 'reel', 'ultrawide', 'exhibition'],
        durationInFrames: tortureDuration,
      })}
    </Folder>

    <Folder name="Brand-Proof">
      {registerProject({
        id: 'TemplateDemoEditorial',
        component: TemplateDemo,
        theme: editorialTheme,
        formats: ['landscape', 'reel'],
        durationInFrames: templateDuration,
      })}
    </Folder>
  </>
);

export default RemotionRoot;
