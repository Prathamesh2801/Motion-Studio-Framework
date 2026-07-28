import React from 'react';
import { Composition } from 'remotion';
import { FORMATS } from '@/framework';
import { PACKS, firstSample } from './registry.js';
import { PackHost, packMetadata } from './PackHost.jsx';

/**
 * Pack → <Composition> (Ring 3a).
 *
 * The mirror of `registerProject` for packs. It is a separate function rather
 * than a flag on that one because the two register genuinely different things:
 * `registerProject` takes a component and a duration and wraps it in a theme,
 * while a pack's component, duration, dimensions AND theme are all derived from
 * a document at render time by `resolvePack`. Bending one function to do both
 * would mean half its parameters are ignored on every call.
 *
 * One composition per (pack × format), opened with the pack's first sample. The
 * OTHER samples are not registered: a pack with 40 players would otherwise put
 * 120 compositions in the sidebar. Rendering a different document is a `--props`
 * flag or a click in the editor, not a registry entry — which is the whole
 * point of a pack.
 *
 * ── WHY NO `schema` PROP ────────────────────────────────────────────────────
 * Passing the document schema to <Composition> crashes Studio's props sidebar.
 * Its schema editor assumes any `string`-typed node has a string value
 * (`ZodSwitch.js:39` calls `value.startsWith(...)` unguarded), and a pack
 * document legitimately contains `z.union([z.string(), z.object({...})])` assets
 * that are absent — an optional portrait arrives as `undefined` and the sidebar
 * throws before rendering a single field.
 *
 * The fix is not to reshape the data contract to suit a sidebar widget. Assets
 * are a string OR an object because humans write the string form; forcing every
 * optional field to a default `''` would push empty strings through the adapter
 * and render blank elements. Without `schema`, Studio falls back to editing the
 * props as JSON — which is the correct surface for a document anyway, and the
 * same JSON `npm run editor` edits.
 *
 * Nothing is lost by omitting it: `schema` only drives that sidebar UI. Every
 * document is still validated by `pack.schema` inside `resolvePack`, which runs
 * via `calculateMetadata` on every props change and throws with the offending
 * field named.
 */
export const registerPacks = () =>
  PACKS.flatMap((pack) =>
    pack.formats.map((formatId) => {
      const format = FORMATS[formatId];
      if (!format) {
        throw new Error(
          `Pack "${pack.id}": unknown format "${formatId}". ` +
            `Known: ${Object.keys(FORMATS).join(', ')}.`,
        );
      }

      const id = `${pack.id}-${formatId}`;

      return (
        <Composition
          key={id}
          id={id}
          component={PackHost}
          defaultProps={{
            packId: pack.id,
            document: firstSample(pack),
            format: formatId,
          }}
          // Placeholders. `calculateMetadata` overwrites all four from the
          // actual document before anything renders; Remotion requires them to
          // be present on the element regardless.
          durationInFrames={format.fps}
          fps={format.fps}
          width={format.width}
          height={format.height}
          calculateMetadata={packMetadata}
        />
      );
    }),
  );

export default registerPacks;
