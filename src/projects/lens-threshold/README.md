# Lens Threshold

A cinematic transition study built on the Motion Studio Framework — the framework's
first VR-focused production and its first single-shot piece (no multi-scene timeline).
Premium, minimal, one continuous camera move, no cuts.

**Status: prototype.** `public/projects/lens-threshold/video/` is empty — see that
folder's README for the two clips this needs before it will render.

---

## The idea

A VR headset (Video A) is not cut away from — it is pushed *through*. One continuous
camera move carries the whole piece; Video B is faintly present, out of focus, from
frame 0, and comes into focus as Video A dissolves out of it. See `Portal.jsx`'s header
comment for the full technique note, and `docs/PROJECT_ARCHITECTURE.md`'s sibling
entry (once added) for the deeper reference.

## Folder ownership

| File | Owns |
|---|---|
| `index.jsx` | The assembler. Thin on purpose — this project has one Sequence, not several |
| `Portal.jsx` | The piece itself: the shared camera move, the two stacked video layers, the focus rack between them |
| `schema.js` | Timing/camera/focus tunables — live-editable in Studio's Props panel, same convention as `from-idea-to-reality/opening/schema.js` |

## What you'll edit most often

- **`schema.js`'s `LENS_THRESHOLD_DEFAULT_PROPS`** — tune through Studio's Props panel
  first, then carry values back via the Inspector's JSON toggle (see
  [AUTHORING.md §8](../../../docs/AUTHORING.md#8-live-tuning-art-direction-optional)).
- **`timing.rackStart`/`rackDuration`** (derived from `approachDuration`/`rackOverlap`)
  — when and how long the handoff between the two clips takes.

## Reusable framework additions this project introduced

- `framework/components/primitives/VideoFrame.jsx` — the `MediaFrame` of video; not
  used by this project directly (this is full-bleed cinema, not a framed card) but
  general enough to belong at Ring 1 from day one.
- `framework/camera/index.js`'s `focusRack` — pairs two stacked layers' blur/opacity/
  scale inversely. General technique, not portal-specific; a second production needing
  a depth-of-field handoff should reuse this rather than reinventing it.

Everything else about *this* piece (the shared push, the stacked-layer composition)
stays project-local until a second production actually needs it — see
`docs/ARCHITECTURE.md`'s note on "a pack is a module exporting registry entries."
