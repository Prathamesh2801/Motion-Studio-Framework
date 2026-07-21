/**
 * Content for the template demo — plain data, no JSX.
 *
 * This is the shape a real project takes: copy and lists live here, templates
 * arrange them, and nothing in the scene layer owns text.
 */

/** A gradient placeholder as a data URI, so the demo ships no binary assets. */
export const placeholder = (label, from, to) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/>
    </linearGradient></defs>
    <rect width="1200" height="900" fill="url(#g)"/>
    <text x="60" y="840" font-family="monospace" font-size="46" fill="rgba(255,255,255,0.62)">${label}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const FEATURES = [
  { id: 'compose', title: 'Composable', detail: 'Templates arrange framework components; nothing is duplicated.' },
  { id: 'responsive', title: 'Responsive', detail: 'One authoring pass reflows across all four format buckets.' },
  { id: 'themed', title: 'Themeable', detail: 'Visual tokens arrive at runtime, so any brand renders the same scene.' },
];

export const STATS = [
  { id: 'templates', value: 12, label: 'Scene templates' },
  { id: 'layouts', value: 5, label: 'Layout primitives' },
  { id: 'buckets', value: 4, label: 'Format buckets' },
  { id: 'timebases', value: 3, label: 'Timebases' },
];

export const MILESTONES = [
  { id: 'p1', label: 'Phase 1', title: 'Motion engine', detail: 'Pure animations, presets, camera.' },
  { id: 'p2', label: 'Phase 2', title: 'Design system', detail: 'Runtime theming, component library.' },
  { id: 'p3', label: 'Phase 3', title: 'Timeline', detail: 'Swappable timebases, transitions, audio.' },
  { id: 'p4', label: 'Phase 4', title: 'Templates', detail: 'Layouts and the authoring surface.' },
];

export const GALLERY = [
  { id: 'a', src: placeholder('01 — atmosphere', '#4338ca', '#0d0f16'), caption: 'Atmosphere layers' },
  { id: 'b', src: placeholder('02 — motion', '#0891b2', '#0d0f16'), caption: 'Motion presets' },
  { id: 'c', src: placeholder('03 — layout', '#7c3aed', '#0d0f16'), caption: 'Responsive layouts' },
];
