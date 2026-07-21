# Compatibility

The official compatibility record. It states the exact environment the framework
has been *verified* against — not the versions it is merely expected to work
with.

---

## Framework Version

**1.0.0** — Phase 5 complete. Public API frozen.

---

## Verified Environment

Every version below was read from the installed dependency tree at the time of
verification, and the framework was rendered successfully against it.

| Dependency | Verified version |
| --- | --- |
| **Remotion** (`remotion`, `@remotion/cli`) | `4.0.495` |
| `@remotion/transitions` | `4.0.495` |
| `@remotion/tailwind-v4` | `4.0.495` |
| `@remotion/google-fonts`, `@remotion/media`, `@remotion/media-utils`, `@remotion/shapes` | `4.0.495` |
| **React** (`react`, `react-dom`) | `19.0.0` |
| **TailwindCSS** | `4.1.14` |
| **Node.js** | `24.18.0` |
| npm | `11.16.0` |
| Platform | Windows 11 (`win32`) |

**Minimum supported Node:** `18.x`, which is Remotion 4's own floor. Verified on
`24.18.0`; older majors are untested here.

All `@remotion/*` packages must share a single version — mixing them is a common
source of subtle breakage. `npx remotion versions` checks this and must report
*"All packages have the correct version."*

### On `zod`

The framework does **not** depend on `zod` directly, and that is deliberate.

Remotion requires an exact `zod` version and validates it at startup; declaring
our own pin means every Remotion upgrade must also bump `zod` in lockstep, and
forgetting produces a startup warning that says React hooks may break. We never
import `zod` — the optional `schema` prop on `registerProject` is a passthrough
to `<Composition schema>` — so Remotion's own packages supply the version they
want (`4.3.6` here, via `@remotion/studio` and `@remotion/media`) and the class
of mismatch cannot recur.

If a project ever wants schema-driven props, install `zod` at whatever exact
version `npx remotion versions` reports as required.

---

## Verified Features

| | Feature | Evidence |
| --- | --- | --- |
| ✅ | Unit tests | `npm test` — 42 assertions, pure Node |
| ✅ | Health check | `npm run verify` — 21/21 checks |
| ✅ | Motion engine | Every entrance, exit and ambient preset renders (showcase ch. 2) |
| ✅ | Camera system | All 7 moves render; seeded `handheld` is byte-deterministic |
| ✅ | Registry policy | Unknown names throw with the known list (asserted in tests) |
| ✅ | Responsive engine | 4 buckets; landscape ↔ portrait reflow confirmed visually |
| ✅ | Theme engine | Runtime `useTheme()` drives all colour/type/atmosphere |
| ✅ | **Nested themes** | Two brands render simultaneously in one tree (showcase ch. 10) |
| ✅ | Brand system | `editorial` — opposite ground, serif display, warm shadows |
| ✅ | Font system | Real webfonts; `delayRender` gates frame 0; family names asserted |
| ✅ | Asset pipeline | `assetsFor` project-scoped resolution over `staticFile` |
| ✅ | Component library | Primitives, typography, layers, content, branding |
| ✅ | Timeline engine | 42 assertions + `seconds`, `bars` and custom timebases in real films |
| ✅ | **Nested timelines** | A `bars` film inside a `seconds` film (showcase ch. 8) |
| ✅ | Audio engine | AAC 48 kHz stereo; splice + equal-power crossfade exercised |
| ✅ | Transition registry | `fade`, `wipe`, `slide` across full films |
| ✅ | Layout primitives | All five in landscape and portrait |
| ✅ | Scene templates | All twelve, filled and with optional slots omitted |
| ✅ | Landscape / portrait | Stills and full MP4 renders |
| ✅ | **Ultrawide** 3840×1080 | `TortureTest-Ultrawide` |
| ✅ | **Exhibition** 2160×3840 | `TortureTest-Exhibition` |
| ✅ | Scaffolder | `create-project` → registered → rendered |

### Not yet verified

- **Server-side / Lambda rendering** has not been exercised.
- Only `h264` / `yuv420p` output has been rendered.
- **Square (1080×1080)** is defined and bucketed but not part of the standard
  verification set.

---

## Known Issues

| Area | Status |
| --- | --- |
| **Rendering** | Verified. Stills and full MP4 renders (with audio) succeed. |
| **Framework** | No framework issues currently known. |
| **Studio: `JSX element identity changed`** | Cosmetic, upstream. Printed while the Studio UI is open. Does not affect rendering. See below. |
| **`npm install` warning** | `esbuild` has a postinstall script not covered by `allowScripts`. Harmless here — the bundler resolves and renders correctly. |

### `Error: JSX element identity changed` in Studio

**Expected. Cosmetic. Not a framework bug — do not chase it.**

