import React from 'react';
import { FORMATS } from '@/framework';
import { PACKS } from '@/packs/registry.js';
import { brandLabel, brandNames } from '@/packs/theme.js';
import { patchMatches } from '@/engine';
import { useEditor } from '../state/EditorProvider.jsx';
import { Panel, Field, Select } from './ui.jsx';

/**
 * The control rail (Ring 4) — every dropdown the application offers.
 *
 * ── HOW THIS STAYS DOMAIN-FREE ──────────────────────────────────────────────
 * Four of these controls are generic: pack, subject, theme, format. The rest —
 * League, Season, Competition — are rendered from `pack.facets`, a declarative
 * list the PACK owns. This file draws a `<select>` for whatever it finds and
 * dispatches the option's patch. It contains no football vocabulary, so a
 * cricket pack declaring `{ id: 'format', label: 'Format', options: [...] }`
 * gets a working dropdown with no change here.
 *
 * Selection state is read back OFF THE DOCUMENT via `patchMatches`, never
 * stored alongside it. One source of truth means a dropdown cannot drift from
 * what is actually on screen — including after a raw edit in the JSON panel,
 * which these controls then reflect automatically.
 */
export const Controls = () => {
  const { pack, document, format, dispatch } = useEditor();
  const theme = document.theme ?? {};

  return (
    <>
      <Panel title="Template">
        <Field label="Pack">
          <Select
            value={pack.id}
            onChange={(event) => dispatch({ type: 'selectPack', packId: event.target.value })}
          >
            {PACKS.map((entry) => (
              <option key={entry.id} value={entry.id} className="bg-slate-900">
                {entry.title}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={pack.subjectLabel ?? 'Subject'}>
          <Select
            value={document.id}
            onChange={(event) => {
              const next = pack.samples.find((sample) => sample.id === event.target.value);
              if (next) dispatch({ type: 'selectSample', document: next });
            }}
          >
            {pack.samples.map((sample) => (
              <option key={sample.id} value={sample.id} className="bg-slate-900">
                {sample.title ?? sample.id}
              </option>
            ))}
          </Select>
        </Field>
      </Panel>

      {pack.facets?.length ? (
        <Panel title="Context">
          {pack.facets.map((facet) => {
            // The document is the selection. `find` returns undefined when the
            // document holds a value no option covers (hand-edited JSON), and
            // the empty `value` leaves the select blank rather than lying about
            // which option is active.
            const active = facet.options.find((option) => patchMatches(document, option.patch));
            return (
              <Field key={facet.id} label={facet.label}>
                <Select
                  value={active?.id ?? ''}
                  onChange={(event) => {
                    const chosen = facet.options.find((o) => o.id === event.target.value);
                    if (chosen) dispatch({ type: 'patchPaths', patch: chosen.patch });
                  }}
                >
                  {active ? null : (
                    <option value="" className="bg-slate-900">
                      — custom —
                    </option>
                  )}
                  {facet.options.map((option) => (
                    <option key={option.id} value={option.id} className="bg-slate-900">
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>
            );
          })}
        </Panel>
      ) : null}

      <Panel title="Presentation">
        <Field label="Theme">
          <Select
            value={theme.brand ?? 'default'}
            onChange={(event) =>
              dispatch({
                type: 'patchDocument',
                patch: { theme: { ...theme, brand: event.target.value } },
              })
            }
          >
            {brandNames().map((name) => (
              <option key={name} value={name} className="bg-slate-900">
                {brandLabel(name)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Aspect ratio">
          <Select
            value={format}
            onChange={(event) => dispatch({ type: 'setFormat', format: event.target.value })}
          >
            {pack.formats.map((id) => (
              <option key={id} value={id} className="bg-slate-900">
                {`${FORMATS[id].label} — ${FORMATS[id].width}x${FORMATS[id].height}`}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Pace">
          <Select
            value={document.timing?.pace ?? 'normal'}
            onChange={(event) =>
              dispatch({ type: 'patchDocument', patch: { timing: { pace: event.target.value } } })
            }
          >
            {['tight', 'normal', 'relaxed'].map((pace) => (
              <option key={pace} value={pace} className="bg-slate-900">
                {pace}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Accent override">
          <div className="flex gap-2">
            <input
              type="color"
              value={theme.accent ?? '#6366f1'}
              onChange={(event) =>
                dispatch({
                  type: 'patchDocument',
                  patch: { theme: { ...theme, accent: event.target.value } },
                })
              }
              className="h-[34px] w-10 shrink-0 cursor-pointer rounded-md border border-white/10 bg-white/5"
            />
            <button
              type="button"
              onClick={() =>
                dispatch({ type: 'patchDocument', patch: { theme: { ...theme, accent: null } } })
              }
              className="flex-1 rounded-md border border-white/10 bg-white/5 px-2.5 text-xs text-white/55 transition hover:bg-white/10 hover:text-white/90"
            >
              {/* Not "club colour" — the accent comes from whatever the pack's
                  adapter put on `vm.accent`, which is a team, a brand or a
                  product line depending on the pack. */}
              {theme.accent ? 'Clear override' : 'Colour from data'}
            </button>
          </div>
        </Field>
      </Panel>
    </>
  );
};

export default Controls;
