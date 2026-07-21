import React from 'react';
import { Sequence, useVideoConfig } from 'remotion';
import {
  TextExtremes,
  MissingSlots,
  GridExtremes,
  TimelineExtremes,
  ThemeNesting,
  ResponsiveStress,
  DataExtremes,
} from './cases.jsx';

/**
 * TortureTest — robustness, not beauty.
 *
 * Kept as a separate composition from `FrameworkShowcase` on purpose. Its
 * failure modes are ugly by design (overflowing copy, forty-item grids, empty
 * data sets), and mixing them into the showcase would make the showcase
 * unreadable as a validation artefact.
 *
 * ── WHAT IT IS FOR ──────────────────────────────────────────────────────────
 * Every case is something that WILL happen on a real project: copy longer than
 * the designer imagined, a CMS field that came back empty, a data set with forty
 * rows instead of four, a format nobody looked at. The question is never whether
 * it looks good — it is whether the framework degrades sensibly or falls apart.
 *
 * This is also the ONLY place `ultrawide` (3840×1080) and `exhibition`
 * (2160×3840) are rendered. Both formats have been defined and bucketed since
 * Phase 1 and, until now, never once looked at.
 *
 * Error paths (unknown timebase, unknown preset, malformed theme, duplicate
 * scene ids) are asserted in `npm test` rather than rendered here — a composition
 * that throws cannot also be looked at.
 */

const CASES = [
  TextExtremes,
  MissingSlots,
  GridExtremes,
  TimelineExtremes,
  ThemeNesting,
  ResponsiveStress,
  DataExtremes,
];

/** 4 seconds per case — long enough to read, short enough to re-render often. */
export const CASE_SECONDS = 4;

export const tortureDuration = (fps) => CASES.length * CASE_SECONDS * fps;

export const TortureTest = () => {
  const { fps } = useVideoConfig();
  const slice = CASE_SECONDS * fps;

  // Plain Sequences, no transitions: a transition would blend two cases together
  // and make it ambiguous which one a still belongs to.
  return (
    <>
      {CASES.map((CaseComponent, index) => (
        <Sequence
          key={CaseComponent.name}
          from={index * slice}
          durationInFrames={slice}
          name={CaseComponent.name}
        >
          <CaseComponent />
        </Sequence>
      ))}
    </>
  );
};

export default TortureTest;
