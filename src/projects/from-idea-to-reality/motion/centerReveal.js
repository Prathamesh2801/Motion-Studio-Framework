/**
 * Soft-edged reveal converging from a title's own centre outward — the
 * `mask-image` technique `gradientReveal` already uses (`framework/
 * animations/reveal.js`), mirrored so it grows from the middle in both
 * directions instead of sweeping one way. Kept project-local rather than
 * promoted to a framework preset: it's shaped by proportions specific to
 * this film's two title cards (opening + ending), not a general-purpose
 * entrance — same call as the Peak shot's lens streak (`shots/momentum.jsx`),
 * a bespoke visual built from primitives rather than a new registered preset.
 * Shared between `opening.jsx` and `ending.jsx` because the film's title
 * reveals identically both times — that repetition is the point.
 *
 * `progress` 0 → fully hidden, no exceptions; 1 → fully revealed. The soft
 * edge's width is capped at how far the reveal has actually travelled
 * (`Math.min(maxSoftness, half)`) rather than a fixed constant — a fixed
 * softness would leave a permanently-partial-opacity band straddling the
 * centre even at progress 0. Shrinking the edge to zero as progress
 * approaches 0 collapses all four gradient stops to the same point, which
 * every engine renders as a hard, fully-transparent result — nothing
 * readable, confirmed by pixel sampling. Never moves a glyph — only
 * visibility changes, so alignment is exact by construction.
 */
export const centerRevealMask = (progress, maxSoftness = 14) => {
  const half = 50 * progress;
  const softness = Math.min(maxSoftness, half);
  const left = 50 - half;
  const right = 50 + half;
  const mask = `linear-gradient(90deg, transparent ${left - softness}%, #000 ${left}%, #000 ${right}%, transparent ${right + softness}%)`;
  return { maskImage: mask, WebkitMaskImage: mask };
};

export default centerRevealMask;
