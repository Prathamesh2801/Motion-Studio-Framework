import React, { useEffect, useRef, useState } from 'react';
import { useEditor } from '../state/EditorProvider.jsx';
import { Panel } from './ui.jsx';

/** How long typing must pause before the document is committed to the store. */
const COMMIT_DELAY_MS = 200;

/**
 * The raw document editor (Ring 4).
 *
 * Phase 2 ships the JSON surface rather than a generated form, deliberately: it
 * proves the actual claim — *replace the JSON object, get a different video* —
 * without a form layer standing in between. The schema-driven form lands in
 * Phase 3 and dispatches the same action.
 *
 * ── WHY THE LOCAL BUFFER AND THE DEBOUNCE ───────────────────────────────────
 * Two separate reasons, both load-bearing:
 *
 *   1. While you type, the text is usually not valid JSON. Committing on every
 *      keystroke would push a broken document into state constantly.
 *   2. Every commit changes `inputProps` identity, which makes <Player>
 *      re-resolve the composition. Doing that per character makes the preview
 *      stutter and restarts the animation mid-word.
 *
 * So: type freely into a local buffer, commit when it parses and typing pauses.
 */
export const JsonPanel = () => {
  const { document, issues, dispatch } = useEditor();

  const [text, setText] = useState(() => JSON.stringify(document, null, 2));
  const [syntaxError, setSyntaxError] = useState(null);
  const editing = useRef(false);
  const timer = useRef(null);

  // Re-sync when the document changes from ELSEWHERE (a subject click, the
  // theme picker). Skipped while the textarea has focus, or those panels would
  // yank the caret out of whatever is being typed.
  useEffect(() => {
    if (editing.current) return;
    setText(JSON.stringify(document, null, 2));
    setSyntaxError(null);
  }, [document]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onChange = (event) => {
    const next = event.target.value;
    setText(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        const parsed = JSON.parse(next);
        setSyntaxError(null);
        dispatch({ type: 'setDocument', document: parsed });
      } catch (error) {
        // Not committed, and not fatal — the stage keeps its last valid frame.
        setSyntaxError(error.message);
      }
    }, COMMIT_DELAY_MS);
  };

  return (
    <Panel title="Document">
      <textarea
        value={text}
        onChange={onChange}
        onFocus={() => {
          editing.current = true;
        }}
        onBlur={() => {
          editing.current = false;
        }}
        spellCheck={false}
        className="h-[42vh] w-full resize-none rounded-md border border-white/10 bg-black/40 p-3
                   font-mono text-[11px] leading-relaxed text-white/80 outline-none
                   focus:border-white/25"
      />

      {syntaxError ? (
        <p className="mt-2 rounded-md bg-red-500/10 px-2.5 py-1.5 text-[11px] text-red-300">
          {syntaxError}
        </p>
      ) : null}

      {issues.length ? (
        <ul className="mt-2 space-y-1 rounded-md bg-amber-500/10 px-2.5 py-2 text-[11px] text-amber-200">
          {issues.map((issue, index) => (
            <li key={`${issue.path}-${index}`}>
              {issue.path ? <code className="text-amber-300">{issue.path}</code> : null}{' '}
              {issue.message}
            </li>
          ))}
        </ul>
      ) : null}
    </Panel>
  );
};

export default JsonPanel;
