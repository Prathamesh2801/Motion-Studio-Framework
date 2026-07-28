import { staticFile } from 'remotion';
import { assetIsRenderable } from './schema/primitives.js';

/**
 * Asset resolution for data documents (Ring 2.5).
 *
 * `framework/assets` scopes assets to a PROJECT (`public/projects/<id>/…`),
 * which is right for a one-off film. A pack is not a project: one pack serves
 * many documents, and its assets are shared across all of them — so packs get
 * their own root, `public/packs/<packId>/…`, under the same collision-proof
 * scoping rule.
 *
 * ── WHY `staticFile` WORKS IN BOTH HOSTS ────────────────────────────────────
 * `staticFile('packs/x/a.png')` resolves against Remotion's static base in
 * Studio and in a render, and falls back to a root-relative `/packs/x/a.png` in
 * a plain browser. The Vite editor is configured with the repo root as its root,
 * so its `publicDir` is the SAME `public/` folder — one path, both hosts, no
 * per-host branching in any document or component.
 */

const clean = (segment) => String(segment).replace(/^\/+|\/+$/g, '');

/** Widen the string shorthand into the full Asset object. */
export const toAsset = (asset) =>
  typeof asset === 'string' ? { src: asset } : { ...asset };

/**
 * Resolve one asset against a pack root.
 *
 * Left untouched: absolute URLs, root-relative paths, data URIs and `blob:`
 * sources. The first three are deliberate escape hatches; `blob:` is what the
 * editor's drag-and-drop produces, and rewriting it would break the live
 * preview that makes dropping a file useful in the first place.
 */
export const resolveAsset = (asset, packId) => {
  if (!asset) return null;
  const widened = toAsset(asset);
  const src = widened.src;
  if (!src) return null;

  const passthrough =
    /^(https?:|data:|blob:|\/)/.test(src) || !packId;

  return {
    ...widened,
    src: passthrough ? src : staticFile(`packs/${clean(packId)}/${clean(src)}`),
    /** Editor-only signal: a blob preview that an MP4 render cannot fetch. */
    renderable: assetIsRenderable(widened),
  };
};

/** Every asset in a ViewModel that would fail an MP4 render, by path. */
export const unrenderableAssets = (vm) => {
  const found = [];
  const check = (asset, path) => {
    if (asset && asset.renderable === false) found.push(path);
  };
  check(vm.subject?.portrait, 'subject.portrait');
  vm.identity?.forEach((chip, i) => check(chip.icon, `identity[${i}].icon`));
  for (const key of ['background', 'logo', 'watermark']) {
    check(vm.assets?.[key], `assets.${key}`);
  }
  return found;
};
