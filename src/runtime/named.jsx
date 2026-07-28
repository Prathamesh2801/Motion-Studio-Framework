import React, { forwardRef } from 'react';
import { MotionTemplate } from './MotionTemplate.jsx';

/**
 * Named template components (Ring 5).
 *
 * `<PlayerStatsTemplate data={player} />` is the same thing as
 * `<MotionTemplate template="football-player" data={player} />`, with the
 * template baked in.
 *
 * ── WHY BOTH FORMS EXIST ────────────────────────────────────────────────────
 * They serve different callers. A page that renders one known template wants a
 * component with a name — it reads as ordinary React, the import fails loudly at
 * build time if the template is gone, and there is no string to typo. A page
 * that renders whichever template a CMS names wants the string form.
 *
 * Neither wraps the other in behaviour; the named form only pins `template`.
 */
const named = (templateName, displayName) => {
  const Component = forwardRef((props, ref) => (
    <MotionTemplate {...props} template={templateName} ref={ref} />
  ));
  Component.displayName = displayName;
  return Component;
};

/**
 * Football player statistics.
 *
 *   <PlayerStatsTemplate data={player} />
 *   <PlayerStatsTemplate data={player} format="reel" theme="terrace" />
 *
 * `data` is either the pack's payload (`{ player, club, league, season,
 * competition, stats }`) or a full document.
 */
export const PlayerStatsTemplate = named('football-player-stats', 'PlayerStatsTemplate');

/**
 * The domain-free subject card — a subject, some facts, some figures.
 * Useful for product specs, quarterly numbers, or anything not yet a pack.
 */
export const SubjectShowcaseTemplate = named('subject-showcase', 'SubjectShowcaseTemplate');
