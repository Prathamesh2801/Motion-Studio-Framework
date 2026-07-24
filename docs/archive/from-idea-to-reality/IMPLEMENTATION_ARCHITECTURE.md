# From Idea to Reality — VFX Implementation Architecture

> **ARCHIVED.** This is a phased plan, and it was only partially executed — some phases
> (e.g. `DustLayer`) shipped, others (e.g. the `Peak` lens streak) were not found in the
> current code as of this archival pass. Do not read this document as a status report;
> check the actual files it names (`NoiseLayer.jsx`, `GlowLayer.jsx`, `DustLayer.jsx`,
> `shots/momentum.jsx`) for what's actually there. See `../../PROJECT_ARCHITECTURE.md`.

**Status:** Engineering blueprint. No code in this document, no code written from it yet.
**Builds on:** `VFX_RESEARCH.md` (approved, locked — not revisited here). Every recommendation there is treated as decided; this document answers "how," not "whether."
**Scope reading, stated once so it isn't ambiguous below:** "no framework architecture changes" means the Ring system, the timeline engine, the theme contract shape, and the transition registry are untouched. It does **not** mean `src/framework/` is off-limits — `NoiseLayer`, `GlowLayer`, and a new `DustLayer` are Ring 1 components, and extending/adding components inside the existing `layers/` family is exactly what that family exists for. What's actually locked: no new Ring, no new build/render strategy, no change to how `Scene`, `AnimatedBackground`, `FilmOverlay`, or the theme/atmosphere contract compose. `timeline.js` and `content.js` are untouched, per instruction, in every phase below.

---

## Shared architecture, read once

### The existing render order (confirmed from `Scene.jsx`)
```
<AbsoluteFill>                                    ← Scene
  <AnimatedBackground>                             zIndex 0-30
    <GradientLayer/>                                 z: gradient (10)
    <GridLayer/>            (if variant.grid)         z: gradient (10)
    <GlowLayer/> × N        (per atmosphere)           z: glow (30)
  </AnimatedBackground>

  <AbsoluteFill style={cameraStyle}>               ← camera-transformed
    <AbsoluteFill style={flex/padding}>
      {children}                                   z: content (40), MOVES with camera
    </AbsoluteFill>
  </AbsoluteFill>

  <FilmOverlay>                                     zIndex 50-60, camera-INDEPENDENT
    <VignetteLayer/>                                 z: overlay (50)
    <NoiseLayer/>                                     z: grain (60)
  </FilmOverlay>
</AbsoluteFill>
```
Two facts drive every placement decision below:
1. **`FilmOverlay` sits outside the camera transform.** Grain and vignette represent the recording medium, not the scene — correctly, they don't move when the camera pushes. Anything that *should* feel attached to the lens/recording (grain, haze-as-medium) belongs in this family. Anything that should feel attached to the *scene* (dust in the air, a lens streak catching a specific light source) belongs inside `children`, where it inherits the camera move.
2. **`AnimatedBackground` and `FilmOverlay` are both driven by the same atmosphere recipe** (`getBackground(theme, variant, overrides)` from `layers/backgrounds.js`), merged with per-brand overrides in `design/brands/atelier/index.js`. Any effect that varies *by atmosphere* (`flat`/`hearth`/`workshop`/`studio`) should be expressed as recipe fields consumed by these two components — not as one-off props threaded through nineteen shot files.

### `zIndex` tokens (`framework/formats/index.js`, unchanged)
```
background:0   gradient:10   media:20   glow:30   content:40   overlay:50   grain:60
```
New layers slot into gaps in this scale rather than inventing new tokens — see per-effect sections.

### Utilities already available and reused throughout (no new files for these)
- `seededRandom(seed)` — `framework/helpers/math.js`. Deterministic 0..1 PRNG, already used by the `handheld` camera preset. **This is the one PRNG the whole plan uses** — no new random utility is introduced anywhere below.
- `alpha(hex, amount)` — `framework/helpers/color.js`. Hex → rgba string.
- `useFormat()` → `{ px, width, height, bucket, isVertical, ... }` — `framework/hooks/useFormat.js`. `px(value)` scales a design-space (1920×1080-authored) number to the active format/resolution.
- `driftMotion({ frame, amplitude, period, phase })` — plain function, `framework/camera/index.js`. Two-axis oscillation. Used today via the `useAmbientMotion({preset:'drift'})` hook wrapper; the new work calls the **plain function directly** in places a hook can't be (see DustLayer, below).
- `useTheme()` — resolves the active brand theme (`atelier` for this film).

---

## Effect 1 — Film Grain

### Existing files involved
- `src/framework/components/layers/NoiseLayer.jsx` — the component being extended.
- `src/framework/components/layers/FilmOverlay.jsx` — sole current consumer; passes `opacity`/`blendMode` through from the atmosphere recipe.
- `src/framework/components/layers/backgrounds.js` — source of `config.grain` / `config.grainBlend` per atmosphere.

### New files required
None.

### Components
`NoiseLayer` only. No new component.

### Hooks
`NoiseLayer` currently takes no hook (`useMemo` only, no frame dependency). The change adds **one** new hook call: `useCurrentFrame()` (from `remotion`, already a peer dependency, already used by every shot). No new custom hook — the re-seed logic is a two-line computation inline in the component, not worth extracting.

### Utility functions
None new. The re-seed value is `baseSeed + Math.floor(frame / cycleFrames)` — plain arithmetic, not a call to `seededRandom` (that PRNG is for *positions/phases*; here the SVG filter's own `seed` attribute already IS the noise generator, we're just changing which integer we feed it per frame).

