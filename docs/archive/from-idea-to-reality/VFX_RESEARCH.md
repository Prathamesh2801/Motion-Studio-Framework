# From Idea to Reality — Procedural VFX Research

> **ARCHIVED.** This is the decision record for building VFX procedurally instead of
> licensing assets — the reasoning holds, but whether every recommended phase was fully
> executed is unverified; treat `IMPLEMENTATION_ARCHITECTURE.md` (also archived) and the
> actual `framework/components/layers/` files as the things to check, not this memo. See
> `../../PROJECT_ARCHITECTURE.md`.

**Status:** Research only. No implementation in this document.
**Supersedes:** the "Asset Acquisition Guide" portion of `PRODUCTION_DESIGN.md` §2/§5 for Film Grain, Dust, Bloom, and Lens Streak — those are re-scoped here from "license/source" to "build procedurally," pending the recommendations below. Atmospheric Haze is a new addition, not in the original plan. Everything else in `PRODUCTION_DESIGN.md` (soundtrack, GitHub brand asset, moodboard references) is unaffected.
**Grounded in what already exists:** this film's rendering stack already has a working, in-production procedural VFX layer — `src/framework/components/layers/` (`NoiseLayer`, `VignetteLayer`, `GlowLayer`, `GradientLayer`, `GridLayer`), composed by `AnimatedBackground` (behind content) and `FilmOverlay` (in front of content). Grain and bloom are **not net-new problems** — they're already solved once, cheaply, in CSS/SVG. This research treats that as the baseline to extend, not a green field.

---

## Governing principle, before the per-effect breakdown

Every "how do the pros do this" trail leads to the same underlying primitive, whether the tool is Nuke, After Effects, Redshift, or a browser:

- **Grain** = a noise function, resampled every frame, composited at low opacity.
- **Bloom** = isolate the bright pixels ("bright-pass"), blur them, add the blur back on top.
- **Dust** = a small number of soft, out-of-focus sprites, moving slowly, usually with real depth-of-field blur so they read as "in the air near the lens," never as countable objects.
- **Lens streak** = a bright source stretched and blurred heavily along one axis only (anisotropic blur), not a symmetric glow.
- **Haze** = either a very-low-frequency noise wash, or literal optical blur applied to whatever sits behind the haze layer.

