import { migrateDocument } from './schema/document.js';

/**
 * Non-throwing validation (Ring 2.5) — the editor's half of the contract.
 *
 * The render path SHOULD throw: a bad document must never quietly produce a
 * plausible-but-wrong MP4. The editor must not. Halfway through typing a
 * player's name, a document is invalid by definition, and a thrown error there
 * unmounts the preview and throws away the frame the user was looking at.
 *
 * So there are two doors into the same schema:
 *   `normalizeDocument()`  throws — used by the resolver and the renderer.
 *   `validateDocument()`   returns issues — used by the editor, which keeps
 *                          rendering the last valid document and shows the
 *                          problem on the offending field.
 */

/** Flatten a zod error into `{ path, message }`, path dotted for field lookup. */
export const explainIssues = (error) =>
  (error?.issues ?? []).map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));

/** Human-readable multi-line form, for thrown errors and the console. */
export const formatIssues = (issues) =>
  issues.map(({ path, message }) => `  - ${path || '(root)'}: ${message}`).join('\n');

/**
 * @returns {{ok: boolean, data: object|null, issues: Array<{path,message}>}}
 */
export const validateDocument = (document, schema) => {
  let migrated;
  try {
    migrated = migrateDocument(document);
  } catch (error) {
    return { ok: false, data: null, issues: [{ path: '$schema', message: error.message }] };
  }

  const result = schema.safeParse(migrated);
  return result.success
    ? { ok: true, data: result.data, issues: [] }
    : { ok: false, data: null, issues: explainIssues(result.error) };
};

/** Issues that apply to one field path — what a form input renders under itself. */
export const issuesFor = (issues, path) => issues.filter((issue) => issue.path === path);