### Theme integration
Unchanged. Still reads `config.grain` (opacity) and `config.grainBlend` (blend mode) from the atmosphere recipe via `FilmOverlay`. No new recipe field required for the baseline animated-grain behavior. (Optional future field, not needed now: a per-atmosphere `grainCycleFrames` override, should some shot want grain that "flickers" faster/slower than the film-wide default — deferred until a real need appears, per the framework's own stated bias against speculative config.)

### Props (public API)
```
NoiseLayer({
  opacity = 0.05,
  scale = 0.9,
  blendMode = 'overlay',
  seed = 0,
  animated = true,        // NEW — default true, see rollout note below
  cycleFrames = 2,         // NEW — re-seed every N frames (~15 unique fields/sec at 30fps)
  style,
})
```
`animated` and `cycleFrames` are the only additions. Every existing call site (`FilmOverlay`, and any project that imports `NoiseLayer` directly) continues to compile unchanged — this is an additive, backward-compatible prop change, not a signature break.

### Internal API
```
effectiveSeed = animated ? seed + Math.floor(frame / cycleFrames) : seed
```
computed inline, replacing the current straight `seed` reference inside the `useMemo` that builds the data-URI. `useMemo` deps become `[scale, effectiveSeed]` instead of `[scale, seed]` — same memoization shape, just a different (frame-derived, when animated) key.

### Render order / z-index / blend modes
Unchanged — still `zIndex.grain` (60), still inside `FilmOverlay`, still above everything including content. Blend mode unchanged (`overlay` default, `multiply` for light brands — this film stays on the dark `atelier` theme, `overlay` throughout).

### Responsive scaling
Already correct and untouched: `backgroundSize: '240px 240px'` tiles regardless of frame dimensions, so the grain's apparent *scale* is already format/resolution-independent (a 4K frame just gets more tile repetitions, not a stretched texture). Nothing to fix here — this was confirmed, not found broken, during the research pass.

### Landscape behaviour
No change — full-bleed `AbsoluteFill` tiling is orientation-agnostic already.

### Portrait behaviour
Same as landscape — no format branch needed or added.

### Performance considerty
Each distinct `effectiveSeed` value triggers one new `useMemo` recompute → one new tiny (240×240) SVG string → one new `background-image` the browser must rasterize. At `cycleFrames = 2` and 30fps, that's 15 unique textures/second, each trivially small. This is comparable in cost to any other `background-image` swap and is not expected to measurably change render time versus the current static version — flagged as **the one thing to actually time** during Phase 1 testing (see below), not assumed.

### Memoization opportunities
The `useMemo` already exists and is the correct mechanism — no additional memoization needed. Do **not** memoize `effectiveSeed` itself outside the component; it must recompute from `frame` every render by design (that's the entire point of this phase).

### Render cost
Negligible increase, pending the Phase 1 timing check. Worst case (if timing shows a real cost) is a one-line rollback: set `animated = false` as the default, or raise `cycleFrames`.

### Potential edge cases
- **`cycleFrames` interacting with shot length:** a very short shot (the film's shortest is `drift` at 1 bar ≈ 1.7s ≈ 51 frames) still gets ~25 distinct grain fields at `cycleFrames=2` — plenty; no special-casing needed for short shots.
- **Transition overlap:** during a dissolve (the two `fade` transitions in this film), two `NoiseLayer` instances briefly co-exist (outgoing + incoming scene). Each computes its `effectiveSeed` from its **own** local `frame` (Remotion scopes `useCurrentFrame()` per `Sequence`), so the two grains will show different, uncorrelated patterns during the ~0.67s overlap — this is correct and matches how two independently-shot film plates would actually cross-dissolve (their grain doesn't sync either).
- **Parallel/distributed rendering:** `effectiveSeed` is a pure function of `frame` (via `Math.floor`), which is itself a pure function of position in the timeline — fully deterministic across concurrent render workers, no chunk-boundary discontinuity risk.

### Failure cases
- If animated grain reads as *distracting* at real playback speed (the research doc's own warning: "grain you can consciously see is too much" applies doubly to grain that moves) — this is a **visual judgment call to make during Phase 1 QA**, not a coding failure. The fix is tuning `opacity` down and/or `cycleFrames` up, not reverting the mechanism.
- If a future non-`atelier` brand's `grainBlend: 'multiply'` (light-canvas case, per the existing code comment) looks wrong when animated — not applicable to this film (dark theme only) but worth a one-line note for whoever extends this to a light brand later.

### Rollback strategy
Single prop flip: `animated = false` restores exactly the current (approved, already-shipped) static behavior with zero other changes. Because the default is being changed film-wide (affects all 19 shots simultaneously via `FilmOverlay`), the rollback is equally film-wide and equally cheap — one line in `NoiseLayer.jsx`'s default, no per-shot changes to undo.

---

## Effect 2 — Bloom (Glow)

### Existing files involved
- `src/framework/components/layers/GlowLayer.jsx` — the component being fixed.
- `src/projects/from-idea-to-reality/components/Mark.jsx` — the *other* half of this film's bloom (per-object `boxShadow`), confirmed already scaling correctly (its `bloom` size is computed from the mark's own `w`/`h`, which already come from `px()` — no bug there, no change needed).

### New files required
None.

### Components
`GlowLayer` only.

### Hooks
No new hook. `useFormat()` is already called in `GlowLayer` (currently destructured as `{ width }` only) — the fix adds `px` to that same existing destructure. No new hook call.

### Utility functions
None new.

### Theme integration
No new theme fields. `theme.blurs.ambient` (and any per-glow `blur` override already supported in the atmosphere recipe's `glows[]` entries) continue to be the source of the blur radius — only *how that number is applied* changes.

### Props (public API)
No signature change. `GlowLayer({ color, position, size, intensity, blur, ambient, ambientOptions, style })` stays exactly as-is — this is a pure bug fix, not a new capability, so it has zero footprint on any of the ~15 call sites already passing `glows[]` config through `AnimatedBackground`.

### Internal API
```
// current (bug):
const blurRadius = blur ?? theme.blurs.ambient;

// fixed:
const { width, px } = useFormat();
const blurRadius = px(blur ?? theme.blurs.ambient);
```
One line changed.

### Render order / z-index / blend modes
Unchanged — still `zIndex.glow` (30), still inside `AnimatedBackground`, still behind content. No blend mode today (plain alpha radial-gradient); none added.

### Responsive scaling
This **is** the fix. Today: `diameter` scales with frame width (`(size/100) * width`, format-independent by construction), but `blurRadius` does not — an absolute px value that stays fixed regardless of render resolution. At 4K (`width` ≈ 3840) vs. this film's 1080p preview (`width` = 1920), the glow's *footprint* doubles correctly but its *blur softness* stays exactly the same absolute pixel radius — relatively half as soft. Post-fix, `blurRadius` scales with the same `px()` conversion used everywhere else in the codebase (`Mark.jsx`, `GridLayer.jsx`), so a glow tuned by eye in Remotion Studio (which typically previews at or near 1080p) looks proportionally identical in the final 4K/landscape and reel exports.

### Landscape behaviour
No branch needed — `px()` already accounts for format scale (`formats/index.js`'s per-format `scale` multiplier), which differs between landscape/reel/exhibition. The fix makes blur follow that existing per-format scale automatically.

### Portrait behaviour
Same mechanism — no separate portrait-specific code. Worth a specific visual check during QA since vertical format's `scale` token is "deliberately close to 1.0 rather than tracking the width ratio" (per the framework's own comment in `formats/index.js`) — meaning the blur-scaling fix will move portrait glows by a *smaller* relative amount than landscape/4K. Expected and correct, but the QA checklist below calls it out explicitly so it isn't mistaken for the fix "not working."

### Performance considerations
Zero change — same number of glows, same CSS `filter: blur()` cost, just a different numeric argument.

### Memoization opportunities
None applicable/needed — `GlowLayer` has no expensive computation to memoize; `useFormat()` is already itself memoized (`useMemo` inside the hook, keyed on `width/height/fps/durationInFrames`).

### Render cost
No change.

### Potential edge cases
- Any shot that manually passed an already-large `blur` override anticipating the old (unscaled) behavior will now render **more** blurred than before, proportionally to format scale — worth a full visual pass across all 19 shots (the QA checklist below), not just the shots that obviously use glow, since several shots layer glow subtly (e.g. `hearth` shots' single centred pool).
- `Peak`'s planned lens streak (Effect 5) is visually adjacent to bloom but is a **separate, one-off effect**, not built on `GlowLayer` — no interaction to worry about here.

### Failure cases
If the scaled blur looks *too* soft at 4K after the fix (overcorrection), the resolution is tuning individual `blur` override values in the atmosphere recipe (`atelier/index.js`), not reverting the `px()` mechanism — the mechanism itself is simply correct; only the authored numbers might need re-eyeballing once they're actually format-correct for the first time.

### Rollback strategy
One-line revert (`px(blur ?? theme.blurs.ambient)` → `blur ?? theme.blurs.ambient`) restores the exact current behavior. Because this is a single shared component, rollback is again film-wide and single-point.

---

## Effect 3 — Dust (new `DustLayer`)

### Existing files involved
- `src/framework/components/layers/AnimatedBackground.jsx` — where "behind content" dust would be composed in, alongside `GlowLayer`.
- `src/framework/components/layers/FilmOverlay.jsx` — where "in front of content" (near-camera) dust would be composed in, if a shot wants that instead.
- `src/framework/components/layers/index.js` — barrel export, needs one new line.
- `src/projects/from-idea-to-reality/content.js` — **read, not modified**: `ATMOSPHERE` map tells a shot which recipe (and therefore, indirectly, which dust tuning) it's using; no edits needed to this file itself since dust configuration lives in the atmosphere recipe (see Theme integration below), exactly like `glows` already does.
- `src/framework/helpers/math.js` — `seededRandom`, reused, not modified.
- `src/framework/camera/index.js` — `driftMotion`, reused as a plain function, not modified.

### New files required
- **`src/framework/components/layers/DustLayer.jsx`** — the one new file this entire phase produces.
- Barrel line added to `src/framework/components/layers/index.js`: `export { DustLayer } from './DustLayer.jsx';`

### Components
`DustLayer` — one new component, same family/pattern as `GlowLayer`/`GridLayer` (functional, `AbsoluteFill`-wrapped, theme/format-aware, `pointerEvents: 'none'`).

### Hooks
- `useCurrentFrame()` — called **once**, at the top of `DustLayer`, not per-particle.
- `useFormat()` — for `px()` scaling of particle size/blur, and for `width`/`height` to convert percentage positions.
- **No new custom hook.** Per-particle motion deliberately does **not** go through `useAmbientMotion` (the hook wrapper) — calling a hook inside a `.map()` callback, once per particle, is the kind of pattern that's technically stable here (particle count is a fixed prop, so hook-call-count is consistent across renders) but is an unconventional, easy-to-get-wrong shape for a hook. Instead, `DustLayer` calls the **plain underlying function** `driftMotion({ frame, amplitude, period, phase })` directly per particle inside the `.map()` — this is exactly what the hook itself does internally, minus the hook wrapper, and it's already the documented pattern (`driftMotion` is exported specifically so it can be used this way).

### Utility functions
No new utility file. Particle generation is a **local, non-exported, pure function inside `DustLayer.jsx`** (same convention as `Mark.jsx`'s inline `SHAPES` registry — single-consumer logic stays with its consumer):
```
buildParticles({ count, seed }) →
  Array<{ x, y, size, opacity, phase, period, amplitude }>
```
Each field derived from `seededRandom(seed + i * <distinct prime>)` — a different prime multiplier per field (matching the existing `handheld()` preset's convention of offsetting seeds by `+99` for its second axis) so `x`/`y`/`size`/`opacity`/`phase` don't correlate with each other for the same particle index. Wrapped in `useMemo` keyed on `[count, seed]` so the field itself is generated once per mount, not per frame — only the *motion* (via `driftMotion`, which is frame-dependent) recomputes every frame.

### Theme integration
**Deliberately does NOT hardcode "warm = accent, cool = primary."** That mapping is this film's own colour argument, already owned by `Mark.jsx`'s project-local `toneColor()` — a Ring 1 component re-implementing (or importing) that mapping would either duplicate project-specific brand semantics inside the framework, or create a reverse dependency (framework importing from a project), both wrong. Instead, `DustLayer` accepts a plain **`color`** prop (a resolved hex/rgba string), and the *caller* — a project shot, or a new atmosphere-recipe field — decides which theme colour that is, exactly the way `GlowLayer`'s `glows[]` entries already carry a resolved `color` per glow rather than a `tone` enum.

Two integration points, matching the "behind" vs. "in front" placement question raised in the shared render-order section:
1. **Recipe-level (preferred default):** add an optional `dust` array to the atmosphere recipe shape in `backgrounds.js` (parallel to the existing `glows` array), e.g. one dust config per atmosphere, with the actual colour/count/etc. authored in `design/brands/atelier/index.js` (Ring 2, the film's own brand file — already the file that owns "what does `hearth` mean for this film"). `AnimatedBackground` spreads `config.dust` entries into `<DustLayer>` the same way it already spreads `config.glows` into `<GlowLayer>` — same pattern, one more field.
2. **Per-shot override (escape hatch, not the default):** a shot needing dust that isn't behind content (e.g. dust that should occlude slightly in front, for a shot wanting a near-lens read) renders `<DustLayer>` directly inside its own JSX, same way `Peak`'s streak will (Effect 5) — using the exported component directly rather than going through the atmosphere recipe.

### Props (public API)
```
DustLayer({
  count = 12,
  seed = 0,
  color,                          // resolved colour string; required in practice
  size = { min: 4, max: 14 },      // design-space px, before px() scaling
  opacity = { min: 0.06, max: 0.16 },
  region = { x: [10, 90], y: [10, 90] },  // percent bounds particles spawn within
  blur = 3,                        // design-space px
  amplitude = { min: 20, max: 60 },// drift amplitude range, design-space px
  period = { min: 380, max: 620 }, // drift period range, frames
  zIndex,                          // optional override; defaults to zIndex.glow
  style,
})
```

### Internal API
`buildParticles()` (above) plus the per-particle render, which maps each generated descriptor through `driftMotion({ frame, amplitude: particle.amplitude, period: particle.period, phase: particle.phase })` to get a `transform`, combined with the particle's static `left/top/width/height/opacity/filter:blur()` — no `mergeMotion` needed since there's exactly one motion source per particle (unlike `Mark`, which merges rotation + entrance + breathing).

### Render order / z-index / blend modes
Default `zIndex.glow` (30) when composed via `AnimatedBackground` (behind content, alongside the atmosphere's own glows — dust reads as being in the same "ambient light and air" pass as the glow blobs, which is accurate: both are meant to feel like they're in the room, not on the lens). The exposed `zIndex` override lets a shot instead place dust between `content` (40) and `overlay` (50) if a specific composition wants dust to feel nearer the camera than the subject — an explicit numeric prop, not a `depth` enum, keeping the API honest about what it actually controls. No blend mode — plain alpha-composited radial-gradient circles, matching `GlowLayer`'s approach (a "soft light object," not a texture), per the research doc's finding that mixBlendMode belongs to grain/haze, not to discrete soft shapes.

### Responsive scaling
`size`, `blur`, and `amplitude` all pass through `px()` before use. `region` (spawn bounds) stays in **percent**, not design-px, so particle placement is inherently format-independent — this sidesteps the exact bug just fixed in `GlowLayer` by never expressing position in absolute units in the first place.

### Landscape behaviour
Default `region` bounds (10–90% both axes) keep particles well inside frame on any 16:9-family format.

### Portrait behaviour
Percent-based region and `px()`-scaled size mean no special-casing is needed — but portrait's tighter width means the *same* particle count in the *same* percent region will read visually denser (less empty space per particle) than on landscape. Flagged as a **visual QA item** (not a code branch) — likely resolved by a per-format `count` reduction using the existing `useResponsive()` hook at the call site, the same mechanism `Traverse`/`Handover` already use to vary counts by format, not by adding format-awareness inside `DustLayer` itself.

### Performance considerations
12–20 divs with a CSS radial-gradient background and a `blur()` filter, animated via inline `transform` recomputed once per frame — the same order of cost as the film's existing `MarkGrid`/`Lattice` shots, which already render dozens of similarly-styled divs per frame without issue. Not expected to be measurable against the film's existing render times.

### Memoization opportunities
`buildParticles()` output memoized on `[count, seed]` (generation is a one-time cost per mount); the per-frame `driftMotion()` call is intentionally *not* memoized (it must recompute every frame — that's its job).

### Render cost
Comparable to one extra `GlowLayer` or a small `MarkGrid` — negligible at this film's shot lengths and particle counts.

### Potential edge cases
- **Transition overlap with two `DustLayer` instances co-existing** (outgoing/incoming scene during a dissolve): each has its own local `frame` and its own `seed` (if shots use distinct seeds, which they should — see Failure cases), so no visual collision beyond ordinary alpha compositing.
- **A shot with `background: 'flat'`** (Void, Doubt) that wants *no* dust at all (per the moodboard direction: Void should stay the cleanest, least-textured shot in the film) — handled by simply not populating a `dust` array for the `flat` recipe variant, not by a special "off" prop on `DustLayer` itself.

### Failure cases
- **Identical `seed` reused across every shot** would produce visually identical dust arrangements film-wide, undermining the "organic, not obviously procedural" goal (a repeating pattern is exactly what reads as synthetic). The recipe-level integration (per-atmosphere `dust` config, point 1 above) should vary `seed` per atmosphere at minimum, ideally per shot id, the same way `Traverse`'s and `Handover`'s existing per-format counts already vary by call site rather than sharing one hardcoded value.
- **Particle count creeping upward** shot by shot as "a few more couldn't hurt" is the single most likely way this effect drifts into the "particle system" look the creative brief explicitly rejects — the Visual QA checklist below includes an explicit per-shot count ceiling check for this reason.

### Rollback strategy
Because dust is additive config on top of existing recipes (not a replacement for anything), rollback is: remove the `dust` field from the affected atmosphere recipe(s) in `atelier/index.js`, or delete the direct `<DustLayer>` call from the one shot using the escape-hatch path. `DustLayer.jsx` itself can be left in the codebase unused with zero effect on the rest of the film — it's pure addition, never a modification of an existing code path.

---

## Effect 4 — Atmospheric Haze

### Existing files involved
- `src/design/brands/atelier/index.js` — where haze is actually authored (Ring 2, brand config — **not** `content.js`/`timeline.js`, and not Ring 1 framework code).
- `src/framework/components/layers/AnimatedBackground.jsx` — already spreads `config.glows[]` into `<GlowLayer>`; haze's primary implementation is simply *more entries* in that same array, so no change to this file is even required for the primary approach.
- `src/framework/components/layers/NoiseLayer.jsx` — reused, unmodified beyond the Phase 1 animation change, as the escalation path if the glow-based approach isn't enough (see below).

### New files required
None, under either the primary approach or the escalation path. This is the effect with the least new surface area, by design — the research doc's own recommendation was "start with what's already free."

### Components
None new. Primary approach reuses `GlowLayer` (via config only); escalation reuses `NoiseLayer` (a second instance, differently tuned, composed inside `AnimatedBackground` rather than `FilmOverlay` — see Render order below).

### Hooks / Utility functions
None new in either path.

### Theme integration
This effect **is** theme integration — there's no other implementation surface. Primary approach: add one additional entry to each atmosphere's `glows[]` array in `atelier/index.js`, tuned as a wash rather than a pool (large `size`, e.g. 180-220% vs. the existing 60-130% range in current recipes; low `intensity`, e.g. 0.04-0.08 vs. the existing 0.18-0.32 range; a neutral or scene-appropriate `color`). No schema change to `backgroundsFor()` — `glows` is already just an array, consumed generically.

### Props (public API)
None new. This phase ships zero component API surface — it's pure data authored in an existing config file, using props (`GlowLayer`'s existing `color`/`position`/`size`/`intensity`/`blur`/`ambient`) that already exist and are already documented above (Effect 2).

### Internal API
N/A.

### Render order / z-index / blend modes
Primary approach: same `zIndex.glow` (30) as every other glow, composed in the same `AnimatedBackground` pass, no ordering change — a haze wash is just another glow in the same array, painted in array order (later entries paint over earlier ones; a haze wash intended to sit "above" the atmosphere's directional glow should be the **last** entry in that atmosphere's `glows[]` array).
Escalation path (second `NoiseLayer` instance): would sit inside `AnimatedBackground`, **not** `FilmOverlay` — placed at `zIndex.glow` (30) or a new intermediate value between `glow` (30) and `content` (40), tuned with a much lower `baseFrequency` (coarser, slower-varying noise, per the research doc's "same primitive as grain, tuned to a lower frequency") than the grain instance in `FilmOverlay`, so the two don't read as "more grain" but as a genuinely different, larger-scale quality.

### Responsive scaling / Landscape / Portrait
Inherits whatever `GlowLayer`'s scaling fix (Effect 2) already provides — no separate work. A haze wash sized in percent-of-width (like all glows) is format-independent by construction.

### Performance considerations
Primary approach: zero — it's one more object in an array already being mapped over `GlowLayer`. Escalation path: one more `NoiseLayer`-class SVG filter, same negligible cost profile established in Effect 1.

### Memoization opportunities
None beyond what `GlowLayer`/`NoiseLayer` already do internally.

### Render cost
Negligible under either path.

### Potential edge cases
- The research doc's own tension: a glow-shaped wash reads as "more light" (physically, it *is* a light source), not true haze (which should soften/desaturate what's behind it, uniformly). This is a **visual judgment to make during Phase 4 QA**, not a technical unknown — the phase is structured explicitly so that if the primary approach doesn't read as atmospheric density, the escalation path is already scoped and ready rather than requiring a new research cycle.

### Failure cases
If neither the glow-wash nor the coarse-turbulence escalation reads as genuine haze once test-rendered, the correct response (per the locked research decision) is to **drop the effect for this film**, not to reach for `backdrop-filter` or WebGL — those were already excluded on aesthetic grounds in `VFX_RESEARCH.md`, independent of what a technical test would show. Haze is the one effect in this document explicitly allowed to simply not ship if it doesn't clear the bar.

### Rollback strategy
Primary approach: remove the added `glows[]` entries from `atelier/index.js`. Escalation path: remove the second `NoiseLayer` instance from wherever it was added. Either way, a config-only or single-component-instance removal — no dependent code anywhere else in the film references haze directly.

---

## Effect 5 — Lens Streak (Peak-specific)

### Existing files involved
- `src/projects/from-idea-to-reality/shots/momentum.jsx` — the **only** file this effect touches. Specifically the `Peak` component (currently: a `MarkGrid` band behind + a `Stack` of `Mark` planes in front, per the code reviewed during the Creative Direction pass).
- `src/design/brands/atelier/index.js` — read only, for `theme.colors.primary` (the streak's colour, matching the `studio` atmosphere's cool tone) via the already-standard `useTheme()` call every shot makes.

### New files required
None. This is deliberately **not** a framework component — per the locked decision ("procedural and authored specifically for the Peak shot") and consistent with `Mark.jsx`'s own documented precedent that single-film, single-purpose visual elements belong in the project, not in `framework/`. A reusable `LensStreakLayer` would be solving a generality problem this film doesn't have (the effect is used exactly once).

### Components
None new — an inline JSX block added directly inside `Peak`'s existing return statement.

### Hooks
`useCurrentFrame()` — already called in `Peak` (for the existing `swell` animation). No new hook.

### Utility functions
None new. The streak's shape is a single styled `<div>` (a heavily blurred, skewed/scaled gradient), not a generative field — there's nothing here that benefits from a reusable pure function the way particle generation does.

### Theme integration
`theme.colors.primary` (indigo, already resolved via `useTheme()`, which `Peak` doesn't currently call but every other shot in the file does — trivial to add) — no new theme fields, no brand-file changes.

### Props (public API)
None — this is not a component with a public surface, it's a fixed piece of `Peak`'s own JSX. No prop design needed.

### Internal API
A local (unexported) style computation inside `Peak`, e.g. a `linear-gradient`/`radial-gradient` combination with a `transform: skewX(...) scaleX(...)`, blurred via `filter: blur(px(...))`, blended with `mixBlendMode: 'screen'`. Static per-shot (no animation of its own beyond what `Peak`'s existing `swell` scale transform already imparts) — per the research doc's recommendation, the streak simply *exists* rather than sweeping, consistent with "restrained, earned once."

### Render order / z-index
Renders as a `position: absolute; inset: 0` sibling **within `Peak`'s own returned JSX** — i.e., inside `children` in the shared render-order diagram above, meaning it sits above `AnimatedBackground` (as part of scene content) and below `FilmOverlay`'s grain/vignette (unchanged, still the outermost pass), and — this is a deliberate, physically-motivated choice, not an oversight — **inside the camera-transformed wrapper**, so it inherits `Peak`'s `push` camera move along with the rest of the shot's content. This is correct: a real anamorphic streak is a property of the lens/camera, which moves with the camera, unlike grain (a property of the recording medium, camera-independent, correctly isolated in `FilmOverlay`). No new `zIndex` token needed — it's the last element in `Peak`'s local JSX, so it paints above the `MarkGrid`/`Stack` already there by DOM order alone, within the same stacking context.

### Blend modes
`screen` (bright-on-dark additive-style blend) — matches how every other bright/glow element in this theme already composites (`GlowLayer`'s radial gradients rely on alpha over a dark ground for the same visual effect; `screen` is the appropriate mode specifically because the streak needs to visibly brighten whatever's beneath it, including the already-bright plane stack, without a hard edge).

### Responsive scaling
The streak's length/thickness/blur must go through `px()` (via `useFormat()`, which `Peak` doesn't currently import — trivial addition) exactly like every other design-space measurement in the codebase, for the same reason established in Effect 2: an unscaled absolute-px streak would look proportionally thinner at 4K.

### Landscape behaviour
Authored and tuned against the Landscape composition first (per the existing project convention — every shot in this film is authored landscape-first, with `useResponsive()` only introduced where a genuine per-format divergence is needed, e.g. `Doubt`'s isolation offset).

### Portrait behaviour
A horizontal anamorphic streak is a landscape-native artifact — on the Reel (9:16) format, the same streak geometry will read as proportionally much wider relative to frame width. This needs an explicit `useResponsive()` check (the same mechanism `Doubt`/`Drift`/`Traverse` already use) to confirm during QA whether the streak needs a portrait-specific angle/length, or whether — given it's meant to be subtle — the landscape geometry simply scaled by `px()` is close enough. Flagged as a **required visual check**, not assumed either way in this document.

### Performance considerations
One additional styled `<div>` in one shot, four bars long (per the current `timeline.js` bar count for `peak`) — no measurable cost.

### Memoization opportunities
None needed — the style object is cheap to compute and doesn't depend on anything that changes per-frame beyond what `Peak` already recomputes (`swell`).

### Render cost
Negligible.

### Potential edge cases
- **Interaction with the `peak → form` dissolve** (the film's own splice point, both musically — per the soundtrack integration — and visually): the streak must not read as a hard-edged artifact that "pops" oddly mid-crossfade. Since it's fully inside `Peak`'s own content layer, it dissolves naturally with the rest of the shot during the existing `fade` transition — no special handling required, but worth a specific frame-by-frame look during QA at the transition boundary.
- **Interaction with `Peak`'s existing `swell` scale transform:** the streak sits inside the same scaled wrapper as the rest of `Peak`'s content today only if it's placed inside that wrapper; placing it as a sibling at the outer level of `Peak`'s return (outside the `swell`-scaled div) keeps the streak's own scale stable while the content beneath it breathes — the more correct choice, and the one assumed above ("sibling within Peak's own returned JSX," not nested inside the existing scaled `<div>`).

### Failure cases
If the procedural gradient doesn't read as "lens artifact" rather than "flat highlight bar" once test-rendered against the actual composited `Peak` frame (the specific risk called out in `VFX_RESEARCH.md`), the documented fallback is a single licensed streak asset for this one shot only — not a re-opening of the broader research question.

### Rollback strategy
Delete the one JSX block from `Peak`. Nothing else in the film references it — the smallest-blast-radius rollback of all five effects, by construction.

---

## Implementation Roadmap

### Phase 1 — NoiseLayer improvements (Film Grain)
**Work:** Add `animated`/`cycleFrames` props to `NoiseLayer`; default `animated = true`.
**Expected visual result:** Grain visibly "breathes"/dances rather than sitting as a static overlay, across all 19 shots simultaneously (single shared component).
**Testing:**
- Render the same short frame range (e.g. 30 frames spanning one shot) before/after, frame-by-frame diff to confirm the texture actually changes frame to frame.
- Time a full-film render before/after to confirm no measurable regression (see Performance note above — expected negligible, confirm rather than assume).
- Visual watch at real playback speed (30fps) — grain should read as texture, not as flicker or noise.
**Success criteria:** Grain is visibly alive at playback speed, indistinguishable in cost from the static version in a full render timing, and not consciously distracting in any of the 19 shots.
**Estimated complexity:** Low (single component, ~15-line change).
**Risk level:** Low-medium — the only real risk is aesthetic (too strong/distracting), not technical; caught by visual QA, not by tests.
**Dependencies:** None — first phase, nothing else depends on it.
**Testing checklist:**
- [ ] Frame-by-frame diff confirms per-frame variation
- [ ] Full-film render time within noise of pre-change baseline
- [ ] Playback-speed watch on all 19 shots, dark (`flat`/`hearth`) shots specifically (grain is most visible against the darkest atmospheres)
- [ ] Both formats (Landscape, Reel) checked — grain tiling already format-agnostic, confirm visually rather than assume
**Rollback plan:** Flip `animated` default to `false`.
**Visual QA checklist:**
- [ ] Grain reads as "shot on something," not as a filter effect
- [ ] No visible strobing/flicker at 30fps
- [ ] Consistent character across the film's four atmospheres

---

### Phase 2 — Glow improvements (Bloom)
**Work:** Route `GlowLayer`'s `blurRadius` through `px()`.
**Expected visual result:** Bloom softness scales proportionally with render resolution/format — 4K exports bloom the same *relative* amount as 1080p preview, rather than under-blurring.
**Testing:**
- Render one `hearth` shot (e.g. `Spark`) at 1080p and at the film's true 4K delivery resolution; compare bloom softness proportionally (not pixel-for-pixel, which will always differ — compare glow radius relative to frame width).
- Render the same shot in Landscape and Reel formats, confirm both scale correctly relative to their own frame width.
**Success criteria:** Bloom softness is visually proportional across all resolutions/formats tested; no shot looks "under-lit" at 4K relative to its 1080p preview.
**Estimated complexity:** Trivial (one line).
**Risk level:** Low — pure bug fix, well-understood mechanism, but touches every shot with a glow (most of the film), so full visual re-pass is warranted regardless of how small the code change is.
**Dependencies:** None (independent of Phase 1); Phase 4's primary approach (haze-as-glow) depends on this fix being in first, so it doesn't inherit the same scaling bug.
**Testing checklist:**
- [ ] 1080p vs. 4K bloom comparison on at least one shot per atmosphere (`flat` has no glow — N/A; `hearth`, `workshop`, `studio` all have at least one)
- [ ] Landscape vs. Reel comparison
- [ ] Full 19-shot visual pass for any glow that now looks unexpectedly different from the previously-authored (buggy) look
**Rollback plan:** Revert the one line (`px(blur ?? theme.blurs.ambient)` → `blur ?? theme.blurs.ambient`).
**Visual QA checklist:**
- [ ] No shot's glow reads as noticeably harder-edged or softer than intended once re-tuned
- [ ] `studio` atmosphere's dual glow (indigo + amber) stays balanced, not one overpowering the other post-fix

---

### Phase 3 — DustLayer
**Work:** Build `DustLayer.jsx`; author initial `dust` recipe entries for `hearth` and `workshop`/`studio` atmospheres in `atelier/index.js`.
**Expected visual result:** Sparse, slow, soft-focus motes visible in `hearth` (warm) and `workshop`/`studio` (cool) shots, adding depth without ever being individually "counted" by a casual viewer.
**Testing:**
- Isolated component test: render `DustLayer` alone against a black frame at a few different `seed` values to confirm particles are actually randomized (not visually identical runs) and stay within the specified `region` bounds.
- Composited test: render one shot per affected atmosphere with dust on vs. off, side by side.
- Distributed-render check: render the same frame range via two different concurrency settings (e.g. `--concurrency=1` vs. the project's default) and diff the output — confirms the seeded-PRNG determinism claim holds in practice, not just in theory.
**Success criteria:** Dust reads as atmosphere, not as a particle system (per the research doc's own governing table — sparse, out-of-focus, non-uniform motion); zero visible seams between concurrent render chunks.
**Estimated complexity:** Medium (one new component with real logic — particle generation, per-particle motion, region math — the most substantial single piece of code in this whole plan).
**Risk level:** Medium — the main risk is aesthetic drift toward "particle system," which the research doc explicitly warns against; mitigated by a hard particle-count ceiling in QA, not just in the initial numbers.
**Dependencies:** Should land after Phase 2 (so any glow-adjacent visual tuning during dust QA is judged against already-correct bloom scaling, not a moving target).
**Testing checklist:**
- [ ] Particle randomization confirmed visually distinct across ≥3 seed values
- [ ] Particles stay within configured `region` bounds at all four format buckets (landscape, portrait, square, ultrawide)
- [ ] Distributed-render determinism check (diff across concurrency settings) passes
- [ ] Full-film render time impact measured (expected negligible; confirm)
**Rollback plan:** Remove `dust` entries from `atelier/index.js`; `DustLayer.jsx` remains in the codebase, unused, zero effect on the film.
**Visual QA checklist:**
- [ ] Dust is never individually "countable" at a glance in any shot
- [ ] No two dust motes move in visibly identical rhythm (phase/period randomization working)
- [ ] Warm/cool tint correctly matches each shot's `tone` argument (amber in `hearth`, indigo in `workshop`/`studio`)
- [ ] Portrait format specifically checked for over-density (flagged risk in the architecture section above)

---

### Phase 4 — Atmospheric Haze
**Work:** Add tuned low-intensity, large-radius `glows[]` entries per atmosphere in `atelier/index.js` (primary approach). If insufficient on review, add one coarser-frequency `NoiseLayer` instance inside `AnimatedBackground` (escalation path).
**Expected visual result:** Shots read as slightly less "clean"/synthetic, with a soft overall density rather than pure gradient-on-black. Subtle enough that the difference is only obvious in an on/off comparison, never on its own.
**Testing:**
- On/off comparison render, one shot per atmosphere.
- If escalation path is needed: confirm the added `NoiseLayer` instance is visually distinct from the existing grain instance in `FilmOverlay` (different frequency/scale), not a redundant "more grain."
**Success criteria:** Either the primary or escalation approach reads as genuine atmospheric density in on/off comparison — or, per the locked decision, the effect is dropped for this film rather than escalating further.
**Estimated complexity:** Low (primary approach is pure config; escalation path reuses Phase 1's already-built mechanism with different tuning).
**Risk level:** Low-medium — the risk is entirely aesthetic (does it read as haze or as more light), not technical; explicitly allowed to simply not ship.
**Dependencies:** Phase 2 (so the glow-based primary approach isn't built on the pre-fix scaling bug) and Phase 1 (if the escalation path is needed, it reuses the animated-grain mechanism).
**Testing checklist:**
- [ ] On/off comparison, one shot per atmosphere
- [ ] Escalation path (if used) confirmed visually distinct from existing grain
- [ ] Render time impact confirmed negligible
**Rollback plan:** Remove the added `glows[]` entries (primary) or the second `NoiseLayer` instance (escalation).
**Visual QA checklist:**
- [ ] Haze softens/adds density rather than reading as an additional visible light source
- [ ] No shot looks "washed out" or loses its existing vignette-driven edge darkening
- [ ] Explicit sign-off recorded either way — "shipped" or "dropped, didn't clear the bar" — so this doesn't silently become an open question later

---

### Phase 5 — Peak Lens Streak
**Work:** Add the streak `<div>` to `Peak` in `momentum.jsx`.
**Expected visual result:** A single, restrained, cool-toned diagonal/horizontal highlight crossing `Peak`'s composition — the one deliberate "lens artifact" in the entire film.
**Testing:**
- Full-shot render, both formats (Landscape, Reel) — confirm whether portrait needs its own geometry (flagged as an open question above, resolved here).
- Render across the `peak → form` transition boundary specifically, frame-by-frame, to confirm no hard-edged pop during the dissolve.
**Success criteria:** Reads unambiguously as a lens artifact, not a flat highlight bar; restrained enough that it doesn't compete with the shot's existing lattice/plane composition; behaves correctly through the dissolve into `Form`.
**Estimated complexity:** Low (single shot, single static element, no new component).
**Risk level:** Low-medium — smallest blast radius of all five effects (one shot only), but the one effect the research doc flagged as hardest to get "authentically lens-like" from pure CSS/SVG; real risk of needing the licensed-asset fallback.
**Dependencies:** None technically, but sequenced last because it's the most purely aesthetic/iterative of the five (benefits from the film's other atmosphere work — Phases 1-4 — being visually settled first, so it's tuned against the shot's final look, not an intermediate one).
**Testing checklist:**
- [ ] Landscape render reviewed
- [ ] Reel render reviewed, portrait-specific geometry decision made explicitly (adapt vs. keep as-is)
- [ ] Transition-boundary frame-by-frame check (`peak → form`)
**Rollback plan:** Delete the JSX block from `Peak`.
**Visual QA checklist:**
- [ ] Reads as lens artifact, not flat highlight
- [ ] Doesn't compete with or obscure the lattice/plane composition beneath it
- [ ] Correctly inherits `Peak`'s camera push (confirmed as the intended, physically-motivated behavior, not a bug)
- [ ] If it fails this checklist, documented decision: iterate further vs. fall back to a single licensed asset for this shot only

---

## Implementation Order

### Priority
1. **Phase 1 (Grain)** — lowest risk, highest immediate visual return, touches every shot, unblocks nothing else but is safest to land first and live with.
2. **Phase 2 (Bloom fix)** — a real bug fix; every phase after it (Dust, Haze) benefits from bloom already being format-correct.
3. **Phase 3 (DustLayer)** — the largest single piece of new code; sequenced after the two fixes so it's tuned against an already-correct baseline.
4. **Phase 4 (Haze)** — explicitly allowed to fail/drop; sequenced after Dust so both "new atmosphere" effects are judged together rather than piecemeal.
5. **Phase 5 (Peak streak)** — most purely aesthetic, smallest blast radius, benefits from every other visual change being settled first.

### Expected git commits (suggested names)
1. `feat(framework): animate NoiseLayer grain per-frame`
2. `fix(framework): scale GlowLayer blur radius with format`
3. `feat(framework): add DustLayer component`
4. `feat(from-idea-to-reality): author dust recipe entries in atelier theme`
5. `feat(from-idea-to-reality): add atmospheric haze glow entries in atelier theme` *(or, if escalation needed:)* `feat(framework): add coarse turbulence haze pass to AnimatedBackground`
6. `feat(from-idea-to-reality): add procedural lens streak to Peak shot`

Each commit independently revertable, matching the per-phase rollback strategies above — no commit depends on a later one being present to remain functional.

### Expected code review checklist
- [ ] No `Math.random()` (or any non-seeded randomness) introduced anywhere — every random-looking value traced to `seededRandom` with an explicit seed
- [ ] No new absolute-px values that bypass `px()`
- [ ] No new component duplicates existing `GlowLayer`/`NoiseLayer`/`VignetteLayer` functionality instead of extending/composing it
- [ ] `DustLayer` does not hardcode tone→colour mapping (respects the Ring-separation decision above)
- [ ] `timeline.js` and `content.js` untouched in every commit
- [ ] No new npm dependency added
- [ ] Every new/changed component still exports through the existing barrel (`layers/index.js`) if it's meant to be reusable

### Regression checklist
- [ ] All 19 shots render without error, both formats
- [ ] Full-film duration unchanged (VFX work touches no timing/bar values)
- [ ] Existing two dissolve points (`peak → form`, `handover → title`) still read cleanly with grain/dust now present on both sides of the cut
- [ ] Soundtrack splice (from the prior audio-integration pass) unaffected — VFX work touches no audio code

### Performance checklist
- [ ] Full-film render time, before vs. after all five phases, within acceptable margin (define "acceptable" as: no phase individually adds more than a few percent, and the combined total stays render-farm-practical — exact numbers to be set once a baseline render time is measured, not assumed here)
- [ ] Distributed-render determinism re-confirmed once all five effects are combined (not just per-phase in isolation) — concurrent chunk boundaries checked for any visible seam across the *combination* of grain + dust + haze all being frame-dependent simultaneously

### Render quality checklist
- [ ] 4K delivery resolution spot-checked for every effect (grain scale, bloom softness, dust size/blur, haze density, streak thickness) — not just the 1080p preview resolution used during iteration
- [ ] Both Landscape and Reel masters checked independently, not assumed equivalent from one format's review
- [ ] Every effect re-confirmed against the "cinematic, not game-like" governing table from `VFX_RESEARCH.md` as a final pass, film-wide, once all five are combined — the cumulative effect of five subtle layers is itself worth one last holistic watch, since each one individually passing QA doesn't guarantee they don't add up to "too much" together

---

No code has been written from this document. Once approved, Phase 1 is the first implementation step.
