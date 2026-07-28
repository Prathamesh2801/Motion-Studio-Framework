/**
 * Immutable path edits on a document (Ring 2.5).
 *
 * The editor's controls change one field deep inside a document —
 * `data.league.name`, `data.season`. They need to do that without knowing the
 * document's shape (they are generic UI) and without mutating it (the reducer
 * and `<Player>` both compare by identity).
 *
 * Pure and dependency-free, so `npm test` asserts it in plain Node.
 */

const parse = (path) => (Array.isArray(path) ? path : String(path).split('.'));

/** Read `a.b.c`, or `undefined` if any link is missing. */
export const getAtPath = (object, path) =>
  parse(path).reduce((node, key) => (node == null ? undefined : node[key]), object);

/**
 * Return a copy of `object` with `path` set to `value`.
 *
 * Clones only the nodes along the path — every untouched branch keeps its
 * identity. That matters more than it looks: `<Player>` re-resolves when
 * `inputProps` changes identity, so a naive deep clone on every keystroke would
 * remount the composition and restart the animation mid-edit.
 *
 * Missing intermediate objects are created, so a control can set a field the
 * document has not got yet.
 */
export const setAtPath = (object, path, value) => {
  const [key, ...rest] = parse(path);
  if (key === undefined) return value;

  const base = object && typeof object === 'object' ? object : {};
  const child = rest.length ? setAtPath(base[key], rest, value) : value;
  if (base[key] === child) return object ?? base;

  return { ...base, [key]: child };
};

/** Apply a `{ 'a.b': value }` map in one pass. Returns the same object if nothing changed. */
export const applyPatch = (object, patch = {}) =>
  Object.entries(patch).reduce((next, [path, value]) => setAtPath(next, path, value), object);

/**
 * Does `object` already match every entry of `patch`?
 *
 * The editor uses this to decide which dropdown option is selected, rather than
 * storing a parallel copy of the selection. One source of truth — the document —
 * means a control cannot drift from what is actually rendering.
 */
export const patchMatches = (object, patch = {}) =>
  Object.entries(patch).every(([path, value]) => getAtPath(object, path) === value);
