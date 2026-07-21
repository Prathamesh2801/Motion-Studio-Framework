import { entrances } from './entrances.js';
import { exits } from './exits.js';
import { ambientPresets } from './ambient.js';
import { resolveFrom } from '../helpers/registry.js';

export { entrances, exits, ambientPresets };

/**
 * Resolve a preset name (or a custom function) to a motion function.
 *
 * Unlike cameras and transitions, presets are resolved against one of THREE
 * vocabularies depending on context — entrances, exits or ambient — so the
 * caller passes the registry. That is why this uses `resolveFrom` directly
 * rather than owning a `createRegistry` instance.
 *
 * Policy is shared with every other resolver: a function passes through,
 * omitting a preset gives the registry's default, and an unknown NAME throws
 * rather than silently rendering the wrong motion.
 */
export const resolvePreset = (preset, registry = entrances) =>
  resolveFrom(registry, preset, {
    label: 'preset',
    // Every preset registry defines `none`, and it is the honest default:
    // "I did not ask for motion" should not silently produce a fade.
    fallback: 'none',
  });
