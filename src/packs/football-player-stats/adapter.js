/**
 * football document → the generic ViewModel.
 *
 * ── THE BOUNDARY ────────────────────────────────────────────────────────────
 * This is the ONLY file in the repository allowed to contain the words "goals",
 * "assists", "club" or "jersey". Everything below it — `templates/`,
 * `framework/`, `engine/` — sees `subject`, `identity`, `metrics` and `context`
 * and cannot tell football from Formula 1. `npm test` enforces that by grepping
 * for this vocabulary outside this folder.
 *
 * That is what makes the next pack cheap: a cricket document with a different
 * adapter reuses `SubjectIntro`, `StatBoard` and `MetricSpotlight` unchanged.
 *
 * Pure — no React, no frame — so it is asserted in plain Node.
 *
 * ── KEEP IT DUMB ────────────────────────────────────────────────────────────
 * No formatting, no rounding, no layout choices. Every "clever" line here is a
 * decision that has escaped the data and will have to be re-implemented in the
 * next pack. The two judgements it *does* make are both structural rather than
 * cosmetic, and both are commented below.
 */
export const toViewModel = (doc) => {
  const { player, club, league, season, competition, stats } = doc.data;

  return {
    subject: {
      name: player.name,
      shortName: player.shortName,
      secondaryName: player.nickname,
      badgeValue: player.number,
      role: player.position,
      portrait: player.portrait,
    },

    // Order is display order: club, country, league. It reads the way a
    // commentator introduces a player — where they play, where they are from,
    // what competition this is.
    identity: [
      { id: 'club', label: 'Club', value: club.name, icon: club.logo },
      { id: 'nationality', label: 'Nation', value: player.nationality.name, icon: player.nationality.flag },
      { id: 'league', label: 'League', value: league.name, icon: league.logo },
    ],

    metrics: [
      { id: 'goals', label: 'Goals', value: stats.goals },
      { id: 'assists', label: 'Assists', value: stats.assists },
      { id: 'matches', label: 'Matches', value: stats.matches },
      { id: 'minutes', label: 'Minutes', value: stats.minutes, format: 'separated' },
      {
        id: 'rating',
        label: 'Average Rating',
        value: stats.rating,
        // The two structural judgements, and the only ones:
        //
        // `max` makes this a proportion rather than a tally, so it renders as a
        // bar on the board and an arc in the spotlight. A rating without its
        // ceiling is meaningless; a goal tally has no ceiling to draw.
        max: stats.ratingMax,
        // `hero` earns the spotlight beat — which also makes the film longer.
        // Structure follows data, and this is where that starts.
        emphasis: 'hero',
        format: 'decimal',
        decimals: 1,
      },
    ],

    context: [
      { id: 'season', label: 'Season', value: season },
      { id: 'competition', label: 'Competition', value: competition },
    ],

    assets: {},

    // The club colour becomes the film's accent unless the document overrides
    // it — which is how one brand serves every club without a theme file each.
    accent: club.color,
  };
};

export default toViewModel;
