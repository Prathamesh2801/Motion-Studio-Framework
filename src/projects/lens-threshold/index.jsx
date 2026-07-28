import React from 'react';
import { Portal } from './Portal.jsx';
import { LENS_THRESHOLD_DEFAULT_PROPS, deriveLensThresholdLayout } from './schema.js';

/**
 * Lens Threshold.
 *
 * The framework's first VR-focused production and its first single-shot
 * transition study — no multi-scene timeline, no `StandardFilm`, because the
 * whole piece IS one continuous camera move. See `Portal.jsx` for the
 * technique (a focus rack between two full-bleed videos) and `schema.js` for
 * the tunable timing.
 */
export const LensThreshold = (props) => <Portal {...props} />;

export const lensThresholdDuration = (fps) =>
  deriveLensThresholdLayout({ timing: LENS_THRESHOLD_DEFAULT_PROPS.timing, fps }).total;

export default LensThreshold;
