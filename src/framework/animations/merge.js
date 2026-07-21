import { composeTransform } from '../helpers/style.js';

/**
 * Combines several animation style objects into one.
 *
 * Naively spreading would drop all but the last `transform`; this concatenates
 * transforms (order preserved), multiplies opacities and chains filters, so
 * `mergeMotion(fadeIn(...), riseIn(...), breathe(...))` behaves as expected.
 * It is the keystone the whole preset system relies on.
 */
export const mergeMotion = (...styles) => {
  const valid = styles.filter(Boolean);
  const transforms = [];
  const filters = [];
  let opacity;
  const rest = {};

  for (const style of valid) {
    for (const [key, value] of Object.entries(style)) {
      if (value === undefined) continue;
      if (key === 'transform') transforms.push(value);
      else if (key === 'filter') filters.push(value);
      else if (key === 'opacity') opacity = opacity === undefined ? value : opacity * value;
      else rest[key] = value;
    }
  }

  const merged = { ...rest };
  if (transforms.length > 0) merged.transform = composeTransform(...transforms);
  if (filters.length > 0) merged.filter = filters.join(' ');
  if (opacity !== undefined) merged.opacity = opacity;
  return merged;
};
