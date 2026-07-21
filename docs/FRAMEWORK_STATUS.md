# Motion Studio Framework Status

The primary engineering status document. Update it at the end of every phase — it
is the fastest way for anyone (including a future you) to see what exists, what
is proven, and what is next.

---

## Framework Version

**1.0.0** — Phase 5 complete. The public API in `src/framework/index.js` is
considered stable.

Pre-1.0 versions tracked phase completion (`0.<phase>.<patch>`). From here,
semver applies to the public barrel: a breaking change to it is a major.

---

## Architecture Status

| | Phase | Delivers |
| --- | --- | --- |
| ✅ | **Phase 0 — Scaffold** | Compiling skeleton, entry point, `@/` alias, Tailwind pipeline, render config |
| ✅ | **Phase 1 — Motion Engine** | Pure animations, presets, camera, hooks, formats, theme mechanism |
| ✅ | **Phase 2 — Design System** | Theme contract + default theme, theme-driven component library, `Scene` |
| ✅ | **Phase 3 — Timeline / Audio / Transitions** | Timeline strategy engine, transition registry, decoupled audio, `registerProject` |
| ✅ | **Phase 4 — Layouts & Templates** | Responsive layout primitives, 12 scene templates, `StandardFilm` |
| ✅ | **Phase 5 — v1 Foundation** | API freeze, asset + font pipelines, brands, showcase, torture test, DX tooling, docs |
| ⬜ | *Phase 6 (later)* | Port the reference brand film to consume the framework |

---

## Completed Systems

Everything below is implemented, exported from `@/framework` (or `@/design` /
`@/templates`) and exercised by at least one rendered composition.

| System | Location | Notes |
| --- | --- | --- |
| **Motion Engine** | `framework/motion/` | Static timing tokens: curves, springs, durations, stagger, distances, ambient, camera, transitions |
| **Animation System** | `framework/animations/` | Pure `({frame,…}) => style` + `mergeMotion`; no React |
| **Preset Vocabulary** | `framework/presets/` | 13 entrances · 5 exits · 6 ambient, all name-resolved |
| **Camera System** | `framework/camera/` | `static` `push` `pushIn` `pull` `pan` `drift` `handheld` + `registerCamera` |
| **Registry Idiom** | `framework/helpers/registry.js` | One resolver policy for all six vocabularies; unknown names throw |
| **Responsive Engine** | `framework/formats/`, `hooks/useFormat`, `hooks/useResponsive` | 4 buckets, `px()` scaling, safe areas |
| **Theme System** | `framework/theme/` + `design/theme/` | Static motion tokens + runtime visual theme; executable contract |
| **Brand System** | `design/brands/` | `extendTheme` + `validateTheme`; `editorial` proves it |
| **Font System** | `design/fonts/` | 6 curated faces, `delayRender`-gated, family names asserted against loaders |
| **Asset Pipeline** | `framework/assets/` | `assetsFor(project)`, per-project scoping over `staticFile` |
| **Component Library** | `framework/components/` | primitives · typography · layers · content · branding |
| **Layout Primitives** | `framework/layouts/` | `Scene` `Stack` `Center` `Split` `Grid` `FullBleed` — every sizing prop takes a per-bucket map |
| **Scene Templates** | `templates/scenes/` | 12 slot-driven templates; the primary authoring surface |
| **Composition Skeleton** | `templates/compositions/` | `StandardFilm` — timeline + scene map → film |
| **Timeline Engine** | `framework/timeline/` | `buildTimeline` + swappable timebases (`frames`/`seconds`/`bars`/custom) |
| **Audio Engine** | `framework/audio/` | Track-agnostic multi-segment edit, equal-power crossfades |
| **Transition Registry** | `framework/transitions/` | `none` `fade` `slide` `wipe` `flip` + `registerTransition` |
| **Render Helper** | `framework/render/` | `registerProject` — one declaration → one composition per format |
| **Project Registry** | `projects/registry.js` | Every project declared once; `Root.jsx` is a map over it |
| **Tooling** | `scripts/` | `verify` · `create-project` · `theme-to-css` · `test` · `make-test-track` |

