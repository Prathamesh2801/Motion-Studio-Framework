import React from 'react';
import { useCurrentFrame } from 'remotion';
import {
  animate,
  seededRandom,
  stagger as staggerTokens,
  useFormat,
  useResponsive,
} from '@/framework';
import { Mark } from './Mark.jsx';

/**
 * ARRANGEMENTS of the mark — the film's two compositional states.
 *
 *   MarkRow    `rhythm`  strokes side by side, entering in sequence
 *   MarkGrid   `rhythm`  strokes on a lattice, the system fully arrived
 *   MarkForm   `form`    planes resolved into one coherent object
 *
 * `Mark.jsx` owns what a single mark IS; this file owns what many of them mean
 * together. Keeping them apart is what stops the atom growing a `count` prop
 * and a layout responsibility.
 *
 * ── WHY THESE DO NOT USE <Stagger> ──────────────────────────────────────────
 * The framework's `Stagger` wraps each child in a div carrying the preset's
 * motion. That is right for cards and list items — and wrong here, because the
 * mark's entrance is intrinsic to its SHAPE: a stroke draws itself with a
 * scaleY from a bottom origin, and a wrapper div fading in would double-animate
 * it (the exact mistake AUTHORING.md warns about).
 *
 * So these components pass a computed `delay` down to each Mark and let the
 * mark animate itself. The stagger STEP still comes from the framework's motion
 * tokens, so the film's rhythm stays on the house scale rather than inventing
 * its own numbers.
 */

/** Deterministic per-index jitter. Seeded, so every render is byte-identical. */
const jitter = (seed, index, amount) => (seededRandom(seed + index * 17) - 0.5) * 2 * amount;

/**
 * A row of strokes — Structure's first move. The system arrives by COPYING the
 * human's mark, so the copies are near-identical but not exactly: a little
 * height and angle variance keeps a row from reading as a UI progress bar.
 *
 * `warmIndex` marks which stroke is the original. It stays amber while the
 * copies come in cool, which is how the frame shows the idea being outnumbered
 * without a single word.
 */
export const MarkRow = ({
  count = 6,
  warmIndex = 0,
  delay = 0,
  step = staggerTokens.base,
  height = 190,
  gap = 44,
  seed = 7,
  variance = 0.18,
  glow = 0.7,
}) => {
  const { px } = useFormat();
  const { responsive } = useResponsive();

  // Portrait has no horizontal room for six strokes at full width; fewer, and
  // the gap tightens. Authored as data here rather than as an isVertical branch.
  const n = Math.max(1, responsive({ landscape: count, ultrawide: count, vertical: Math.min(count, 4) }));
  const spacing = responsive({ landscape: gap, vertical: gap * 0.6 });

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: px(spacing) }}>
      {Array.from({ length: n }, (_, i) => (
        <Mark
          key={i}
          shape="stroke"
          tone={i === warmIndex ? 'warm' : 'cool'}
          height={height * (1 + jitter(seed, i, variance))}
          angle={jitter(seed + 100, i, 1.6)}
          delay={delay + i * step}
          glow={glow}
        />
      ))}
    </div>
  );
};

/**
 * A lattice of strokes — the system at full strength.
 *
 * Entry order is by DIAGONAL (row + column) rather than by index, so the field
 * fills from one corner as a wave. Filling row by row reads as a list being
 * populated; a diagonal reads as growth, which is the beat this shot plays.
 */
export const MarkGrid = ({
  rows = 3,
  columns = 5,
  delay = 0,
  step = staggerTokens.tight,
  height = 110,
  gap = 34,
  warmCell = null,
  seed = 23,
  glow = 0.5,
}) => {
  const { px } = useFormat();
  const { responsive } = useResponsive();

  const cols = Math.max(1, responsive({ landscape: columns, ultrawide: columns + 2, vertical: Math.max(2, columns - 2) }));
  const rowCount = Math.max(1, responsive({ landscape: rows, vertical: rows + 1 }));
  const spacing = px(responsive({ landscape: gap, vertical: gap * 0.7 }));

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, auto))`,
        gap: spacing,
        justifyContent: 'center',
        alignItems: 'end',
      }}
    >
      {Array.from({ length: rowCount * cols }, (_, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const isWarm = warmCell != null && i === warmCell;

        return (
          <Mark
            key={i}
            shape="stroke"
            tone={isWarm ? 'warm' : 'cool'}
            height={height * (1 + jitter(seed, i, 0.14))}
            angle={jitter(seed + 200, i, 1.2)}
            // Diagonal wave: distance from the top-left corner.
            delay={delay + (row + col) * step}
            origin={row % 2 === 0 ? 'bottom' : 'top'}
            glow={isWarm ? 1 : glow}
          />
        );
      })}
    </div>
  );
};

/**
 * THE FORM — what everything resolves into.
 *
 * Deliberately built from PLANES rather than strokes: the film's five states
 * end at `plane`, and a resolved object made of lines would look like more
 * structure rather than a finished thing.
 *
 * The composition is a warm plane at the centre with cool planes stacked behind
 * it at diminishing opacity — the system still present, but BEHIND the human
 * mark rather than over it. That inversion is the film's whole argument in one
 * frame, so it is built as geometry rather than left to a colour grade.
 *
 * `assembly` (0..1) drives the whole thing, so the caller can tie it to scene
 * progress and the object appears to settle into place rather than cut in.
 */
export const MarkForm = ({ delay = 0, duration = 45, layers = 3, glow = 1 }) => {
  const frame = useCurrentFrame();
  const { px } = useFormat();
  const { responsive } = useResponsive();

  const assembly = animate({ frame, delay, duration, easing: 'entrance' });

  // Large. This is the film's payoff shot and the object has to hold the frame
  // on its own for three bars — and the `pull` camera shrinks it further as the
  // shot runs, so it must start with presence to spare.
  const base = responsive({ landscape: 400, ultrawide: 460, vertical: 300 });
  const spread = px(responsive({ landscape: 30, vertical: 22 }));

  return (
    <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
      {/* Cool planes, furthest first. They travel INWARD as the form settles:
          the system converging on the idea rather than the other way round. */}
      {Array.from({ length: layers }, (_, i) => {
        const depth = layers - i;
        return (
          <div
            key={i}
            style={{
              gridArea: '1 / 1',
              transform: `translate3d(${spread * depth * (1 - assembly * 0.55)}px, ${-spread * depth * (1 - assembly * 0.55)}px, 0)`,
              opacity: 0.16 + 0.1 * i,
            }}
          >
            <Mark
              shape="plane"
              solid
              tone="cool"
              width={base}
              height={base * 0.62}
              delay={delay + i * 4}
              glow={0}
            />
          </div>
        );
      })}

      {/* The warm plane, last and on top. The finished thing is warm. */}
      <div style={{ gridArea: '1 / 1' }}>
        <Mark
          shape="plane"
          solid
          tone="warm"
          width={base}
          height={base * 0.62}
          delay={delay + layers * 4}
          glow={glow}
        />
      </div>
    </div>
  );
};
