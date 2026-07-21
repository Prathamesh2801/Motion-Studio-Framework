/**
 * Animation library (Ring 1).
 *
 * Every helper is a pure function of `{ frame, ... }` returning a style object.
 * Combine them with `mergeMotion` when an element needs more than one. Camera
 * moves live in the sibling `camera/` module (a named, selectable vocabulary),
 * not here.
 */
export { easings, resolveEasing } from './easing.js';
export { animate, springProgress, envelope, staggerDelay, oscillate } from './core.js';
export { fadeIn, fadeOut, fadeInOut, blurIn } from './fade.js';
export { scaleIn, scaleOut, scalePop, breathe } from './scale.js';
export { slideIn, slideOut, riseIn } from './slide.js';
export { rotateIn, spin, sway, flipIn } from './rotate.js';
export { maskReveal, gradientReveal, drawLine } from './reveal.js';
export { mergeMotion } from './merge.js';
