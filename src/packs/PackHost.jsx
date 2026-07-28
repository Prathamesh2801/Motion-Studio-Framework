import React from 'react';
import { packById } from './registry.js';
import { resolvePack } from './resolve.js';

/**
 * The mountable unit (Ring 3a).
 *
 * Every host mounts THIS, with fully serialisable props: a pack id, a document,
 * a format name. Serialisable is the requirement that shapes the whole design —
 * it is what lets the same thing be a Studio composition (props editable in the
 * sidebar), a CLI render (`--props='{...}'`), and a live editor preview
 * (`inputProps` swapped on every edit), with no host-specific entry point.
 *
 * The pack itself is looked up by id rather than passed, because a pack manifest
 * contains React components and zod schemas and cannot survive JSON.
 */
export const PackHost = ({ packId, document, format }) => {
  const pack = packById(packId);
  const { component: ThemedFilm, inputProps } = resolvePack(pack, document, format);
  return <ThemedFilm {...inputProps} />;
};

/**
 * Recompute duration and dimensions from the CURRENT props.
 *
 * Remotion calls this before rendering, so a document edited in the Studio
 * sidebar gets the right length rather than the sample's. It matters because
 * this subsystem's timelines are DERIVED from data — a document with a hero
 * metric earns an extra beat — so a fixed `durationInFrames` would truncate the
 * film the moment anyone changed the JSON. That is the exact class of silent,
 * survives-review bug the framework's registries were built to refuse.
 */
export const packMetadata = ({ props }) => {
  const { durationInFrames, fps, width, height } = resolvePack(
    packById(props.packId),
    props.document,
    props.format,
  );
  return { durationInFrames, fps, width, height };
};

export default PackHost;
