# Project Architecture — "From Idea to Reality"

How the film actually renders, end to end, as of this document. Framework-level
architecture (the three-ring dependency rule, the registry idiom, the motion/theme
split) is covered by [ARCHITECTURE.md](ARCHITECTURE.md) and isn't repeated here — this
document is scoped to one project: how its own pieces fit together.

For the project's own folder-by-folder guide (what to edit, what to leave alone), see
[the project's own README](../src/projects/from-idea-to-reality/README.md) — this
document is the deeper reference; that one is the 30-second orientation.

For the design *process* that led here — narrative structure, VFX research, the
original (unshipped) bookend proposal — see
[docs/archive/from-idea-to-reality/](archive/from-idea-to-reality/). Those documents are
historical; this one is current.

> **Current runtime state:** `index.jsx`'s `BYPASS_FILM` flag is `true` — the
> composition currently renders `Opening → Ending` only, skipping the middle film, for
> iterating on the two reusable bookends in isolation. The film's `Sequence`, all 18
> shots, `film/filmTimeline.js` and `film/narrative.js` are fully intact and untouched;
> only the assembly in `index.jsx` skips mounting them. Flip `BYPASS_FILM` back to
> `false` to reconnect `Opening → Film → Ending`.

---

## Render flow

```
registry.js
  ↓  (schema + defaultProps + duration, one entry per project)
<Composition>            — one per format (Landscape, Reel)
  ↓
FromIdeaToReality        (from-idea-to-reality/index.jsx)
  ↓
  ├─ Opening              (opening/Opening.jsx)         silent, before the film
  ├─ Sequence "film"       → StandardFilm                the 18-shot main film
  │     ↓
  │     scenes: { void, spark, doubt, drift, count, first-mark,
  │               repeat, row, grid, field,
  │               planes, layers, lattice, depth, traverse, peak,
  │               form, handover }
  │     each scene is one file in film/shots/*.jsx. The film's old closing
  │     title card (`title`, "A film made with the Motion Studio Framework" /
  │     "From Idea to Reality") was removed — it predated the bookend work
  │     below and was a duplicate of `Ending`'s own title reveal.
  └─ Sequence "ending"     (ending/Ending.jsx)           silent, after the film
```

Each of the three top-level pieces (`Opening`, the film, `Ending`) mounts in its own
`<Sequence from={...}>`, offset by the cumulative length of what precedes it. Remotion
scopes `useCurrentFrame()` per `Sequence`, so each piece's internal timing (and the
film's own `Soundtrack`, which lives *inside* the film's `Sequence`) is written as if it
started at frame 0 — nothing downstream needs to know the opening exists.

---

## Folder structure

```
from-idea-to-reality/
├── index.jsx              the assembler — the only file that sees all three phases
├── README.md               orientation for a developer opening this project
│
├── opening/                owns the opening bookend
│   ├── Opening.jsx
│   └── schema.js
│
├── film/                   owns the main 18-shot narrative film
│   ├── filmTimeline.js      structure — bars, derived from one BPM constant
│   ├── narrative.js         direction — atmosphere, camera and words per shot
│   ├── shots/                one file per movement
│   └── components/           the film's protagonist mark + its arrangements
│       ├── Mark.jsx
│       └── MarkField.jsx
│
├── ending/                 owns the ending bookend
│   ├── Ending.jsx
│   └── schema.js
│
├── motion/                 reusable production animation shared across sections
│   └── centerReveal.js      the centre-out title-reveal mask (opening + ending)
│
└── dev/                    Studio-only tooling; never affects a production render
    └── SequenceDebugOverlay.jsx
```

`motion/` is deliberately narrow: it exists for the one piece of animation logic two
runtime sections both depend on, not as a general dumping ground. `dev/` is equally
narrow in the other direction — everything in it is gated on
`getRemotionEnvironment().isStudio`, so it costs nothing in a real render.

---

## Ownership — which file owns what