Premium studios (Buck, ManvsMachine, Ordinary Folk, Giant Ant, Apple's in-house team) get a "cinematic, not game-like" result from applying these primitives **with restraint and physical motivation**, not from having access to a technique the rest of the industry doesn't. The tells that separate "premium" from "game-like" are consistent across all five effects:

| Premium | Game-like |
|---|---|
| Effect only appears where physically motivated (bloom only near an actual bright source; haze only softens, never adds visible shapes) | Effect applied uniformly as a "look" regardless of what's underneath |
| Asymmetric, imperfect (real lens streaks aren't perfectly straight; real dust doesn't move in unison) | Symmetric, perfectly regular, obviously parametric |
| Sub-perceptual at rest — noticed only in comparison, never consciously | Loud enough to be a selling point of the frame |
| Sparse (a handful of dust motes) | Dense ("particle system" read — hundreds of identical sprites) |
| In focus with the shot's own depth logic (dust near camera = soft/large; far = tighter/dimmer) | Flat, same treatment regardless of implied depth |

This table is the actual filter behind every recommendation below — not a separate aesthetic opinion bolted on afterward.

**One hard technical constraint, shared by every recommendation:** Remotion renders are distributed across concurrent workers by frame range (we saw `Concurrency 6x` in this project's own render logs). Any "randomness" in a procedural effect must be a **pure, seeded function of the frame number** — never `Math.random()` called fresh at render time — or parallel-rendered chunks will show visible discontinuities at their boundaries. `NoiseLayer`'s existing `seed` prop already respects this (it's a static prop, not a runtime random call); every new effect researched below inherits the same rule.

**Why WebGL is mostly absent from these recommendations:** because Remotion always renders through one controlled headless Chromium instance, there's no cross-browser compatibility risk to hedge against the way a public website would need to — Chromium supports SVG filters, Canvas 2D, and WebGL1/2 equally reliably. So the decision to use or skip WebGL here is purely about **whether it earns its complexity**, not about compatibility. For every effect in this film, the honest answer is: the visual target is a handful of soft, simple shapes and gradients, which CSS/SVG already renders at GPU-composited quality — WebGL's advantage (thousands of shaded primitives, real-time interactivity) isn't a problem this film has.

---

## Film Grain

### Possible implementations
1. **SVG `feTurbulence` filter, static per shot** — *already implemented* (`NoiseLayer.jsx`): a `fractalNoise` filter baked into a data-URI, tiled across the frame at fixed opacity/blend mode.
2. **SVG `feTurbulence`, re-seeded per frame** — same primitive, but the `seed` attribute is a function of `useCurrentFrame()` (or `frame % N` for a bounded, seamless-looking cycle), so the noise pattern actually changes frame to frame the way physical grain does.
3. **Canvas 2D, per-frame pixel noise** — draw random per-pixel luminance values into a `<canvas>` each frame via `putImageData`, seeded by frame number.
4. **Pre-rendered grain plate (licensed video/PNG sequence)** — a real scanned-film grain loop, composited via `screen`/`overlay` blend.
5. **CSS-only approximation** (repeating gradients, dithered patterns) — cosmetically close at a glance, technically the weakest option.

### Pros / Cons

| Approach | Pros | Cons |
|---|---|---|
| SVG static (current) | Zero asset, resolution-independent, already working, near-zero cost | Doesn't animate — reads as a fixed dirty overlay rather than living grain once you look for it |
| SVG re-seeded per frame | Same zero-asset/resolution-independence, now genuinely animated, still a ~15-line change to an existing component | Slightly more render work per frame (negligible — SVG filters are GPU-composited) |
| Canvas per-pixel | Maximum control over the noise distribution (can hand-tune the luminance histogram to mimic a specific film stock) | Real engineering cost for a result the SVG filter already gets close enough to; manual seeded-PRNG bookkeeping to avoid the parallel-render discontinuity issue |
| Licensed grain plate | Most "authentic" — actual scanned grain has irregularities a procedural function won't perfectly replicate | Needs sourcing at native 4K to avoid visible upscale softness (hundreds of MB per loop); fixed loop length means visible repetition on a longer film; another asset dependency for an effect the SVG approach already handles well |
| CSS-only | Simplest possible code | Visibly patterned/banded at real scrutiny; the weakest quality of the set |

### Performance
SVG filter approaches (current and re-seeded) are negligible — the noise texture is a small tiled data-URI, GPU-composited by Chromium's own SVG filter pipeline, no different in cost from any other `background-image`. Canvas per-pixel noise is heavier (a full `putImageData` write per frame) but still trivial at the frame counts this film renders. A licensed video plate adds decode cost per frame (reading and blending a second video stream) — the most expensive option, ironically, despite requiring no CPU-side generation.

### Visual quality
Re-seeded SVG grain is the only option in this set that gets the one property real grain actually has and the current static implementation doesn't: **temporal variation**. That's the single biggest lever on "does this look shot on something" — bigger than the exact noise algorithm.

### Browser compatibility
Not a meaningful axis here — see the governing note above. Chromium supports `feTurbulence` fully; this has been true for over a decade.

### Remotion compatibility
All SVG/Canvas approaches are standard React/CSS and need nothing Remotion-specific. A licensed video plate would go through Remotion's `<Video>`/`<OffthreadVideo>` — also fine, just a heavier dependency.

### Landscape & Portrait compatibility
`NoiseLayer` already tiles as an `AbsoluteFill` background image regardless of frame aspect ratio — this is already correct and needs no format-specific handling in any of the SVG/Canvas approaches. A licensed plate authored for 16:9 would need either a separate 9:16 asset or an awkward crop/stretch — a real practical downside for the reel format this film also ships.

### Does it scale cleanly to 4K?
SVG filters: **yes, natively** — `feTurbulence` operates in device pixels at render time, so a 4K render gets 4K-resolution grain for free, no source asset to re-source at higher resolution. This is a genuine, concrete advantage over any pre-rendered plate, which would need to be licensed/sourced at true 4K or visibly soften under upscale.

### Recommendation
**Keep and extend the existing `NoiseLayer` (SVG `feTurbulence`) — animate its seed per frame instead of leaving it static.** This is the one effect where the current implementation is already the right architecture; the only real gap is that it doesn't move. No new dependency, no new asset, resolution-independent by construction. Do not license a grain plate — it solves a problem (authenticity of the noise pattern) this film doesn't actually have, at the cost of two problems it doesn't need (asset weight, per-format duplication).

---

## Dust

### Possible implementations
1. **Sparse CSS/DOM soft-circle motes** (10–20 absolutely-positioned divs, radial-gradient + blur, animated via the framework's existing ambient-motion presets).
2. **Canvas 2D particle draw** (same visual idea, drawn into a single canvas element instead of N DOM nodes).
3. **WebGL/shader particle system** (GPU-instanced points, e.g. via `three.js`).
4. **Licensed video/PNG particle overlay** (the original Production Design plan).
5. **A coarse, slow, very-low-opacity turbulence wash** (same primitive as grain, tuned to a lower frequency and slower animation) standing in for "dust" as a textural quality rather than discrete motes at all.

### Pros / Cons
- **CSS/DOM motes:** trivially recolor per shot (reuse the theme's `tone` — amber for `hearth`, indigo for `workshop`/`studio`, exactly the film's existing colour argument), compose naturally with the existing three-depth parallax system, zero assets, and — critically — an *intentionally low* particle count (10–20) is exactly what the Production Design brief already specifies ("sparse, slow-drifting"), so this approach isn't a compromise version of a "real" particle system, it's already the correct scale for what the film wants. Con: at high counts (50+) DOM-node overhead becomes a real (if still render-time-cheap) concern — but this film explicitly doesn't want high counts.
- **Canvas particle draw:** more efficient at large counts, finer control over per-particle blur without relying on CSS `filter: blur()` per element. Con: real engineering cost for a benefit (handling hundreds of particles) this film's "sparse" brief doesn't need.
- **WebGL/shader:** the correct tool if the brief were "a dense, physically-simulated dust field" — it is not. Con: this is precisely the "particle system that looks like a particle system" failure mode the creative brief explicitly warns against; GPU-instanced points read as *countable* far more easily than a handful of hand-placed, individually-tuned soft shapes.
- **Licensed overlay:** real photographed bokeh/depth-of-field quality that's genuinely hard to fake with flat CSS blur. Con: fixed composition (can't react to a specific shot's glow position or color), format duplication (landscape vs. reel), asset weight, and — the real dealbreaker — no coupling to the existing tone/atmosphere system, so it would need per-shot color grading to avoid looking pasted-on.
- **Coarse turbulence wash:** cheapest option of all, reuses the grain primitive verbatim with different tuning. Con: reads as texture, not depth — loses the "motes drifting past camera" quality that sells proximity.

### Performance
CSS/DOM motes at the film's intended count (10–20) are effectively free at render time — this is the same order of magnitude as the glow layers already in every shot. Canvas and WebGL options are more capable at higher counts this film doesn't need, so their performance advantage is moot here.

### Recommendation
**Build a new `DustLayer` component in the same family as `GlowLayer`** (`framework/components/layers/`): a small, seeded-random set of soft radial-gradient circles, blurred, tinted per atmosphere tone, animated on the framework's existing `useAmbientMotion`/`drift` preset with per-particle randomized (but seeded — see the governing constraint) phase/amplitude/period so the motion doesn't read as uniform. Optionally layer a whisper of the coarse-turbulence wash (option 5) *underneath* the discrete motes for shots that want more atmospheric depth without more countable objects. Do not license video/PNG dust, and do not reach for Canvas or WebGL — both solve a scale problem this film's own creative brief says it doesn't have.

---

## Bloom

### Possible implementations
1. **CSS radial-gradient + `filter: blur()`** — *already implemented* as `GlowLayer` (background atmosphere) and inline in `Mark.jsx`'s `boxShadow` (the mark's own light).
2. **SVG `feGaussianBlur`** — functionally near-identical to CSS blur under Chromium's compositor; no meaningful difference in output or cost.
3. **True bright-pass + blur + additive composite**, the actual VFX-pipeline technique (Nuke/AE/Redshift/Unreal): render the scene, threshold the bright pixels into a separate buffer, blur that buffer, add it back over the original — requires an offscreen render pass (Canvas/WebGL capture of the live DOM, or moving the marks themselves into a canvas/WebGL scene).
4. **`box-shadow`-based per-object glow** — *already implemented* on `Mark.jsx`, sized to the object itself so bloom scales with the mark rather than being a fixed-radius overlay.

### Pros / Cons
- **Current CSS approach (#1/#4):** already achieving the visual result a "real" bright-pass pipeline achieves, because we're compositing a *synthetic* glow shape (a gradient sized and placed to match a known object) rather than deriving one from arbitrary footage — the step a true bright-pass pipeline exists to automate (finding what's bright) is unnecessary when we already know exactly what's bright, because we drew it. Con (found during this research, not previously flagged): `GlowLayer`'s `blur` radius is a flat pixel value from the theme's `blurs` token, **not** passed through the format's `px()` responsive scaler the way glow *size*/*position* already are — meaning a blur tuned by eye at 1080p will look relatively tighter/under-blurred at a 4K export. This is a real gap worth fixing before any new bloom work builds on top of the current layer.
- **True bright-pass pipeline (#3):** would make bloom *automatically* respond to whatever is actually bright on screen, which matters when the bright source is arbitrary/unpredictable (live footage, complex CG). Con: this film's bright sources are never arbitrary — they're synthetic marks the code already fully controls — so the automation this technique buys is solving a problem that doesn't exist here, at the cost of either duplicating the DOM into a canvas per frame (fragile, slow) or moving the mark-rendering system into WebGL (a real architecture change, explicitly out of scope for a "creative refinement" pass).

### Recommendation
**Keep the current CSS radial-gradient/blur/box-shadow approach — it's already the premium-quality answer, just fix the one scaling gap.** Route `GlowLayer`'s blur radius through the same `px()` responsive scaling already applied to its size and position, so 4K exports bloom proportionally to preview rather than under-blurring. No new dependency, no offscreen render pass, no WebGL — the "real" VFX technique's actual value proposition (finding bright pixels you didn't place yourself) isn't a problem this film has.

---

## Lens Streak

### Possible implementations
1. **CSS `linear-gradient`/skewed radial "bar"** — a thin, elongated, blurred bright shape via a scaled/skewed gradient div, `screen`/`lighten` blend.
2. **SVG stretched radial gradient + blur** — more control over the falloff curve than CSS gradient stops allow.
3. **Canvas-drawn streak with a custom falloff function** — precise control over the sharp-core/soft-tail profile real anamorphic streaks have.
4. **Licensed video/PNG streak overlay** — the original Production Design plan (real anamorphic photography, genuine asymmetric stretch and chromatic fringing).

### Pros / Cons
- **Procedural (#1/#2/#3):** costs nothing, tints exactly to the `studio` atmosphere's cool tone, and — the real advantage — can be hand-tuned against *this exact shot's actual composited render* (Peak, with its specific lattice/plane arrangement) rather than composited on top of it generically. Con: getting the characteristic asymmetric stretch and subtle chromatic fringe of a *real* anamorphic streak with pure gradients takes real hand-tuning to avoid looking like a flat highlight bar rather than a lens artifact.
- **Licensed asset:** genuinely hard to beat on raw photographic authenticity for this one specific artifact — real anamorphic streaks have irregularities (fringing, slight curvature) that are the hardest of all five effects in this document to fake convincingly from scratch. Con: this effect appears in exactly **one shot**, for a few seconds, restrained by design (per `PRODUCTION_DESIGN.md`, "the loudest frame in the film is the one place a lens artifact is earned" — earned, not showcased). Licensing, resolving usage rights, and colour-matching a generic asset for a single few-second appearance is disproportionate effort for what the brief asks it to do.

### Recommendation
**This is the one effect in the whole set where "build it" wins specifically *because* it's minor, not despite it.** A hand-tuned CSS/SVG gradient streak — skewed, heavily blurred along one axis, blended with `screen`, colour-matched to `studio`'s indigo — authored once against Peak's actual render will look more *integrated* than a generic licensed streak sitting on top of it, and costs nothing. If, once test-rendered, the procedural version doesn't read as convincingly "lens" rather than "highlight," that's the moment to reconsider a licensed asset for this single shot only — not before.

---

## Atmospheric Haze

*New to the plan — not in the original asset list.*

### Possible implementations
1. **A second, large-radius, very-low-intensity `GlowLayer`-style wash**, reusing the existing glow component with different tuning (huge size, near-neutral or scene-tinted, minimal intensity) rather than a hard-edged pool.
2. **A coarse, low-frequency turbulence wash** (same primitive as grain, tuned to a lower frequency and near-zero opacity) — softens contrast the way real atmospheric particulate does, without adding a visible light source.
3. **`backdrop-filter: blur()`** applied to a layer sitting in front of the `back`-depth parallax elements only — genuine optical softening of what's behind it, reinforcing the existing three-depth parallax system with real blur rather than scale/position cues alone.
4. **Volumetric/god-ray shader (WebGL)** — the "real" film-VFX haze technique, simulating visible light shafts through participating media.

### Pros / Cons
- **Extra glow wash (#1):** literally free — it's new *configuration* on an existing component, not new code. Con: a glow-shaped wash reads as "more light," which is the right effect for some shots but not a true haze (haze softens everything uniformly, it doesn't add a light source).
- **Turbulence wash (#2):** genuinely reads as atmospheric density rather than added light, same zero-asset cost as grain. Con: tuning it distinctly enough from the existing grain layer (different frequency/scale) to read as a separate quality, not just "more grain," takes real eye-work.
- **`backdrop-filter` (#3):** the only option that does what real depth haze actually does — softens what's *behind* it — and it would strengthen the existing parallax depth system rather than just decorating on top of it. Con: real optical blur behind a layer is a heavier compositing operation than a flat gradient; worth a render-time check on this specific project before leaning on it (no compatibility risk per the governing note, but worth confirming render cost stays negligible at this film's scale before using it liberally).
- **Volumetric shader (#4):** the technique that produces literal, visible light shafts — exactly the "game-like" failure mode this document's governing table warns about. This film's whole visual language is restrained abstract marks on soft gradients; visible god-rays would be the loudest, least-earned effect in the entire film. **Reject outright**, regardless of technical merit.

### Recommendation
**Start with option 1 (an additional low-intensity glow wash) since it costs nothing beyond new config values on an existing component.** If a test render shows it isn't doing enough — if shots still read as too "clean" rather than atmospheric — escalate to option 2 (coarse turbulence, same family as grain) before ever reaching for `backdrop-filter` or WebGL. Volumetric shading is not a fallback under any circumstance for this film; it's excluded on aesthetic grounds regardless of what a render-cost test would show.

---

## Summary table

| Effect | Recommended approach | New dependency? | New component? |
|---|---|---|---|
| Film grain | SVG `feTurbulence`, re-seeded per frame | None | No — extend `NoiseLayer` |
| Dust | Sparse CSS/DOM soft-circle motes, seeded ambient motion | None | Yes — `DustLayer`, same family as `GlowLayer` |
| Bloom | Current CSS gradient/blur/box-shadow, blur radius fixed to scale with format | None | No — fix `GlowLayer`'s `px()` gap |
| Lens streak | Hand-tuned CSS/SVG gradient, single-shot, single-use | None | Maybe — likely inline in `Peak`, not a reusable layer (it's genuinely a one-shot effect) |
| Atmospheric haze | Extra low-intensity `GlowLayer` wash, escalate to turbulence if needed | None | No — new config, existing components |

**Net effect on `PRODUCTION_DESIGN.md`'s asset list:** the Film Grain, Dust, Light Bloom, and Anamorphic Lens Streak rows in that document's Section 2 (Asset Acquisition Guide) are superseded — none of them need sourcing from Envato/Freepik/Magnific. Only the Soundtrack and the official GitHub brand mark remain genuine external-acquisition items. This is a real simplification of the remaining production workload, not just a stylistic preference: zero licensing, zero file weight, zero per-format asset duplication, and every effect stays inside the same theme-driven system (`content.js` tone/atmosphere) that already governs the rest of the film — so a future re-grade or re-brand touches config, not footage.

No implementation in this document, per the brief. Next step, if this direction is approved, is a plan for the actual component work (`DustLayer`, the `NoiseLayer` re-seed, the `GlowLayer` blur-scaling fix, and the Peak-specific streak) — still no code until that's reviewed.
