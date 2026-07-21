/**
 * The registry idiom (Ring 1).
 *
 * The framework resolves five different vocabularies by name — easings, presets,
 * cameras, transitions and timebases. Each had grown its own copy of the same
 * "function passes through / string looks up / else fallback" logic, and they had
 * drifted: three fell back silently and two threw.
 *
 * Silent fallback is the wrong default. `preset="fadeIn"` (there is no such
 * entry — it is `fade`) would render successfully and wrong, which is the most
 * expensive class of bug in a motion system: nothing fails, the shot is just
 * subtly off, and you find out in the final render.
 *
 * ── THE POLICY ──────────────────────────────────────────────────────────────
 *   a function        → passed through (the one-off escape hatch)
 *   null / undefined  → the registry's documented default
 *   a KNOWN name      → that entry
 *   an UNKNOWN name   → throws, listing the known names
 *
 * Omitting a value is a choice; misspelling one is a mistake. They should not
 * behave the same way.
 */

const listNames = (entries) => Object.keys(entries).join(', ');

/**
 * Resolve a spec against a plain entries object using the policy above.
 *
 * @param {object} entries          Name → value.
 * @param {*} spec                  A name, a function, or a coercible value.
 * @param {object} options
 * @param {string} options.label    What this registry is, for error messages.
 * @param {string} [options.fallback]
 *        Entry name used when `spec` is null/undefined. Omit to require a value.
 * @param {(spec: *) => *} [options.coerce]
 *        Optional escape hatch for non-string, non-function inputs (e.g. an
 *        easing given as a raw bezier array). Return `undefined` to decline.
 * @param {string} [options.hint]
 *        Appended to the "unknown name" error — use it to point at the registry's
 *        extension point, so the error tells you how to fix it, not just that it
 *        broke.
 */
export const resolveFrom = (entries, spec, { label, fallback, coerce, hint } = {}) => {
  if (typeof spec === 'function') return spec;

  if (spec == null) {
    if (fallback == null) {
      throw new Error(`${label}: a value is required (no default is defined).`);
    }
    return entries[fallback];
  }

  if (coerce) {
    const coerced = coerce(spec);
    if (coerced !== undefined) return coerced;
  }

  if (typeof spec === 'string' && Object.prototype.hasOwnProperty.call(entries, spec)) {
    return entries[spec];
  }

  throw new Error(
    `${label}: unknown name ${JSON.stringify(spec)}. Known: ${listNames(entries)}.` +
      (hint ? ` ${hint}` : ''),
  );
};

/**
 * Build a named registry that owns its entries and can be extended at runtime.
 *
 * Use this where the vocabulary is a single fixed set (cameras, transitions,
 * timebases). Where the *caller* chooses which set to resolve against — presets
 * resolve into entrances, exits or ambient depending on context — use
 * `resolveFrom` directly instead.
 *
 * @returns {{entries: object, resolve: Function, register: Function, names: Function, has: Function}}
 */
export const createRegistry = ({ label, entries = {}, fallback, coerce, hint, validate } = {}) => {
  if (!label) throw new Error('createRegistry: `label` is required for error messages.');

  const store = { ...entries };

  return {
    /** Live view of the registered entries. */
    get entries() {
      return store;
    },
    names: () => Object.keys(store),
    has: (name) => Object.prototype.hasOwnProperty.call(store, name),
    resolve: (spec) => resolveFrom(store, spec, { label, fallback, coerce, hint }),
    /**
     * Add or replace an entry. This is the extension point that keeps new
     * capability additive — a new camera move or transition is an entry here,
     * never a change to a core code path.
     */
    register: (name, value) => {
      if (typeof name !== 'string' || !name) {
        throw new Error(`${label}: register() requires a non-empty name.`);
      }
      if (validate) validate(name, value);
      store[name] = value;
      return value;
    },
  };
};
