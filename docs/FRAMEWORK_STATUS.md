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
| **Brand System** | `design/brands/` | `extendTheme` + `validateTheme`; `editorial` proves it, `atelier` uses it in production |
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

**The first cinematic project — "From Idea to Reality".** *Score integrated; opening
and ending bookends built and tunable. Ending is a placeholder cinematic treatment —
the next development phase replaces it with the final ending design.*

A score-driven short: 18 shots, re-timed to the licensed track's measured 139.675 BPM,
plus a silent opening and ending. Lives in `projects/from-idea-to-reality/` on its own
brand (`design/brands/atelier`). See
[PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md) for how it's structured; historical
planning documents (creative direction, VFX research, the original bookend proposal)
are archived under [docs/archive/from-idea-to-reality/](archive/from-idea-to-reality/).

**Zero framework changes were required to build it.** The film is entirely a
Ring 2 brand plus a Ring 3 project — which is the strongest evidence so far that
the v1.0.0 API freeze holds under a real production rather than under demos.

What it exercised for the first time:

| First use | Where | Finding |
| --- | --- | --- |
| `bars` timebase on a real film | `film/filmTimeline.js` | Cuts land on the bar line; one `BPM` constant re-times all 18 shots |
| `none` transition as house style | `index.jsx` | Hard cuts on the downbeat need overlap > 0 + type `none`, not overlap 0 — that would forbid the 1 dissolve |
| A brand born from a production need | `brands/atelier` | The atmosphere override seam carried the film's entire lighting arc |
| Instrument Serif | `brands/atelier` | Ships **weight 400 only**; brands must state weights AND drop display `textStyles` to 400 or the browser synthesises a fake bold |
| Project-local components | `from-idea-to-reality/film/components/` | The ring rule held: `Mark` imports from `@/framework`, never the reverse |

**Known gap, now closed:** the film briefly used a scene template (`TitleScene`) for
its closing title card, but that shot was a leftover placeholder from before the
opening/ending bookend work and has since been removed — the real closing title now
lives in `ending/Ending.jsx`. All 18 shots compose layout primitives directly, since
the film's subject is an abstract single-subject cinematic beat with no template
shape it fits.

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
