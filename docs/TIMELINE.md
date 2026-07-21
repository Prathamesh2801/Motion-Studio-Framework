# Timeline

How a scene plan becomes frames, and how to add a way of expressing time.

---

## `buildTimeline`

```js
const timeline = buildTimeline(SCENE_PLAN, {
  fps,
  timebase: 'seconds',   // 'frames' | 'seconds' | 'bars' | a strategy object
  transition: 'base',    // token name or a frame count
  ...strategyOptions,    // anything else goes to the strategy (e.g. `grid`)
});
```

Returns:

| Field | Meaning |
| --- | --- |
| `scenes[]` | `{ ...scene, index, from, advance, durationInFrames, meta }` |
| `byId` | The same scenes keyed by id |
| `durationInFrames` | Total composition length, **including** the final transition tail |
| `pictureFrames` | Picture length before that tail — use when reasoning about sync |
| `overlap` | Transition length in frames |
| `fps`, `timebase` | Echoed back |
| `derived` | Strategy extras, e.g. `musicCuts` on `bars` |

### `advance` vs `durationInFrames`

A scene's `durationInFrames` is `advance + overlap`. It runs *longer* than it
advances the playhead, because the next scene starts during its tail — that is
what a crossfade is. `TransitionSeries` expects exactly this.

### Derive, don't accumulate

Scene starts are computed from **absolute** positions and rounded individually,
never by summing rounded lengths. Over a 20-scene film on a non-integer grid
(145.57 BPM, say), accumulating would drift by several frames; deriving does not.
This is asserted in `npm test`.

---

## The three built-in timebases

### `frames` — the primitive
```js
{ id: 'beat', frames: 90 }
```
Everything compiles down to this. Use when you need exact control.

### `seconds` — the default
```js
{ id: 'beat', seconds: 3.5 }
```
Right for explainers, promos, social cuts — anything paced by copy rather than a
track.

### `bars` — a rhythmic lattice
```js
buildTimeline(
  [
    { id: 'open',  bars: 2 },
    { id: 'build', bars: 4, sourceBar: 8 },  // splice the music here
  ],
  { fps, timebase: 'bars', grid: createBarGrid({ bpm: 120, downbeatSeconds: 0.5 }) },
);
```

**Music is optional.** `bars` is a grid, not an audio feature — it is equally
useful for cutting to an implied rhythm with no soundtrack at all. If no scene
declares `sourceBar`, `derived.musicCuts` is empty and nothing else changes.

`createBarGrid({ bpm, beatsPerBar = 4, downbeatSeconds = 0 })` — `downbeatSeconds`
is where the first downbeat lands; anything before it is pickup the film opens
over.

`sourceBar` means "at this beat, splice the source material from *its* bar N",
which is how a 30-second track scores a 90-second film. Splices must land on
phrase boundaries; the strategy throws if they do not.

---

## Transitions

`transition` accepts a motion token name or a frame count:

| Token | Frames @30fps |
| --- | --- |
| `cut` | 0 |
| `quick` | 12 |
| `base` | 20 |
| `slow` | 34 |

The timeline and the transition registry share **one** `resolveOverlap`, so the
gap the timeline leaves and the transition that fills it cannot disagree.

This is why a scene may choose a transition *type* but not its *duration* — scene
positions were computed against that overlap, and a different length would slide
every subsequent cut.

---

## Validation

Plans are checked at build time. Each of these throws with a readable message,
and each is asserted in `npm test`:

- an empty plan
- duplicate scene ids
- a scene missing the field its timebase needs
- a non-finite or non-positive length
- a `bars` plan with no grid
- a splice that is not on a phrase boundary
- a scene running past the end of the source material
- an unknown timebase name (listing the known ones)

---

## Writing a custom timebase

A strategy is a plain object. **Only `lengthOf` is required**; every other hook
is an opt-in refinement, so a simple strategy stays a two-line object.

```js
const strategy = {
  /** Required. Length of one scene, in frames. */
  lengthOf: (scene, { fps, options }) => Math.round(scene.beats * options.beatFrames),

  /** Optional. Absolute start frame per scene. */
  startsOf: (plan, ctx) => [...],

  /** Optional. Exact total picture length. */
  totalOf: (plan, ctx) => 900,

  /** Optional. Throw on a plan this timebase cannot express. */
  validate: (plan, ctx) => {},

  /** Optional. Extra per-scene metadata, surfaced as `scene.meta`. */
  metaOf: (scene, index, ctx) => ({ bar: index * 4 }),

  /** Optional. Timeline-level outputs, surfaced as `derived`. */
  derive: (plan, ctx, starts) => ({ musicCuts: [] }),
};
```

`ctx` is `{ fps, options }`, where `options` is whatever you passed to
`buildTimeline` beyond the known keys — the strategy's own configuration.

**Override `startsOf` when lengths must not be accumulated.** A grid-locked
timebase rounds each start from its own absolute position so error never
compounds. Omit it and the engine accumulates, which is exact for integers.

Scenes carry arbitrary extra fields through untouched, so a richer or semantic
plan needs no engine change.

### Using one

Inline, without registering:

```js
buildTimeline(plan, { fps, timebase: strategy });
```

Or globally by name:

```js
import { registerTimebase } from '@/framework';
registerTimebase('voiceover', strategy);
buildTimeline(plan, { fps, timebase: 'voiceover' });
```

---

## The voiceover seam

Narration is **not implemented**. The extension points exist so it can be added
without restructuring:

1. **A `voiceover` timebase** — `lengthOf` reads a cue list, so scene lengths
   derive from narration timing rather than being hand-guessed.
2. **A `voice` layer** alongside `Soundtrack`, following the same shape.
3. **A gain input on the music bed**, so the bed can duck under speech.

Adding narration later is a registry entry plus one component. Building it now,
before anyone knows whether the first film is narrated, would be speculative.
