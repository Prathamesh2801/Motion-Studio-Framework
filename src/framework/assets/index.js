import { staticFile } from 'remotion';

/**
 * Asset resolution (Ring 1).
 *
 * One path from "the name of a file" to "a URL the renderer can fetch". Before
 * this existed, the only real asset in the repo was a bare
 * `staticFile('assets/music/grid-120bpm.wav')` string literal — which is fine
 * for one file and unmanageable for a film with dozens.
 *
 * ── WHY PER-PROJECT SCOPING ─────────────────────────────────────────────────
 * Assets live under `public/projects/<project>/<kind>/<file>`. Many projects
 * share one `public/`, and a flat namespace means the second project that wants
 * a `logo.png` either overwrites the first or invents a prefix convention by
 * hand. Scoping makes collisions impossible instead of merely unlikely, and it
 * means deleting a project is deleting one directory.
 *
 *   const asset = assetsFor('from-idea-to-reality');
 *   asset('music', 'score.wav')   -> projects/from-idea-to-reality/music/score.wav
 *   asset.image('hero.png')       -> projects/from-idea-to-reality/images/hero.png
 *
 * Remotion resolves `staticFile()` against `public/`, so these are the same URLs
 * in Studio, in a render, and on a render farm.
 */

/** Conventional sub-directories. Free-form kinds are allowed; these are just named. */
export const ASSET_KINDS = {
  image: 'images',
  video: 'video',
  music: 'music',
  voice: 'voice',
  sfx: 'sfx',
  font: 'fonts',
  texture: 'textures',
  brand: 'brand',
};

const clean = (segment) => String(segment).replace(/^\/+|\/+$/g, '');

/**
 * Build a project-scoped asset resolver.
 *
 * @param {string} project  Project id — must match the folder under `public/projects/`.
 * @returns {Function & Record<string, Function>}
 *   `asset(kind, file)`, plus a shorthand per entry in `ASSET_KINDS`
 *   (`asset.image(file)`, `asset.music(file)`, …) and `asset.path(...segments)`
 *   for anything that does not fit a kind.
 */
export const assetsFor = (project) => {
  if (!project || typeof project !== 'string') {
    throw new Error('assetsFor(project): a project id string is required.');
  }
  const root = `projects/${clean(project)}`;

  const asset = (kind, file) => {
    if (!file) {
      throw new Error(`asset("${kind}"): a file name is required.`);
    }
    // An unknown kind is used verbatim as the directory, so a project can add
    // its own category without the framework needing to know about it.
    const dir = ASSET_KINDS[kind] ?? clean(kind);
    return staticFile(`${root}/${dir}/${clean(file)}`);
  };

  for (const [kind, dir] of Object.entries(ASSET_KINDS)) {
    asset[kind] = (file) => {
      if (!file) throw new Error(`asset.${kind}(): a file name is required.`);
      return staticFile(`${root}/${dir}/${clean(file)}`);
    };
  }

  /** Escape hatch for files that do not live under a kind directory. */
  asset.path = (...segments) => staticFile([root, ...segments.map(clean)].join('/'));

  /** The project's public root, for building paths by hand. */
  asset.root = root;

  return asset;
};

export default assetsFor;
