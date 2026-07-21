import { useFormat } from './useFormat.js';

/**
 * Pick a value per responsive bucket, so per-format decisions are authored ONCE
 * as data instead of scattered `if (isVertical)` branches in every scene.
 *
 *   const { responsive } = useResponsive();
 *   const gap = responsive({ landscape: 40, portrait: 80 });
 *   const cols = responsive({ landscape: 3, vertical: 1 });
 *
 * Resolution order for the active bucket:
 *   1. an exact bucket key (`landscape|portrait|square|ultrawide`)
 *   2. `vertical` (covers portrait + square)
 *   3. sensible neighbour fallback (ultrawide→landscape, square→portrait)
 *   4. `default`, then `landscape`
 * A non-object argument passes straight through, so `responsive(40)` is legal.
 *
 * This is the seam the reference project was missing: its layout primitives
 * existed but every scene hand-rolled reflow with bespoke constant tables. The
 * layout system (Phase 4) and scene templates are built on this hook.
 */
export const useResponsive = () => {
  const { bucket } = useFormat();

  const responsive = (map) => {
    if (map == null || typeof map !== 'object' || Array.isArray(map)) return map;

    if (bucket in map) return map[bucket];
    if ((bucket === 'portrait' || bucket === 'square') && 'vertical' in map) return map.vertical;
    if (bucket === 'ultrawide' && 'landscape' in map) return map.landscape;
    if (bucket === 'square' && 'portrait' in map) return map.portrait;
    if ('default' in map) return map.default;
    if ('landscape' in map) return map.landscape;
    return undefined;
  };

  return { bucket, responsive, r: responsive };
};

export default useResponsive;
