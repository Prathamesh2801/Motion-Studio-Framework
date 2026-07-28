/**
 * The pack's editable facets — the dropdowns the application shows.
 *
 * ── WHY THIS LIVES IN THE PACK ──────────────────────────────────────────────
 * The application needs a League dropdown, a Season dropdown and a Competition
 * dropdown. The editor must not know what a league IS — the moment it does, it
 * is a football editor and the cricket pack needs a second one.
 *
 * So a pack DECLARES its facets and the editor renders whatever it finds: a
 * label, and a set of options that each patch one or more document paths. The
 * editor reads `pack.facets`, draws a `<select>` per entry, and dispatches the
 * chosen patch. It never learns a domain word, and a new pack gets working
 * dropdowns without a line of editor code.
 *
 * Each option carries a `patch` rather than a bare value because these choices
 * are compound: picking a league changes its name AND its logo, and a control
 * that changed only the name would leave the previous league's badge on screen —
 * a wrong frame that still renders, which is the failure class this codebase
 * refuses everywhere else.
 */
export const facets = [
  {
    id: 'league',
    label: 'League',
    options: [
      { id: 'laliga', label: 'LaLiga', patch: { 'data.league.name': 'LaLiga', 'data.league.country': 'Spain', 'data.league.logo': 'leagues/laliga.svg' } },
      { id: 'premier', label: 'Premier League', patch: { 'data.league.name': 'Premier League', 'data.league.country': 'England', 'data.league.logo': 'leagues/premier-league.svg' } },
      { id: 'ligue1', label: 'Ligue 1', patch: { 'data.league.name': 'Ligue 1', 'data.league.country': 'France', 'data.league.logo': 'leagues/ligue-1.svg' } },
      { id: 'spl', label: 'Saudi Pro League', patch: { 'data.league.name': 'Saudi Pro League', 'data.league.country': 'Saudi Arabia', 'data.league.logo': 'leagues/saudi-pro-league.svg' } },
      { id: 'mls', label: 'Major League Soccer', patch: { 'data.league.name': 'Major League Soccer', 'data.league.country': 'United States', 'data.league.logo': 'leagues/ucl.svg' } },
    ],
  },
  {
    id: 'season',
    label: 'Season',
    options: ['2021/22', '2022/23', '2023/24', '2024/25', '2025/26'].map((season) => ({
      id: season,
      label: season,
      patch: { 'data.season': season },
    })),
  },
  {
    id: 'competition',
    label: 'Competition',
    options: [
      'All competitions',
      'League',
      'UEFA Champions League',
      'Domestic Cup',
      'International',
    ].map((competition) => ({
      id: competition,
      label: competition,
      patch: { 'data.competition': competition },
    })),
  },
];

export default facets;
