# Architecture

Why the boundaries are where they are. If you only read one section, read
[The dependency rule](#the-dependency-rule) — it is the constraint everything
else follows from.

---

## The three rings

```
projects → templates → design → framework
```

Dependencies point **inward only**. The framework depends on nothing internal.

| Ring | Path | Contains | May import |
| --- | --- | --- | --- |
| 1 | `src/framework/` | Motion engine, timeline, layouts, components, camera, transitions, audio, formats, hooks, assets | Remotion, React |
| 2 | `src/design/` | Theme contract, tokens, brands, fonts | Ring 1 |
| 2.5 | `src/templates/` | 12 scene templates + `StandardFilm` | Ring 1 |
| 3 | `src/projects/` | One folder per video | Rings 1, 2, 2.5 |

**Templates sit beside design, not above it.** A template imports from
`@/framework` *only* — never from `design/`. That is what makes templates
theme-independent: they ask for `theme.colors.text.primary` through `useTheme()`
and get whatever brand is mounted. A template that imported the default theme
would work perfectly and be silently unusable for any other brand.

### The dependency rule

Ring 1 may not import Ring 2. This is not stylistic — it is what keeps the
framework extractable, and it has already changed a design decision:

> `validateTheme()` lives in `design/theme/contract.js` (Ring 2), and the plan
> originally called for `ThemeProvider` (Ring 1) to call it. That would have
> inverted the rule. Themes are instead validated where they are *defined* —
> which also turned out to be strictly better: it runs at import time, in every
> environment, and a broken brand fails when it is written rather than when it
> is first rendered.

If you find yourself wanting to import outward, the abstraction is in the wrong
ring.

---

## Two halves of the design system

Design tokens are split by *when they are needed*, and it is not arbitrary:

| | Motion tokens | Visual tokens |
| --- | --- | --- |
| Where | `framework/motion/` (Ring 1) | `design/theme/` (Ring 2) |
| How delivered | Static import | Runtime, via `useTheme()` |
| Examples | `curves`, `durations`, `stagger`, `springs` | colours, type, radii, shadows |

**Why:** the animation functions in `framework/animations/` are pure
`({frame, …}) => style` and contain no React. They cannot call a hook, so their
timing cannot come from a context. Motion tokens are therefore static.

The visual half *must* be runtime, because two brands can render in one tree —
the showcase's chapter 10 does exactly that, with a dark and a light brand side
by side.

The names collide, so the barrel disambiguates: `cameraTokens`,
`transitionTokens` and `ambientTokens` are the timing values;
`cameras`/`resolveCamera`, `resolveTransition` and `ambientPresets` are the
systems.

---

## The React boundary

```
animations/  pure ({frame, …}) => style     ← no React, directly testable
hooks/       the ONLY callers of useCurrentFrame()
components/  consume hooks
```

`useMotion`, `useStaggeredMotion`, `useAmbientMotion`, `useSceneProgress` and
`useCountUp` are the only places the frame is read. Everything below them is a
plain function of its arguments, which is why `npm test` can assert the motion
maths in plain Node with no bundler.

The keystone is **`mergeMotion`** (`framework/animations/merge.js`). It
concatenates transforms, *multiplies* opacities and joins filters. Object spread
would silently drop all but the last transform — so `{...fadeIn, ...riseIn}` is
a bug and `mergeMotion(fadeIn, riseIn)` is correct.

---

## Registries, not switch statements

Six vocabularies resolve by name: easings, entrance/exit/ambient presets,
cameras, transitions, timebases, atmosphere recipes.

All of them go through one helper — `framework/helpers/registry.js` — with one
policy:

```
a function        → passed through (the one-off escape hatch)
null / undefined  → the registry's documented default
a KNOWN name      → that entry
an UNKNOWN name   → throws, listing the known names
```

**Unknown names throw.** They used to fall back silently in three of the five
resolvers, which meant `preset="fadeIn"` (the entry is `fade`) rendered
successfully and wrong. In a motion system that is the most expensive class of
bug: nothing fails, the shot is subtly off, and you find out after delivery.
This caught a real typo during Phase 5 — `preset="scale"` threw immediately with
the list of real names.

Adding capability is adding an entry. See [EXTENDING.md](EXTENDING.md).

---

## Timeline: one source of truth for time

`buildTimeline(plan, { fps, timebase, transition })` turns a plan into
`{ scenes, byId, durationInFrames, pictureFrames, overlap, derived }`.

Two properties matter:

**Derive, don't accumulate.** Scene starts are computed from *absolute*
positions and rounded individually, so rounding error never compounds. A 20-scene
film at 145.57 BPM does not drift by the end.

**One overlap token.** The timeline and the transition registry share
`resolveOverlap`, so the gap the timeline leaves and the transition that fills it
cannot disagree. This is why `StandardFilm` lets a scene choose a transition
*type* but forces its *duration* — scene positions were computed against that
overlap, and a different length would slide every subsequent cut.

Timebases are a registry: `frames`, `seconds`, `bars`, or your own. See
[TIMELINE.md](TIMELINE.md).

---

## Responsive: layouts own reflow

Four buckets, derived from aspect ratio by `bucketFor(width, height)`:

| Bucket | Trigger | Formats |
| --- | --- | --- |
| `ultrawide` | aspect ≥ 2.2 | `ultrawide` (3840×1080) |
| `landscape` | aspect > 1.05 | `landscape` (1920×1080) |
| `square` | aspect ≥ 0.95 | `square` (1080×1080) |
| `portrait` | otherwise | `reel` (1080×1920), `exhibition` (2160×3840) |

**Scenes contain no per-format branching.** Every layout prop takes a scalar *or*
a per-bucket map, so reflow is data:

```jsx
<Stack gap={{ landscape: 40, vertical: 80 }}>
<Grid columns={{ ultrawide: 4, landscape: 3, portrait: 1 }}>
```

`Split` decides row-vs-column, `Grid` decides column count, `FullBleed` owns the
legibility scrim. This was the single largest gap in the reference
implementation, where layout primitives existed but every scene hand-rolled
`if (isVertical)` with its own constant tables.

Tokens are authored at 1920×1080 and scaled by `useFormat().px()`. Note that
vertical scales are deliberately **not** width-proportional — `reel` is `0.95`,
not `0.5625` — because phone type must stay readable. `exhibition` is `1.9`
(= 0.95 × 2) because it is exactly 2× `reel` at the same aspect.

---

## What is deliberately not here

A v1 is defined as much by what it declines to build:

- **No filesystem auto-registration of projects.** Remotion bundles statically;
  a glob-built dynamic import resolves in Studio and fails on a render farm.
- **No formal plugin manifest.** "A pack is a module exporting registry entries"
  is enough until two real packs exist.
- **No snapshot test suite.** Visual snapshots on a motion framework are noisy
  and high-maintenance; the showcase plus manual still review is the better trade
  at this size.
- **No monorepo tooling or npm extraction.** That waits for a second real
  consumer.
