# Compatibility

The official compatibility record for the Motion Studio Framework. It states the
exact environment the framework has been *verified* against — not the versions it
is merely expected to work with.

---

## Framework Version

**0.4.0** — Phase 4 complete (layouts & templates).

---

## Verified Environment

Every version below was read from the installed dependency tree at the time of
verification, and the framework was rendered successfully against it.

| Dependency | Verified version |
| --- | --- |
| **Remotion** (`remotion`, `@remotion/cli`) | `4.0.408` |
| `@remotion/transitions` | `4.0.408` |
| `@remotion/tailwind-v4` | `4.0.408` |
| `@remotion/google-fonts`, `@remotion/media`, `@remotion/media-utils`, `@remotion/shapes`, `@remotion/zod-types` | `4.0.408` |
| **React** (`react`, `react-dom`) | `19.0.0` |
| **TailwindCSS** | `4.1.14` |
| **Zod** | `3.22.3` |
| **Node.js** | `24.18.0` |
| npm | `11.6.4` |
| Platform | Windows 11 (`win32`) |

**Minimum supported Node:** `18.x`, which is Remotion 4's own floor. Verified on
`24.18.0`; older majors are untested here.

All `@remotion/*` packages must share a single version — mixing them is a common
source of subtle breakage.

---

## Verified Features

| | Feature | Evidence |
| --- | --- | --- |
| ✅ | Framework scaffold | Bundles and renders; `@/` alias and Tailwind pipeline active |
| ✅ | Motion engine | Presets, stagger and ambient motion render across formats |
| ✅ | Camera system | Scene-length push/drift verified in rendered stills |
| ✅ | Responsive engine | 4-way buckets; landscape ↔ portrait reflow confirmed visually |
| ✅ | Theme engine | Runtime `useTheme()` injection drives all component colour/type |
| ✅ | Component library | Primitives, typography, layers, content and branding all render |
| ✅ | Timeline engine | 20 assertions (`npm test`) + two demo projects with derived durations |
| ✅ | Audio engine | `MusicalDemo` MP4 carries a real AAC stream; splice/crossfade path exercised |
| ✅ | Transition registry | `fade`, `wipe` and `slide` render across a full 48s film |
| ✅ | Layout primitives | All five verified in landscape and portrait (`LayoutsDemo`) |
| ✅ | Scene templates | All twelve verified via a film with no hand-written scenes (`TemplateDemo`) |
| ✅ | Landscape rendering | Stills and full MP4 renders at 1920×1080 |
| ✅ | Portrait rendering | Stills and full MP4 renders at 1080×1920 |
| ✅ | Unit tests | `npm test` — pure Node, no runner or bundler required |

### Not yet verified

- **Ultrawide (3840×1080) and exhibition (2160×3840)** formats are defined and
  correctly bucketed, but have not been visually reviewed.
- **Server-side / Lambda rendering** has not been exercised.
- Only `h264` / `yuv420p` output has been rendered.

---

## Known Issues

| Area | Status |
| --- | --- |
| **Remotion Studio 4.0.408 — keyboard shortcut issue** | Reported in the Studio UI. Does **not** affect rendering. |
| **Rendering** | Verified. Stills and full MP4 renders (with audio) succeed. |
| **Framework** | No framework issues currently known. |

The keyboard-shortcut behaviour is an upstream Studio (developer-tooling) concern,
not a framework or output concern: every render path — `remotion still`,
`remotion render`, and `remotion compositions` — has been exercised successfully.

`npm install` reports advisories in transitive dependencies of the Remotion
toolchain. These are in the build/dev toolchain rather than framework code, and
are resolved upstream by Remotion releases rather than by changes here.

---

## Upgrade Policy

**Dependencies are intentionally pinned (exact versions, no `^`) during active
architecture development.**

The framework is being built in verified phases, each ending in a rendered,
reviewed result. A dependency moving underneath that process makes it impossible
to tell whether a visual change came from our architecture or from the toolchain
— which is precisely the signal these phases exist to provide.

Therefore:

1. **Do not upgrade mid-phase.** Upgrades happen only after a stable milestone is
   complete and verified.
2. **Upgrade all `@remotion/*` packages together**, to the same version.
3. **Re-run the full verification set after any upgrade:** `npm test`, then
   `npm run compositions`, then stills in **both** landscape and portrait, then at
   least one full MP4 render including the audio path.
4. **Record the outcome here** — bump the verified version table, or document why
   the upgrade was rejected.

---

## Upgrade Candidate

| Package | Current | Available | Status |
| --- | --- | --- | --- |
| `remotion` + all `@remotion/*` | `4.0.408` | `4.0.495` | ⬜ **Not yet validated** |

Remotion `4.0.495` is available but has **not** been validated against this
framework. It is a candidate for evaluation after Phase 5, per the upgrade policy
above. Do not adopt it mid-phase.

---

## Why this document exists

Compatibility documentation is not bureaucracy — it protects two things that get
expensive to lose:

**Reproducible builds.** A motion framework's output is *visual*, and visual
regressions are silent: nothing throws when a gradient bands differently, a font
falls back, or a transition times a frame short. Pinned, recorded versions mean a
render produced today can be reproduced months from now, and any difference can be
attributed to our code rather than to an unrecorded toolchain drift.

**Cheap, safe upgrades.** Recording exactly what was verified — and how — turns a
future upgrade from an open-ended risk into a checklist. Without it, the only
honest way to assess an upgrade is to re-verify everything from scratch, which is
the reason upgrades get deferred indefinitely and projects end up stranded on old
versions.

It also gives anyone joining the project a truthful baseline: what genuinely works,
what is merely expected to work, and what has never been tested.
