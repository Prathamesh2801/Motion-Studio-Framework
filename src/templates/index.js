/**
 * Scene template library.
 *
 * The primary authoring surface: a new video is composed from these templates
 * plus data, rather than hand-written scenes. Each template wraps a `Scene`,
 * arranges framework components through the responsive layout primitives, and
 * exposes meaningful CONTENT SLOTS.
 *
 * ── DEPENDENCY RULE ─────────────────────────────────────────────────────────
 * Templates import from `@/framework` ONLY. They never import a brand, a theme
 * or a project: visual tokens reach them through `useTheme()` at runtime, which
 * is what keeps a template usable by every brand and every project.
 *
 * ── SHARED API ──────────────────────────────────────────────────────────────
 * Every template accepts:
 *   background   atmosphere recipe name ('studio' | 'hearth' | 'workshop' | 'flat')
 *   camera       named camera move ('push' | 'pushIn' | 'drift' | 'static' | …)
 *   delay        frames before the scene's internal timing begins
 *   step         stagger between internal beats
 *   align        'left' | 'center' | 'right', or a per-bucket map
 *   style        escape hatch onto the Scene
 *
 * Content slots are per-template and documented on each. Slots typed as "node"
 * take arbitrary JSX, so a template never has to grow a prop for every variation.
 */
/** Composition skeletons — assemble a timeline + scene map into a film. */
export { StandardFilm } from './compositions/StandardFilm.jsx';

export { HeroScene } from './scenes/HeroScene.jsx';
export { TitleScene } from './scenes/TitleScene.jsx';
export { SectionIntro } from './scenes/SectionIntro.jsx';
export { FeatureShowcase } from './scenes/FeatureShowcase.jsx';
export { StatisticsScene } from './scenes/StatisticsScene.jsx';
export { TimelineScene } from './scenes/TimelineScene.jsx';
export { QuoteScene } from './scenes/QuoteScene.jsx';
export { GalleryScene } from './scenes/GalleryScene.jsx';
export { ProductShowcase } from './scenes/ProductShowcase.jsx';
export { VideoSection } from './scenes/VideoSection.jsx';
export { CTAScene } from './scenes/CTAScene.jsx';
export { OutroScene } from './scenes/OutroScene.jsx';
