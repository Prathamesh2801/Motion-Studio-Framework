# From Idea to Reality

A silent, score-driven short film built on the Motion Studio Framework, on its own
brand (`src/design/brands/atelier`). This README is the 30-second orientation; for the
deeper reference (dependency map, what's tunable, what's frozen), see
[docs/PROJECT_ARCHITECTURE.md](../../../docs/PROJECT_ARCHITECTURE.md). For the design
process that led here, see
[docs/archive/from-idea-to-reality/](../../../docs/archive/from-idea-to-reality/) —
historical, not current.

---

## Runtime flow

```
index.jsx
    ↓
Opening   (opening/)     silent, before the film
    ↓
Film      (film/)        the 18-shot main film, score-driven
    ↓
Ending    (ending/)      silent, after the film
```

`index.jsx` is the only file that sees all three phases. Each mounts in its own
`<Sequence>`, offset by the length of what precedes it — nothing inside a phase needs
to know the others exist.

---

## Folder ownership

Every folder answers one question: *what does this own?*

| Folder | Owns |
|---|---|
| **`opening/`** | Everything related to the opening bookend — the wordmark-to-title sequence that plays silently before the film |
| **`film/`** | The complete narrative film: its structure (`filmTimeline.js`), its direction (`narrative.js`), its 18 shots (`shots/`), and the mark component system those shots are built from (`components/`) |
| **`ending/`** | Everything related to the ending bookend. **Currently a placeholder cinematic treatment** — the next development phase replaces this with the final ending design |
| **`motion/`** | Reusable *production* animation primitives shared between runtime sections — currently just `centerReveal.js`, the centre-out title-reveal mask both `opening/` and `ending/` use identically on purpose. Not a general "shared" folder: only reusable animation logic belongs here |
| **`dev/`** | Studio-only tooling. Everything here is gated on `getRemotionEnvironment().isStudio` — nothing inside ever affects a production render |

---

## What you'll edit most often

- **`film/narrative.js`** — re-lighting a shot (its atmosphere or camera) or changing
  one of the film's four on-screen words is a column edit here.
- **`film/filmTimeline.js`**'s `SCENE_PLAN` — re-pacing the film is a bar-count edit
  here. (Bar counts are derived from the licensed track's measured BPM — see the file's
  own comments before changing them.)
- **`opening/schema.js`** / **`ending/schema.js`**'s `*_DEFAULT_PROPS` — tuning scale,
  position, timing, or hold durations for either bookend. Do this *through* Remotion
  Studio's Props panel first, then carry the result back via the Inspector's JSON
  toggle (see [AUTHORING.md §8](../../../docs/AUTHORING.md#8-live-tuning-art-direction-optional))
  — don't hand-edit these values blind.
- **`film/shots/*.jsx`** — changing a shot's composition or camera move.

## What should rarely be touched

- **`motion/centerReveal.js`** — shared verbatim by both bookends on purpose; a
  divergent second implementation would undercut the reason it's shared at all.
- **`film/components/Mark.jsx`** / **`MarkField.jsx`** — the film's protagonist mark.
  Every one of the 18 shots depends on it; a change here is film-wide, not local.
- **`index.jsx`** — the assembler. It intentionally contains no frame numbers, no
  layout maths, no per-format branching — if you find yourself editing a number in
  here, the number probably belongs in `film/filmTimeline.js` or a schema file instead.
- **`dev/SequenceDebugOverlay.jsx`** — Studio-only, but shared by both bookends; treat
  a change here as affecting both, not one.

---

## Dependency diagram

```
index.jsx
    ↓
opening/Opening.jsx ──uses──> opening/schema.js
    │                              │
    └──uses──> motion/centerReveal.js
    │
    └──uses──> dev/SequenceDebugOverlay.jsx   (Studio only)

film/*  (via index.jsx)
    ├─ filmTimeline.js
    ├─ narrative.js
    ├─ shots/*.jsx ──uses──> components/Mark.jsx, MarkField.jsx
    │                        narrative.js
    └─ components/MarkField.jsx ──uses──> components/Mark.jsx

ending/Ending.jsx ──uses──> ending/schema.js
    │
    └──uses──> motion/centerReveal.js   (same file opening/ uses)
    │
    └──uses──> dev/SequenceDebugOverlay.jsx   (same file opening/ uses)
```

`motion/` and `dev/` are the only two folders imported by *both* `opening/` and
`ending/` — that's what makes them shared rather than owned by one phase, and it's the
whole reason they sit outside those two folders instead of inside either one.