---

## Current Verification

| | Check | How |
| --- | --- | --- |
| ✅ | Unit tests | `npm test` — 42 assertions, pure Node, no runner |
| ✅ | Health check | `npm run verify` — 21 checks in ~2.5 min |
| ✅ | Theme ↔ CSS in sync | `npm run theme:check`, enforced by `verify` |
| ✅ | All 22 compositions resolve | `npm run compositions` |
| ✅ | Landscape rendering | Stills across every project |
| ✅ | Portrait rendering | Same; reflow confirmed visually |
| ✅ | **Ultrawide (3840×1080)** | `TortureTest-Ultrawide` — first visual review in Phase 5 |
| ✅ | **Exhibition (2160×3840)** | `TortureTest-Exhibition` — surfaced and fixed a wrong `scale` |
| ✅ | Nested timelines | Showcase ch. 8 — a `bars` film inside a `seconds` film |
| ✅ | Nested theme providers | Showcase ch. 10 — two brands in one tree, simultaneously |
| ✅ | Brand independence | `TemplateDemoEditorial` — same film, opposite brand |
| ✅ | Font loading | Real webfonts render; `delayRender` gates frame 0 |
| ✅ | Audio encoding | AAC 48 kHz stereo, duration matches the timeline |
| ✅ | Camera determinism | Seeded `handheld` renders byte-identically twice |
| ✅ | Error paths | Missing scene id, unknown timebase, malformed theme, duplicate ids — all readable |
| ✅ | Robustness | Long text, empty slots, 1-item and 40-item grids, one-frame scenes |
| ✅ | Scaffolder | `create-project` → rendering film, verified end to end |
| ⬜ | Server-side / Lambda rendering | Not exercised |
| ⬜ | Codecs beyond h264 / yuv420p | Not exercised |

### Verification method

There is no snapshot suite — **verify visually**. The framework's output is
visual, so regressions are silent: nothing throws when a font falls back or a
layout stops reflowing.

`npm run verify` renders 18 stills chosen so a failure is *attributable* — each
targets one subsystem, and every one is rendered in both a landscape and a
vertical format, because portrait is where per-format bugs live and is the format
nobody checks.

---

## Authoring a video

```bash
npm run create-project -- my-film --title "My Film"
```

A film is a timeline (structure), a scene map (templates) and content. No frame
offsets, no layout maths, no per-format branching. See
[AUTHORING.md](AUTHORING.md).

---

## Next Milestone

**The first cinematic project — "From Idea to Reality".**

The framework is feature-complete for it. The four gaps that would have forced a
mid-project restructure are closed: fonts, assets, a proven second brand, and an
enforced theme contract.

**Phase 6 (later):** port the reference brand film to consume the framework,
which is the ultimate validation and the trigger for extracting the framework to
its own package.

### Known accepted risk

**Voiceover is not implemented.** If "From Idea to Reality" turns out to be
narrated, scene lengths should derive from VO timestamps rather than being
hand-guessed, and music should duck under speech. The *seams* exist — a
`voiceover` timebase entry point, a `voice` layer shape, and a gain input on the
music bed — so adding narration is a registry entry plus one component, not a
restructure. See [TIMELINE.md](TIMELINE.md#the-voiceover-seam).

---

## Long-Term Vision

> A reusable Remotion Motion Studio Framework capable of producing product
> showcases, explainers, documentaries, educational videos, motion graphics, game
> cinematics, brand films, reels and future video formats from one architecture.

The framework holds a strict dependency direction:

```
projects → templates → design → framework      (framework depends on nothing internal)
```

New capability arrives as **registry entries or packs**, never as engine changes:
a new animation, preset, camera move, transition, atmosphere recipe, timebase
strategy, font or scene template is an addition, not a rewrite. That is what lets
video categories which do not exist yet be supported without restructuring.
