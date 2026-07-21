# Motion Studio Framework Status

The primary engineering status document for the framework. Update it at the end
of every phase — it is the fastest way for anyone (including a future you) to see
what exists, what is proven, and what is next.

---

## Framework Version

**0.4.0** — Phase 4 complete.

The minor version tracks phase completion during pre-1.0 architecture work
(`0.<phase>.<patch>`). 1.0 is reserved for the point at which the public API in
`src/framework/index.js` is considered stable.

---

## Architecture Status

| | Phase | Delivers |
| --- | --- | --- |
| ✅ | **Phase 0 — Scaffold** | Compiling skeleton, entry point, `@/` alias, Tailwind pipeline, render config |
| ✅ | **Phase 1 — Motion Engine** | Pure animations, presets, camera, hooks, formats, theme mechanism |
| ✅ | **Phase 2 — Design System** | Theme contract + default theme, theme-driven component library, `Scene` |
| ✅ | **Phase 3 — Timeline / Audio / Transitions** | Timeline strategy engine, transition registry, decoupled audio, `registerProject` |
| ✅ | **Phase 4 — Layouts & Templates** | Responsive layout primitives, 12 scene templates, `StandardFilm` skeleton |
| ⬜ | **Phase 5 — Demo Project / DX / Documentation** | First showcase project, scaffolder, theme→CSS codegen, full docs |
| ⬜ | *Phase 6 (later)* | Port the reference brand film to consume the framework |

---

## Completed Systems

Everything below is implemented, wired into the public barrel (`@/framework`)
and exercised by at least one rendered composition.

| System | Location | Notes |
| --- | --- | --- |
| **Motion Engine** | `framework/motion/` | Static timing tokens: curves, springs, durations, stagger, distances, ambient, camera, transitions |
| **Animation System** | `framework/animations/` | Pure `({frame,…}) => style` functions + `mergeMotion`; no React |
| **Preset Vocabulary** | `framework/presets/` | Named entrances / exits / ambient recipes + polymorphic resolver |
| **Camera System** | `framework/camera/` | Push, pull, pan, parallax, drift, seeded handheld, zoom + named registry |
| **Responsive Engine** | `framework/formats/`, `hooks/useFormat`, `hooks/useResponsive` | 4-way buckets (landscape/portrait/square/ultrawide), `px()` scaling, safe areas |
| **Theme System** | `framework/theme/` + `design/theme/` | Hybrid model: static motion tokens, runtime-injected visual theme via `useTheme()` |
| **Component Library** | `framework/components/` | primitives · typography · layers · content · branding — all brand-agnostic |
| **Layout Shell** | `framework/layouts/Scene.jsx` | Three-pass scene frame: atmosphere → content → film overlay |
| **Layout Primitives** | `framework/layouts/` | `Stack`, `Center`, `Split`, `Grid`, `FullBleed` — every sizing prop takes a per-bucket map |
| **Scene Templates** | `templates/scenes/` | 12 slot-driven templates; the primary authoring surface |
| **Composition Skeleton** | `templates/compositions/` | `StandardFilm` — timeline + scene map → film, transitions and music wired |
| **Timeline Engine** | `framework/timeline/` | `buildTimeline` + swappable timebase registry (`frames` / `seconds` / `bars` / custom) |
| **Audio Engine** | `framework/audio/` | Track-agnostic multi-segment edit with equal-power crossfades |
| **Transition Registry** | `framework/transitions/` | Named vocabulary over `@remotion/transitions`, sharing the timeline's overlap token |
| **Render Helper** | `framework/render/` | `registerProject` — one declaration → one composition per format, theme-wrapped |

---

## Current Verification

| | Check | How |
| --- | --- | --- |
| ✅ | Studio launches | `npm run studio` |
| ✅ | Compositions register with derived durations | `npm run compositions` |
| ✅ | Landscape compositions render | Stills across all demo projects |
| ✅ | Portrait compositions render | Stills across all demo projects; reflow confirmed visually |
| ✅ | Timeline tests | `npm test` — 20 assertions, pure Node |
| ✅ | Non-musical demo | `ExplainerDemo` (`seconds` timebase) — 470 frames, matches `3.5+4+4+3.5s + 20` |
| ✅ | Musical demo | `MusicalDemo` (`bars` timebase) — 560 frames, matches `9 bars × 60f + 20` |
| ✅ | MP4 rendering | Full renders of both demos |
| ✅ | Audio encoding | `MusicalDemo` MP4 carries a real AAC stream at 18.71s |
| ✅ | Theme injection | Component library renders entirely from `useTheme()` |
| ✅ | All 5 layout primitives — landscape | `LayoutsDemo`, one scene per primitive |
| ✅ | All 5 layout primitives — portrait | Same scenes; Grid 3→1, Split row→stack, Stack row→column confirmed |
| ✅ | All 12 scene templates | `TemplateDemo` — a 48s film with no hand-written scenes |
| ✅ | Per-scene transition overrides | Full `TemplateDemo` render exercises `fade`, `wipe` and `slide` |
| ⬜ | Ultrawide / exhibition formats | Defined and bucketed, not yet visually reviewed |
| ⬜ | Unit tests beyond the timeline | `animations/` is pure and testable; not yet covered |

### Verification method

There is no snapshot suite — **verify visually**. A still takes seconds; a full
render takes minutes. Render stills at representative frames of each scene and
read them. **Always check a portrait format too**, because layouts reflow per
format and only landscape tends to get looked at.

---

## Authoring a video

The workflow Phase 4 establishes. A project is a timeline (data), a scene map
(templates) and its content — no scene components, no layout maths, no frame
offsets:

```jsx
const timeline = buildTimeline(SCENE_PLAN, { fps, timebase: 'seconds', transition: 'base' });

<StandardFilm
  timeline={timeline}
  scenes={{
    title: <TitleScene title="…" subtitle="…" />,
    stats: <StatisticsScene title="…" stats={STATS} />,
    outro: <OutroScene brandName="…" website="…" />,
  }}
/>
```

Re-ordering the film means re-ordering `SCENE_PLAN`. Every beat reflows across
all four format buckets on its own.

---

## Next Milestone

**Phase 5 — Demo Project / DX / Documentation.**

The first real showcase project, a `create-project` scaffolder, the
`theme → tailwind.css` codegen that removes the hand-sync drift hazard, generic
asset-verification tooling, and the full documentation pass.

Phase 4 closed the single largest gap found in the original architecture audit:
in the reference implementation the layout primitives existed but were bypassed,
and every scene hand-rolled its own per-format reflow with bespoke constant
tables. Reflow is now decided once, by the layout.

---

## Long-Term Vision

> A reusable Remotion Motion Studio Framework capable of producing product
> showcases, explainers, documentaries, educational videos, motion graphics, game
> cinematics, brand films, reels and future video formats from one architecture.

The framework holds to a strict dependency direction:

```
projects → design → framework        (framework depends on nothing internal)
```

New capability arrives as **registry entries or plugins**, never as changes to
the engine: a new animation, preset, camera move, transition, atmosphere recipe,
timebase strategy or scene template is an addition, not a rewrite. That is what
lets video categories which do not exist yet be supported without restructuring
the project.