Remotion `4.0.495` added a Studio feature that lets you drag a `<Sequence>` in
the timeline and writes the change back to its source. To do that it traces each
rendered sequence to the literal JSX element that produced it. The feature does
not exist in `4.0.408`, which is why the message appeared only after that
upgrade.

This framework generates sequences **from timeline data** — `StandardFilm` maps
over a scene plan — so there is no literal JSX element whose props correspond to
a given sequence, and the trace fails. Remotion catches the failure at every call
site and degrades to "this sequence is not visually editable."

Confirmed behaviour:

- With **no browser client attached**, Studio starts completely clean — zero
  occurrences.
- With the UI open, one is printed per sequence Studio tries to make editable.
- Rendering never takes this path: `npm run verify` is 21/21 and full MP4 renders
  succeed.

There is no configuration opt-out. Studio's only mechanism is a per-sequence UI
action that writes `showInTimeline={false}` into your source, which would remove
scenes from the Studio timeline entirely — a real usability loss to silence a log
line, so it is deliberately not used.

The trade is inherent: the timeline is data, which is the framework's central
design decision, and Studio's visual editing assumes it is JSX.

The Remotion Studio 4.0.408 keyboard-shortcut issue previously recorded here has
not been re-observed on `4.0.495`; it is removed rather than carried forward
unverified.

`npm audit` reports **0 vulnerabilities** on `4.0.495`, an improvement over
`4.0.408`, which carried advisories in transitive toolchain dependencies.

---

## Upgrade Policy

**Dependencies are pinned to exact versions (no `^`).**

The framework's output is *visual*, and visual regressions are silent: nothing
throws when a gradient bands differently, a font falls back, or a transition
times a frame short. A dependency moving underneath a verification pass makes it
impossible to tell whether a change came from our architecture or from the
toolchain.

Therefore:

1. **Do not upgrade mid-phase.** Upgrades happen only after a milestone is
   complete and verified.
2. **Upgrade all `@remotion/*` packages together**, to the same version.
3. **Re-run `npm run verify` after any upgrade**, and add a full MP4 render to
   confirm the audio path (`npm run verify -- --full`).
4. **Compare pixels, not just exit codes.** A passing render is not an unchanged
   render — see the method below.
5. **Record the outcome here** — update the verified table, or document why the
   upgrade was rejected.

### How to compare renders across an upgrade

Keep a still from the old version, render the same frame on the new one, and
measure:

```bash
ffmpeg -i old.png -i new.png -lavfi "psnr" -f null -

ffmpeg -i old.png -i new.png -lavfi \
  "blend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YMAX" \
  -f null -
```

**`YMAX` is the number that matters** — the largest single-pixel difference on a
0–255 scale. Sub-perceptual rasterization drift gives a small `YMAX` spread
evenly across the frame. A layout shift, a missing element or a font fallback
gives a `YMAX` near 255, concentrated in one region. PSNR alone cannot tell those
apart, because a small shift in a large dark frame still scores well.

---

## Upgrade History

### `4.0.408` → `4.0.495` — **adopted**, Phase 5 (2026-07-21)

Evaluated at the Phase 5 milestone per the policy above.

| Check | Result |
| --- | --- |
| Unit tests | 31/31 |
| `npm run verify` | 21/21 |
| Full MP4 + audio | h264 + AAC 48 kHz stereo, duration unchanged (18.709s) |
| Composition durations | All 22 unchanged |
| Pixel comparison (2 frames, dark + light brand) | PSNR 54.2–55.6 dB |
| **`YMAX`** | **8 / 255** |

**Verdict: adopted.** A maximum single-pixel difference of 8/255 (3.1%), spread
evenly across the frame and slightly stronger in text regions, is the signature
of font rasterization and gradient dithering in a newer bundled Chrome Headless
Shell — not a framework regression. A structural change would have produced a
`YMAX` near 255 concentrated in one area. Rendered PNGs are 20–40% larger, which
is consistent with different dithering producing more high-frequency detail.

Adopted rather than deferred because v1.0.0 and the first cinematic project
should not start on a toolchain 87 patches stale, and because the framework was
verified independently on both versions — which is exactly the evidence the
policy asks for.

---

## Why this document exists

Compatibility documentation is not bureaucracy — it protects two things that get
expensive to lose:

**Reproducible builds.** A render produced today can be reproduced months from
now, and any difference attributed to our code rather than to unrecorded
toolchain drift.

**Cheap, safe upgrades.** Recording exactly what was verified — and how — turns a
future upgrade from an open-ended risk into a checklist. Without it, the only
honest way to assess an upgrade is to re-verify everything from scratch, which is
why upgrades get deferred indefinitely and projects strand on old versions.

It also gives anyone joining a truthful baseline: what genuinely works, what is
merely expected to work, and what has never been tested.
