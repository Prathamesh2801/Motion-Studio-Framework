/**
 * Component library (Ring 1) — brand-agnostic, theme-driven building blocks.
 *
 * Five groups, each with one job:
 *  - primitives/ unopinionated blocks (Surface, Reveal, Stagger, MediaFrame, Badge, Divider, Icon)
 *  - typography/ the Text base + semantic wrappers
 *  - layers/     full-frame atmosphere (gradient, glow, grid, grain, vignette) + the two-pass background
 *  - content/    data-shaped blocks (SectionHeader, StatCard, FeatureList, CTASection)
 *  - branding/   generic identity (LogoMark, Outro)
 *
 * All read visual tokens at runtime via useTheme(), so any brand renders them.
 */
export * from './primitives/index.js';
export * from './typography/index.js';
export * from './layers/index.js';
export * from './content/index.js';
export * from './branding/index.js';
