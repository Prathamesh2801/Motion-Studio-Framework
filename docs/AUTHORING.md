# Authoring a video

The main guide. Start here if you are making a film.

---

## The model

A video is three separable things:

| | What | Where |
| --- | --- | --- |
| **Structure** | Which beats, in what order, how long | `timeline.js` |
| **Content** | The words and data | `content.js` |
| **Assembly** | Which template plays each beat | `index.jsx` |

Keeping them apart is what makes a film editable. Re-pacing is a number change;
re-ordering is an array move; re-wording never touches structure.

---

## 1. Scaffold

```bash
npm run create-project -- from-idea-to-reality --title "From Idea to Reality"
```

This writes `src/projects/from-idea-to-reality/` with a **film that renders
immediately** — three real beats, not a skeleton of TODOs — plus
`public/projects/from-idea-to-reality/{images,video,music}/`, and prints the
entry to paste into `src/projects/registry.js`.

Paste it, then `npm run studio`.

### Why you paste the registry entry by hand

The scaffolder deliberately does not edit `registry.js`. Splicing code in with a
regex works until someone reformats the file, and it hides the one thing worth
learning early: **projects are declared in one explicit list**, because Remotion
bundles statically and a filesystem glob would fail on a render farm.

---

## 2. Structure — `timeline.js`

```js
import { buildTimeline } from '@/framework';

export const SCENE_PLAN = [
  { id: 'title', seconds: 4 },
  { id: 'point', seconds: 5 },
  { id: 'outro', seconds: 4 },
];

export const filmTimeline = (fps) =>
  buildTimeline(SCENE_PLAN, { fps, timebase: 'seconds', transition: 'base' });

export const filmDuration = (fps) => filmTimeline(fps).durationInFrames;
```

`seconds` suits copy-paced video. Use `bars` for music-locked cutting, `frames`
for exact control, or register your own — see [TIMELINE.md](TIMELINE.md).

**Never write a frame number by hand.** Positions, total length and the
transition overlap are all derived, which is why changing one beat's length never
means recalculating the beats after it. `filmDuration` is what
`registry.js` passes as `duration`, so the timeline stays the single source of
truth for how long the film is.

The plan validates at build time: duplicate ids, a missing length field, or a
scene running past its material all throw with a readable message.

---

## 3. Content — `content.js`

Plain objects. No JSX, no imports from the framework:

```js
export const COPY = {
  kicker: 'From Idea to Reality',
  title: 'Say the one thing\nthis film is about.',
  subtitle: 'A sentence that earns the next four seconds.',
};

export const STATS = [
  { label: 'Scene templates', value: 12 },
  { label: 'Layout primitives', value: 5 },
];
```

Separating content means the same scenes can be driven by a second language or a
client variant with no code change.

`\n` in a title is respected — `Text` sets `white-space: pre-wrap`
(`framework/components/typography/Text.jsx`), so you control line breaks rather
than hoping the measure cooperates.

---

## 4. Assembly — `index.jsx`

```jsx
import React from 'react';
import { useVideoConfig } from 'remotion';
import { StandardFilm, TitleScene, StatisticsScene, OutroScene } from '@/templates';
import { filmTimeline, filmDuration } from './timeline.js';
import { COPY, STATS } from './content.js';

export const Film = () => {
  const { fps } = useVideoConfig();

  return (
    <StandardFilm
      timeline={filmTimeline(fps)}
      transition="fade"
      scenes={{
        title: <TitleScene kicker={COPY.kicker} title={COPY.title} subtitle={COPY.subtitle} />,
        point: <StatisticsScene eyebrow="Surface area" title="One architecture." stats={STATS} />,
        outro: <OutroScene brandName="…" website="…" />,
      }}
    />
  );
};

export { filmDuration };
```

The keys of `scenes` must match the `id`s in `SCENE_PLAN`. A missing one throws
by name and lists the ids the timeline has.

### `StandardFilm` props

| Prop | Meaning |
| --- | --- |
| `timeline` | Built timeline. Required. |
| `scenes` | `{ [id]: element \| component }`. Required. |
| `transition` | Default transition type. Default `'fade'`. |
| `soundtrack` | `{ src, gain?, fades? }` — mounts a `Soundtrack`. |
| `children` | Anything overlaid on the whole film (a watermark, a lower third). |

### Per-scene transitions

A beat may override the transition **type** on its plan entry:

```js
{ id: 'quote', seconds: 4, transition: 'wipe' }
```

but not its **duration**. Scene positions were computed against the timeline's
overlap; a transition of a different length would slide every subsequent cut.
Type is free, duration is derived.

Available: `none`, `fade`, `slide`, `wipe`, `flip`.

---

## 5. Assets

Never write a raw `staticFile()` path. Use a project-scoped resolver:

```js
import { assetsFor } from '@/framework';
export const asset = assetsFor('from-idea-to-reality');

asset.image('hero.png');    // projects/from-idea-to-reality/images/hero.png
asset.music('score.wav');   // projects/from-idea-to-reality/music/score.wav
asset('luts', 'warm.png');  // an unknown kind becomes the directory verbatim
```

Scoping per project means two films can both have a `logo.png` without a naming
convention, and deleting a project is deleting one directory.

Kinds: `image`, `video`, `music`, `voice`, `sfx`, `font`, `texture`, `brand`.

---

## 6. Music

```jsx
<StandardFilm
  timeline={timeline}
  soundtrack={{ src: asset.music('score.wav') }}
  scenes={{ … }}
/>
```

The bed fades in and out, and sits at `gain` 0.18 by default to leave headroom.

On the `bars` timebase, the timeline emits `derived.musicCuts` and the soundtrack
splices the track at those points with **equal-power crossfades** — sine/cosine
legs that sum to constant power, avoiding the ~3 dB dip a linear crossfade
produces. `StandardFilm` wires this for you.

Everything is silent-safe: omit `soundtrack` and nothing else changes.

---

## 7. Verify

```bash
npm run verify
```

Runs the tests, checks the generated Tailwind theme is in sync, resolves every
composition, and renders 18 stills across landscape, portrait, ultrawide and
exhibition. Add `-- --full` for a complete MP4.

For your own film, render stills at representative frames of each beat and *look
at them*, in **both** a landscape and a vertical format:

```bash
npm run still -- Film-Landscape out/beat-2.png --frame=140
npm run still -- Film-Reel out/beat-2-v.png --frame=140
```

Portrait is where per-format bugs live, and it is the format nobody checks.

---

## Common mistakes

**Writing frame numbers.** If you are computing `from` or adding up durations,
the timeline should be doing it.

**Branching on format inside a scene.** `if (isVertical)` in a scene means a
layout prop is missing a per-bucket map. Layouts own reflow — see
[BEST_PRACTICES.md](BEST_PRACTICES.md).

**Hardcoding a pixel value.** Wrap every dimension in `px()` from `useFormat()`
or it will not scale across formats.

**Double-animating.** If a parent `Stagger` or `Reveal` owns the entrance, the
child needs `preset="none"` — otherwise both fire.
