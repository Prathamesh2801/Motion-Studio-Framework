import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { PACKS, packById, firstSample } from '@/packs/registry.js';
import { applyPatch } from '@/engine';

/**
 * Editor state (Ring 4).
 *
 * Context + useReducer, no store library. The entire state is one document
 * object plus three selections; Redux or Zustand would add a dependency and no
 * capability. If this grows a second document, or undo, revisit it — but adding
 * the abstraction before the problem is how editors become frameworks.
 *
 * ── THE ONE PERFORMANCE RULE ────────────────────────────────────────────────
 * The reducer must return the SAME state object when nothing changed. <Player>
 * re-resolves its composition when `inputProps` changes identity, so a reducer
 * that rebuilt the document on every no-op action would remount the film — and
 * the animation would restart mid-keystroke while you type a name.
 */

const STORAGE_KEY = 'msf.editor.v1';

const EditorContext = createContext(null);

const initialState = () => {
  const pack = PACKS[0];
  const document = firstSample(pack);
  return {
    packId: pack.id,
    document,
    format: document.format ?? pack.formats[0],
    /** Set by the Stage when a document fails to resolve. */
    issues: [],
  };
};

/**
 * Restore, but never trust. A stored document was written against whatever
 * schema shipped that day; a pack may since have been renamed or removed. A
 * corrupt localStorage entry must not be able to permanently break the app —
 * so anything unrecognised silently falls back to a fresh state.
 */
const restore = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const saved = JSON.parse(raw);
    packById(saved.packId); // throws if the pack no longer exists
    if (!saved.document || typeof saved.document !== 'object') return initialState();
    return { ...initialState(), ...saved, issues: [] };
  } catch {
    return initialState();
  }
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'selectPack': {
      if (action.packId === state.packId) return state;
      const pack = packById(action.packId);
      const document = firstSample(pack);
      return { ...state, packId: pack.id, document, format: document.format ?? pack.formats[0] };
    }

    case 'selectSample': {
      if (action.document === state.document) return state;
      return { ...state, document: action.document, format: action.document.format ?? state.format };
    }

    case 'setFormat':
      return action.format === state.format ? state : { ...state, format: action.format };

    case 'setDocument':
      return action.document === state.document ? state : { ...state, document: action.document };

    case 'patchDocument': {
      // Shallow-merge at the envelope level. Panels that edit `theme` or
      // `timing` pass a whole replacement sub-object; this keeps them from
      // having to know the rest of the envelope exists.
      const next = { ...state.document, ...action.patch };
      return { ...state, document: next };
    }

    case 'patchPaths': {
      // Deep, path-addressed edits — what a pack's declared facets dispatch
      // (`{ 'data.league.name': 'LaLiga', 'data.league.logo': '…' }`). It clones
      // only the nodes along each path, so untouched branches keep their
      // identity and <Player> does not remount the film on every dropdown.
      const next = applyPatch(state.document, action.patch);
      return next === state.document ? state : { ...state, document: next };
    }

    case 'setIssues': {
      const same =
        state.issues.length === action.issues.length &&
        state.issues.every((issue, i) => issue.message === action.issues[i]?.message);
      return same ? state : { ...state, issues: action.issues };
    }

    default:
      throw new Error(`EditorProvider: unknown action "${action.type}".`);
  }
};

export const EditorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, undefined, restore);

  useEffect(() => {
    const { issues, ...persisted } = state;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // Quota or private mode. Persistence is a convenience, never a
      // precondition — the editor must keep working without it.
    }
  }, [state]);

  const value = useMemo(
    () => ({ ...state, pack: packById(state.packId), dispatch }),
    [state],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) throw new Error('useEditor() was called outside an <EditorProvider>.');
  return context;
};
