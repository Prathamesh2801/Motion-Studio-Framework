/**
 * The adapter: this pack's document → the generic ViewModel.
 *
 * ── THE ONE JOB ─────────────────────────────────────────────────────────────
 * This is the ONLY file in the pack allowed to know the pack's vocabulary. Every
 * scene, component and animation downstream sees `subject`, `identity`,
 * `metrics`, `context` and nothing else — which is exactly why the same scenes
 * will render a footballer, a driver and a product without being touched.
 *
 * It is a pure function with no React and no frame, so `npm test` asserts it in
 * plain Node: the cheapest possible place to catch a mapping mistake.
 *
 * Keep it dumb. Anything clever here (deriving stats, formatting numbers,
 * picking layouts) is a decision that has escaped the data and will need to be
 * re-implemented in the next pack.
 */
export const toViewModel = (doc) => {
  const { subject, facts, figures, footnotes, accent } = doc.data;

  return {
    subject: {
      name: subject.name,
      shortName: subject.shortName,
      secondaryName: subject.tagline,
      badgeValue: subject.badge,
      role: subject.role,
      portrait: subject.portrait,
    },

    identity: facts.map((fact) => ({
      label: fact.label,
      value: fact.value,
      icon: fact.icon,
    })),

    // Straight pass-through: `figures` was designed to mirror the Metric shape,
    // so the mapping is identity. A real domain pack (football) does the actual
    // work here — turning `stats.goals` into `{ label: 'Goals', value: 73 }`.
    metrics: figures.map((figure) => ({
      label: figure.label,
      value: figure.value,
      max: figure.max,
      prefix: figure.prefix,
      suffix: figure.suffix,
      format: figure.format,
      decimals: figure.decimals,
      emphasis: figure.emphasis,
    })),

    context: footnotes.map((note) => ({ label: note.label, value: note.value })),

    assets: {},
    accent,
  };
};

export default toViewModel;