| Owns | File(s) |
|---|---|
| **Timing / structure** | `film/filmTimeline.js` (`SCENE_PLAN`, bar-locked, one `BPM` constant) for the film; `opening/schema.js` / `ending/schema.js` (`deriveOpeningLayout` / `deriveEndingLayout`) for the bookends |
| **Copy** | `film/narrative.js`'s `WORDS` map for the film's four on-screen lines; `opening/Opening.jsx` (wordmark string) and `ending/Ending.jsx` (message/title/brand strings) inline for the bookends — these are short, fixed, and not tunable via schema, unlike timing |
| **Assets** | `film/narrative.js`'s `asset = assetsFor('from-idea-to-reality')`; the one asset in use is the soundtrack, wired via `soundtrack={{ src: asset.music(...) }}` on `StandardFilm` |
| **Animation** | `framework/animations/` (pure `({frame,…}) => style` functions, `animate`/`envelope`/`mergeMotion`) consumed everywhere; `film/components/Mark.jsx` + `film/components/MarkField.jsx` own the film's protagonist mark and its arrangements; `motion/centerReveal.js` owns the shared title-reveal mask used by both bookends |
| **Atmosphere** | `film/narrative.js`'s `ATMOSPHERE` map (which of the four brand atmospheres — `flat`/`hearth`/`workshop`/`studio` — each shot uses) and `CAMERA` map (which camera preset); the atmospheres themselves are defined in `src/design/brands/atelier/index.js` |
| **Opening** | `opening/Opening.jsx` (component) + `opening/schema.js` (schema, defaults, `deriveOpeningLayout`) |
| **Ending** | `ending/Ending.jsx` (component) + `ending/schema.js` (schema, defaults, `deriveEndingLayout`) |
| **Debug overlays** | `dev/SequenceDebugOverlay.jsx`, shared by both bookends, gated on `getRemotionEnvironment().isStudio` |

---

## The opening and ending, briefly

Both bookends follow the same authoring convention (see
[AUTHORING.md §8](AUTHORING.md#8-live-tuning-art-direction-optional)): a Zod `schema` +
`defaultProps`, registered through the same `registerProject` path every project uses,
tunable live in Remotion Studio's native Props panel with zero effect on a real render.

- **Opening** (`opening/Opening.jsx`): the `MOTION STUDIO FRAMEWORK` wordmark fades up
  centred, holds, then scales/moves into a small header — only once that move has fully
  settled does the project title reveal, centre-out, via `centerRevealMask`. A soft
  warm glow builds under the held title. Everything fades to black together into the
  film.
- **Ending** (`ending/Ending.jsx`): a reflective one-line message fades up alone, then
  *resolves into* the project title (a deliberate crossfade — the one place in the film
  two elements overlap on purpose). The studio wordmark returns afterward, once the
  title has settled, as a quiet signature — not a repeat of the opening's move, just a
  fade at its final, small, resting position. All three fade to black together, in
  silence (the ending sits in its own `Sequence`, outside the film's `Soundtrack`).

Both use the identical structural safety pattern for "the next thing never starts before
the previous thing has settled": `Math.max(desiredStart, priorEnd + pause)`, computed in
`deriveOpeningLayout` / `deriveEndingLayout` rather than left to hand-tuned numbers.

**Known next step (not yet done):** the current ending is a placeholder cinematic
treatment, not the final one — the next development phase replaces it with the final
ending design. Nothing above should be read as locked.

---

## Dependency map — load-bearing files

| File | Imported by | Safe to change how? |
|---|---|---|
| `film/filmTimeline.js` | `index.jsx` (film duration + scene plan) | Bar counts are derived from the licensed track's measured BPM — re-timing means re-verifying the sync points noted in the file's own comments (`first-mark` pulse-in, `peak`'s splice), not just editing numbers |
| `film/narrative.js` | `index.jsx` (via shot components), all of `film/shots/*.jsx` | Additive changes (new atmosphere/camera entries) are safe; changing an existing shot's `ATMOSPHERE`/`CAMERA` entry is a creative decision, not a refactor |
| `opening/schema.js` / `ending/schema.js` | `opening/Opening.jsx`/`ending/Ending.jsx`, `index.jsx` (duration), `registry.js` (schema/defaultProps) | Tune via the Studio Props panel, then carry values back via the JSON-toggle copy-paste workflow (`AUTHORING.md` §8) — don't hand-edit `DEFAULT_PROPS` values without going through Studio first, or the "preview matches what you tuned" guarantee breaks |
| `registry.js` | `Root.jsx` | Only place a new project or a schema change is wired in; must stay a static, explicit list (see the file's own comment on why no filesystem glob) |
| `film/components/Mark.jsx` / `MarkField.jsx` | Every `film/shots/*.jsx` file | Project-local by design (not framework) — changing the mark's shapes/entrances affects all 18 shots at once, so treat like a shared component even though it isn't in `framework/` |
| `motion/centerReveal.js` | `opening/Opening.jsx`, `ending/Ending.jsx` | Shared verbatim on purpose — the title reappearing the same way it first appeared is the intended rhyme; a divergent second implementation would undercut that |

---

## What this film does *not* have

- No `calculateMetadata` — composition duration is computed once from
  `DEFAULT_PROPS`/`SCENE_PLAN`, not reactively from live Studio props. Tuning within an
  approved total works live; a new total requires updating the defaults (see
  `opening/schema.js` / `ending/schema.js` header comments).
- No voiceover — timing is bar-locked to the score, not to speech.
- No per-shot scene template from `templates/scenes/` — the film's one former use of
  `TitleScene` (the old closing `title` shot) was removed along with that shot; all 18
  shots now compose layout primitives directly, since the film's subject is an
  abstract, single-subject cinematic beat with no template shape it fits.
