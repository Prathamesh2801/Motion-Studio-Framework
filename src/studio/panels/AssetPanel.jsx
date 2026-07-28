import React from 'react';
import { unrenderableAssets } from '@/engine';
import { Panel } from './ui.jsx';

/**
 * Live asset preview (Ring 4).
 *
 * Shows the assets the CURRENT document actually resolved to — read off the
 * ViewModel, not off the raw JSON. That distinction is the whole value: the
 * ViewModel holds the paths after `resolveAsset` has run, so this panel proves
 * a file was found at the path the film will fetch. A preview built from the
 * document would happily show `players/messi.svg` for a file that does not
 * exist, and the first sign of trouble would be a hole in the render.
 *
 * A broken image therefore means a broken path, which is exactly the signal
 * wanted while swapping placeholders for real assets.
 */
const Thumb = ({ label, asset }) => {
  if (!asset?.src) return null;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-black/40 p-1">
        <img src={asset.src} alt={label} className="max-h-full max-w-full object-contain" />
      </div>
      <span className="text-[10px] tracking-wide text-white/35 uppercase">{label}</span>
    </div>
  );
};

export const AssetPanel = ({ vm, packId }) => {
  if (!vm) return null;

  const blobs = unrenderableAssets(vm);

  return (
    <Panel title="Assets">
      <div className="flex flex-wrap gap-4">
        <Thumb label="Portrait" asset={vm.subject.portrait} />
        {vm.identity.map((chip) => (
          <Thumb key={chip.id} label={chip.label} asset={chip.icon} />
        ))}
        {vm.assets?.background ? <Thumb label="Background" asset={vm.assets.background} /> : null}
      </div>

      {blobs.length ? (
        // A dropped file previews perfectly here and cannot be fetched by a
        // headless render — the editor would look right and the MP4 would come
        // back with holes in it.
        <p className="mt-3 rounded-md bg-amber-500/10 px-2.5 py-2 text-[11px] text-amber-200">
          {blobs.join(', ')} {blobs.length === 1 ? 'is' : 'are'} a dropped file and will not survive
          an MP4 render. Save under <code>public/packs/{packId}/</code>.
        </p>
      ) : (
        <p className="mt-3 text-[11px] leading-relaxed text-white/30">
          Resolved from the ViewModel, so a broken thumbnail is a broken path. Replace any file
          under <code>public/packs/{packId}/</code> — no code changes.
        </p>
      )}
    </Panel>
  );
};

export default AssetPanel;
