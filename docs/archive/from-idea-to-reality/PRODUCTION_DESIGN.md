# From Idea to Reality — Production Design Package v1.0

> **ARCHIVED.** Its own header already notes `VFX_RESEARCH.md` supersedes §2/§5's asset-
> sourcing plan (procedural, not licensed, for grain/dust/bloom/streak). The typography/
> colour/lighting bibles (§5–7) are accurate ratifications of `src/design/brands/
> atelier/index.js` at time of writing, but the brand file itself is now the ground truth
> — check there first for current values. See `../../PROJECT_ARCHITECTURE.md`.

**Status:** Visual development bible. Governs asset sourcing, palette, type, lighting, and texture for the remainder of production.
**Builds on:** `CREATIVE_DIRECTION.md` v2.0 (locked). Nothing here revisits its decisions.
**Ground truth, not invention:** the film already has a real, coded design system — the `atelier` brand (`src/design/brands/atelier/index.js`) — built specifically for this film. Sections 5–8 below **ratify and document that system**, they do not propose a new one. Where this package recommends something not yet in code (overlays, textures, moodboard references), it's marked clearly as new sourcing work, not a design change.
**Scope discipline:** no implementation code, no edits to `timeline.js`, `content.js`, or the framework. Visual development only.

---

## 1. Moodboard Direction

Per section, five things the film should *feel* like, not look like — the references are for calibration, never for copying. Same eight studios recur because the film's whole register (restraint, abstraction, one strong colour argument) sits closest to a small, consistent set of them; where a studio isn't the right fit for a section, it's left out rather than forced in.

### The Void
- **Visual mood:** an empty room with the lights off, not a broken screen. Presence of absence.
- **Artistic references:** **Nothing** (the phone brand) — their entire identity is built on "the thing you notice in the dark," which is exactly this shot's job. **Instrument**'s quieter title-card work (long holds on near-nothing before a wordmark appears).
- **Lighting references:** no key light at all — reference underexposed film stock or a room lit only by a device's standby LED. The point is to avoid the "black rectangle" failure mode already flagged in the shot's own code comment.
- **Colour references:** true near-black (`ink 950` / `ink 900`), no colour cast yet — the palette hasn't spoken yet.
- **Typography references:** none — this is the one shot with no type at all.
- **Texture references:** fine film grain only, nothing else — texture is the only thing proving this is a frame and not a fault.
- **Camera inspiration:** a locked-off surveillance-style frame, held past the point of comfort — **Apple**'s product-film opens sometimes hold a full second on nothing before the product appears.
- **Motion inspiration:** the slowest fade-up in the film. Reference: **Apple** event-film opens, which routinely hold 1.5–2s on a fade from black before any content commits.

### The Spark
- **Visual mood:** a single ember, cupped in the dark. Intimate, not spectacular.
- **Artistic references:** **Giant Ant**'s soft particle/glow work (warm, single-source lighting on abstract forms) — closer to this shot than anything with hard edges. **Cub Studio**'s restraint with a single glowing object against dark ground.
- **Lighting references:** one warm point source, no fill — reference a match head or a single candle in total dark, not a lamp-lit room.
- **Colour references:** `amber 400 (#f0b45f)` at low intensity against `ink 900` — gold, not orange (the brand's own note: orange reads as a warning light, gold reads as evening).
- **Typography references:** none — the shot carries no words by design.
- **Texture references:** none beyond ambient grain — this shot should be the cleanest, least textured frame in the whole film, so its purity contrasts with everything textured around it.
- **Camera inspiration:** a slow push-in with no other movement — reference **Buck**'s tendency to let a single hero object hold the frame while only the camera moves.
- **Motion inspiration:** the "breathing" pulse — reference organic, non-mechanical looping glow animation, the kind **Ordinary Folk** uses on hero brand marks to make a static object feel alive without animating its shape.

### The Descent (Doubt / Drift / Count)
- **Visual mood:** the same ember, now unheld, drifting toward a corner. Cold procedural type stamped over it like a hospital chart.
- **Artistic references:** **ManvsMachine**'s cooler, more clinical compositions — deliberately less warm than their typical work, useful for the moment their palette goes grey. **Tendril**'s handheld-camera experiments on otherwise CG-clean scenes (the tension between a synthetic object and an imperfect, human camera is the whole point of this movement).
- **Lighting references:** the same single source as Spark, now dimming and off-centre — reference a dying flashlight, not a full blackout.
- **Colour references:** desaturating amber — the same hue losing intensity and losing centrality in frame, not shifting toward cool yet (cool is reserved for Structure).
- **Typography references:** `count`'s mono, uppercase, wide-tracked line — reference clinical/scientific data-readout type treatments (a heart-rate monitor's timestamp, not a UI label).
- **Texture references:** grain unchanged from Void — this movement's coldness should come entirely from light and camera, not from added texture, so texture stays a constant across it.
- **Camera inspiration:** seeded handheld drift — reference **Tendril**'s and **ManvsMachine**'s occasional use of a barely-perceptible handheld wobble on an otherwise locked CG composition, which reads as unease rather than as an animation bug specifically because it's subtle.
- **Motion inspiration:** the widest word-stagger in the film on `count` — reference the deliberate, weighted pacing of an on-screen statistic in a documentary lower-third, not a UI loading sequence.

### The First Mark (the hinge)
- **Visual mood:** the room's lights come back on, all at once, around one deliberate gesture.
- **Artistic references:** **Instrument**'s title-reveal work — a single confident stroke or mark appearing with real weight, not eased in. **Apple**'s "and that's it" beats — one clean gesture, held, with nothing competing for attention.
- **Lighting references:** hearth glow returns at full — reference a lamp switched on in a dark room, the warmth arriving as a contained pool with visible dark edges, not a wash.
- **Colour references:** full `amber 400`, the richest warm moment before Reality.
- **Typography references:** the one serif line in the first half — reference how **Nothing**'s product-film copy uses a single short sentence, large, held long enough to be read once and only once.
- **Texture references:** unchanged grain, no additional treatment — this shot's power comes from restraint, not embellishment.
- **Camera inspiration:** dead-stop stillness after three shots of drift — reference the "the camera finally holds still" beat used in **Buck**'s narrative work as an act break.
- **Motion inspiration:** the film's only overshoot easing curve — reference a hand-drawn line with a slight settle at the end of the stroke, the one moment the film allows itself to feel handmade rather than engineered.

### Structure
- **Visual mood:** a drafting table under a cold lamp. Competent, efficient, slightly inhuman.
- **Artistic references:** **ManvsMachine**'s grid-and-repetition studies (their technical/architectural abstract work is the closest visual cousin to this movement in the entire reference set). **Giant Ant**'s systems-diagram aesthetic when it goes cold rather than friendly.
- **Lighting references:** a single overhead source, like a drafting lamp — reference technical/blueprint photography, hard top light with no fill.
- **Colour references:** `primary` indigo (`#6366f1` family) entering the film for the first time and not leaving until Form — reference cool architectural rendering palettes (concept-model indigo/blue, not corporate blue).
- **Typography references:** `REPEAT / ALIGN / REPEAT` — reference machine-vocabulary type treatments (CNC readouts, CAD label conventions) — mono, uppercase, procedural.
- **Texture references:** the drafting grid itself is the movement's signature texture — reference technical drawing paper, blueprint grid lines, CAD viewport overlays.
- **Camera inspiration:** steady mechanical push, no organic variation — reference **ManvsMachine**'s locked, precise camera moves on procedural/generative sequences.
- **Motion inspiration:** tightening stagger (loose → base → tight) across four shots — reference a metronome accelerating, the mechanical equivalent of Descent's emotional unravelling.

### Momentum
- **Visual mood:** the system at full speed — organised complexity, not noise.
- **Artistic references:** **Buck**'s high-density, high-cut-rate sequences that stay legible under load — the best reference in the whole set for "how do you go fast without turning to mush." **Ordinary Folk**'s layered parallax work for the `Layers`/`Depth` shots specifically.
- **Lighting references:** both hues lit at once — indigo overhead, amber below, in tension — reference dual-source lighting setups where neither source dominates (concert/stage lighting rather than a single key).
- **Colour references:** indigo and amber fully interleaved for the first time — the film's central colour argument, staged.
- **Typography references:** none in this movement — it's the one stretch of the film that argues entirely through image and cut rhythm.
- **Texture references:** subtle ambient bloom on the glowing marks, kept restrained — reference **Buck**'s tendency to let glow read as light rather than as a filter effect.
- **Camera inspiration:** `pan`/`push` alternation, one genuine lateral move (`Traverse`) — reference **ManvsMachine**'s and **Buck**'s use of one outlier camera move mid-sequence to prevent visual monotony.
- **Motion inspiration:** six shots, six compositional ideas, all fast (`durations.fast`, tight stagger) — reference a well-cut action montage where every shot reads in under two seconds but nothing feels rushed, because each one is doing exactly one job.

### Reality
- **Visual mood:** the exhale. Warm light returning after the coldest, fastest stretch of the film.
- **Artistic references:** **Apple**'s reveal beats (the pull-back that shows the whole product) — the most direct reference for `Form`'s camera pull. **Giant Ant**'s handoff/completion sequences, where a built object settles into a calmer, more "lived-in" composition.
- **Lighting references:** `hearth` returns, now with the accumulated weight of everything the film has shown — reference "the lights coming back up" at the end of a performance.
- **Colour references:** the film's thesis resolved as geometry — cool planes converging around a warm centre — reference how a single warm accent in an otherwise cool composition reads as "the point" (a classic architectural-photography trick: one lit window in a dark facade).
- **Typography references:** the second and last serif line ("And it becomes real."), then the title card's three-tier hierarchy (mono kicker → serif title → mono tagline) — reference **Instrument**'s title-card layering.
- **Texture references:** the warmest grain/bloom treatment in the film — the one place a touch more warmth in the texture pass is earned rather than excessive.
- **Camera inspiration:** the film's only `pull` — reference the "reveal the whole thing" gesture used once, deliberately, in **Apple** and **Nothing** product films.
- **Motion inspiration:** the settle/scale-down in `Handover` — reference an object finding its resting position after motion, unhurried, the visual opposite of Momentum's urgency.

---

## 2. Asset Acquisition Guide

Production-ready checklist. "Custom" means built in-engine (React/CSS/Remotion), not sourced — flagged because those items need design time, not licensing budget.

| Asset | Purpose | Required quality | Resolution | Transparency | Animation | Licensing | Source |
|---|---|---|---|---|---|---|---|
| **Soundtrack** | Full score bed, per Section 6 of `CREATIVE_DIRECTION.md` | Broadcast-grade, no artifacts, clean stems if available | 44.1kHz/24-bit WAV minimum | N/A | Full arrangement, build/release shape | Needs a commercial/broadcast license, not a personal-use tier — confirm the license explicitly covers a public-facing brand/framework promo, not just background use | Envato Elements (Audio) or Artlist |
| **Film grain overlay** | Unify the CG-clean render across every shot | Fine, organic, seamlessly looping — visibly NOT vintage/damaged | 4K (3840×2160 min, to cover both Landscape and Reel crops) | N/A (blend mode `overlay`, matches the existing `grainBlend` recipe already coded per atmosphere) | Seamless loop, ideally 3–5s | Standard stock license fine; confirm loop is royalty-free for commercial use | Envato Elements or Motion Array |
| **Dust particles (warm variant)** | Atmosphere for Spark, First Mark, Form, Handover, Title (`hearth` shots) | Sparse, slow, warm-tinted, out-of-focus feel | 4K | Alpha channel or additive/screen blend required | Slow drift loop, 8–15s to avoid visible repetition | Standard stock license | Envato Elements |
| **Dust particles (cool variant)** | Atmosphere for Structure/Momentum (`workshop`/`studio` shots) | Sparse, mechanical rather than organic drift, cool-tinted | 4K | Alpha channel required | Slow drift loop, 8–15s | Standard stock license | Envato Elements |
| **Light bloom overlay (warm)** | Intensify the amber glow already coded on `Spark`, `FirstMark`, the warm cell in `Grid`/`Peak`, `Form` | Soft, restrained, reads as genuine light not a lens gimmick | 4K | Additive/screen blend | Static or very slow pulse | Standard stock license | Envato Elements or Motion Array |
| **Anamorphic lens streak (cool, single-use)** | `Peak` only — the loudest frame in the film, the one place a lens artifact is earned | Subtle, cool-toned to match `studio` | 4K | Alpha required | Static or one subtle sweep | Standard stock license | Envato Elements |
| **Ink edge reference** | Informs the hand-made feel of the `FirstMark` stroke edge — **reference only**, not a literal composited overlay, since the stroke is a coded CSS shape, not footage | Single deliberate stroke, not a splatter | Reference imagery only, any resolution useful for study | N/A | N/A | N/A (reference, not licensed asset) | Freepik (search) or Magnific (generate, see Section 4) |
| **Studio ident wordmark treatment** | Opening ~1.5s card — a single `Text` + `animate` call per the Creative Direction | Must match the existing mono type treatment used on `count`/`structure` exactly | N/A (typographic, not an image asset) | N/A | Single opacity breathe | N/A | **Custom**, in-engine |
| **End card assets (wordmark, GitHub mark, URLs)** | Closing branded card | Same mono register as the opening ident, for bookend symmetry | N/A for text; if a GitHub logomark is used, source the official SVG mark | SVG, no background | Simple entrance, matches the ident's restraint | GitHub's logo has usage guidelines (do not modify, do not imply endorsement) — use their official brand asset, not a redrawn version | **Custom** layout; **official GitHub brand asset** for the mark itself |
| **Background procedural noise** | Prevent banding in the `workshop`/`studio` gradients at scale | N/A — likely solvable with an in-engine CSS noise/dither layer rather than a sourced asset | N/A | N/A | Static | N/A | **Custom** (check in-engine first; only source if the CSS approach can't hit large-screen quality) |

---

## 3. Search Library

### Envato Elements

| Search | Why this wording works | Quality indicators to look for | Avoid |
|---|---|---|---|
| `organic film grain overlay 4K seamless loop` | "Organic" filters out digitally-uniform noise generators; "seamless loop" is the actual technical requirement, not implied | Preview shows fine, even grain with no visible loop seam; described bit depth ≥8-bit; sample frame doesn't look banded | Anything labeled "vintage," "damaged," "VHS," or "scratched" — wrong register entirely for a premium modern short |
| `dust particles overlay black background 4K` | "Black background" is the actual compositing requirement (screen/additive blend needs true black, not grey) | Preview against pure black shows clean particle edges with no compression halo | Particle packs with visible motion blur trails or lens-flare-branded dust (too decorative) |
| `light bloom overlay warm additive 4K` | "Additive" specifies the blend mode up front, filtering out overlays authored for multiply/screen only | Preview thumbnail on a dark ground shows the bloom reading as light, not as a colored shape | Anything with a hard-edged "sun flare" look — too literal, breaks the abstract register |
| `anamorphic lens streak subtle cool 4K` | "Subtle" and "cool" pre-filter for the one single-use asset in the film; specific enough to avoid the loud, warm streak packs that dominate this category | Streak reads as a thin, elegant line across frame, not a starburst | Multi-flare "cinematic pack" bundles designed for warm sunset footage |
| `minimal piano build cinematic score` | Targets the arrangement shape (build), not just the instrument, which is the actual selection criterion per the soundtrack brief | Preview has a genuine quiet-to-full dynamic arc, not a loop that's uniformly loud | Tracks tagged "epic trailer" or "inspirational corporate" — see Section 6 of the Creative Direction for why |

### Freepik

| Search | Why this wording works | Quality indicators | Avoid |
|---|---|---|---|
| `abstract ink stroke minimal single line` | "Single line" filters out ink-splatter/brush packs; this is reference material for one deliberate mark, not a texture pack | Clean, confident single stroke with visible pressure variation at the ends | Multi-stroke "brush texture" sets — wrong scale entirely |
| `subtle dark gradient background premium` | "Premium" and "subtle" are load-bearing here — Freepik's default gradient results skew loud/saturated, this pulls toward the restrained end | Near-black with a barely-visible colour shift, no visible banding at full size | Anything with a visible light source shape (sunburst, spotlight cone) — too literal |
| `technical grid blueprint texture minimal` | Directly targets the `workshop` atmosphere's drafting-grid reference | Fine, consistent line weight, cool tone, no visible paper texture underneath (this needs to feel digital, not architectural-paper) | Hand-drawn/sketchy blueprint styles — the film's grid is precise, not organic |
| `dark editorial texture premium minimal` | For any tactile-surface reference under the end card or title cards, if warranted | Extremely low-contrast, barely perceptible surface variation | Anything with visible paper grain or fiber texture — too literal/craft-fair, wrong register for a tech-adjacent brand |

### Magnific

Magnific is an image upscaler/relighting/restyling tool — it needs a **source image** (a rough reference or AI-generated draft) plus a prompt describing target style, lighting, and material. It is used here strictly for **reference and texture generation**, never to composite photographic content directly into the film — the film's visual language is abstract geometric marks on coded gradients, and inserting a literal photographic background would break that language. See Section 4 for full prompts.

| Use case | Why Magnific over stock search | Quality indicators | Avoid |
|---|---|---|---|
| Ink edge reference (informs the FirstMark stroke's hand-made feel) | Stock ink-texture packs skew toward brush/splatter; Magnific can generate the *exact* single-deliberate-stroke reference the film needs | Output shows one clean, confident stroke with a natural (not vector-perfect) edge | Over-processed outputs with visible AI artifacting at the stroke edge |
| Premium atmospheric background (lighting/mood reference for grading, not composited) | Needed as a *grading reference*, not a deliverable — Magnific can hit an exact mood (e.g. "amber pool in near-total dark") faster than searching stock | Reads as photographic light behavior (falloff, bloom) even though it's a reference, not final footage | Outputs that look "AI generated" at a glance (over-smoothed, waxy) — defeats the purpose of a lighting reference |

---

## 4. Magnific Prompt Library

All outputs from this section are **reference and texture material** — grading references, mood boards, and (where explicitly noted) alpha-composited overlays. None are composited as literal scene backgrounds; the film's shots remain coded geometric marks on the existing `atelier` gradients.

**Hero background** (grading reference for the overall dark/warm-pool mood)
> A minimalist dark studio environment, near-black gradient background transitioning from deep charcoal to true black at the edges, one soft warm golden light source glowing from center, cinematic volumetric falloff, no visible light source object, extremely subtle film grain, premium editorial photography, shot on medium format, shallow atmospheric haze, 8K detail, no text, no people, no objects — pure atmosphere and light.

**Studio environment** (reference for the `workshop` atmosphere's cold overhead lighting)
> An empty modern architectural studio space at night, single cold blue-white light source from directly overhead like a drafting lamp, hard-edged pool of light on a dark floor, everything outside the light falling to near-black, faint architectural grid lines barely visible on the ground plane, minimal, precise, editorial, no people, no furniture, ultra-clean composition, 8K.

**Premium paper texture** (reference only, per the "flag as optional" note in the Creative Direction — use sparingly if at all)
> Extreme close-up macro texture of premium uncoated cotton paper, subtle fiber texture, warm off-white tone, raking light revealing faint surface irregularity, no print, no ink, no folds, evenly lit, seamless tileable edges, ultra high resolution, restrained and barely-there texture — not rustic, not craft-paper, closer to a luxury stationery sample.

**Luxury lighting** (reference for the `hearth` glow's quality of light)
> A single warm amber light source in complete darkness, contained pool of golden light with soft falloff and visible dark edges around it, like a candle or single lamp in a large dark room, subtle volumetric glow, no lens flare, no visible bulb or flame, cinematic, restrained, premium editorial lighting reference, 8K.

**Abstract gradients** (reference for large-scale gradient grading, useful for confirming banding-free output at 4K delivery size)
> A smooth abstract gradient transitioning from deep indigo blue-violet at the top to near-black at the bottom, completely smooth with zero visible banding, subtle film grain to prevent banding on export, minimal, no texture beyond grain, no shapes, no light source, pure color field, 8K, color-accurate.

**Ink edge references** (for the FirstMark stroke's hand-made edge quality)
> A single confident black ink brush stroke on pure white background, vertical orientation, slight natural taper at both ends, visible but minimal texture at the stroke edge from natural ink flow, no splatter, no secondary marks, one deliberate gesture, macro detail, high resolution, clean and precise despite being hand-made.

**Editorial surfaces** (reference for end-card / title-card ground texture, if a subtle surface treatment is wanted under the type)
> An extremely subtle dark charcoal surface texture, almost flat, with barely perceptible micro-variation catching soft raking light, premium editorial black background reference, no pattern, no visible material identity (not concrete, not fabric, not paper — abstract), 8K, suitable as a near-invisible ground texture under text.

**Macro materials** (reference for the `Form` shot's plane materials — informs how "solid" surfaces should read under grading)
> Macro photography of a matte anodized metal surface in warm amber-gold tone, soft directional light revealing subtle brushed texture, premium material study, shallow depth of field, no reflections of identifiable objects, restrained and elegant, 8K.

**Premium atmospheric backgrounds** (general mood reference for the Momentum movement's `studio` dual-tone lighting)
> A dark atmospheric environment lit from two directions simultaneously — cool blue-indigo light from above, warm amber-gold light from below — both contained and falling to black at the frame edges, subtle haze catching both light sources, cinematic tension between the two color temperatures, no objects, no people, pure light and atmosphere, 8K.

---

## 5. Typography System

**This is a ratification of the existing `atelier` brand type system (`src/design/brands/atelier/index.js`), not a new proposal.** All three faces are already loaded and in production use.

| Role | Face | Why it fits |
|---|---|---|
| **Display / serif** (the human voice — titles, the hinge line, "And it becomes real.") | **Instrument Serif** (weight 400 only — the face ships no other weight) | Lighter and narrower than a traditional editorial serif, so it reads as *film* rather than *product* the moment it appears — exactly the register break the film needs at its two or three serif moments. Its single weight is a constraint the brand has already correctly designed around (letter-spacing loosened, no synthetic bold anywhere). |
| **Body** (used sparingly — mostly a support face, not a hero) | **Inter** | Neutral, excellent at small sizes, disappears when it should — this film has almost no body copy, so Inter's job is to be invisible where it appears at all. |
| **Mono** (the system voice — `count`, `structure`, the studio ident, the end-card URLs) | **JetBrains Mono** | Reads immediately as "data," which is precisely what the mono register is doing dramatically (the film's only two mono lines are a fact and the system narrating itself). Its slightly wider default spacing pairs correctly with the `letterSpacings.widest` (0.18em) token already applied to `eyebrow`-variant text. |

**Alternatives** (documented for completeness; changing any of these is a brand-file edit, not covered by this visual-development phase, and should only happen if a genuine problem is found):
- **Display/serif alternative:** **Playfair Display** — already in the framework's font registry. Higher-contrast, more overtly "editorial" than Instrument Serif; would push the film toward a more traditional documentary-title register and away from its current lighter, more contemporary feel. Not recommended — it would fight the restraint that's the whole point of the type system.
- **Body alternative:** **Manrope** — already registered, but it's the framework's *default* display face, not a body face; using it as body text would blur the line between "system default" and "this film's own voice." Not recommended.
- **Mono alternative:** none currently registered besides JetBrains Mono. If a change were ever wanted, IBM Plex Mono would be the natural next candidate (similar technical register, slightly warmer letterforms) — but this would require adding a new face to `design/fonts/stacks.js`, which is a framework-adjacent change and out of scope here.

---

## 6. Colour System

**Ratifying the existing `atelier` theme palette.** All hex values below are already in code (`src/design/theme/tokens.js` + `src/design/brands/atelier/index.js`).

### Warm palette — the human (`tone="warm"` → `theme.colors.accent`)
| Token | Hex | Use |
|---|---|---|
| amber 200 | `#fde8c4` | Lightest tint — reserved for rare highlight moments, not yet used in the current shots |
| amber 300 | `#f8d199` | `accentLight` — gradient text endpoints |
| **amber 400** | **`#f0b45f`** | **Primary warm** — every warm `Mark`, the hearth glow, the brand gradient |
| amber 500 | `#e09a3a` | Deeper warm — used in the `hearth` gradient's radial center at low alpha (0.055) |
| amber 600 | `#c17c26` | Darkest warm — not currently used in a shot; reserved for shadow-side warm accents if ever needed |

**Correction to earlier documentation:** the Creative Direction Document (v2.0) and this film's own code comments occasionally describe this hue in prose as "warm amber" — that description is accurate; earlier casual references elsewhere to a generic "warm point" should all be read as this exact amber ramp, not an orange or rose. The brand file is explicit that rose (the framework's default accent) was deliberately replaced with amber for this film specifically, because rose reads as *alert* and this film needs *hearth*.

### Cool palette — the system (`tone="cool"` → `theme.colors.primary`)
| Token | Hex | Use |
|---|---|---|
| indigo 300 | `#a5b4fc` | Lightest cool tint, unused in current shots |
| indigo 400 | `#818cf8` | `primaryLight` |
| **indigo 500** | **`#6366f1`** | **Primary cool** — every cool `Mark`, the `workshop`/`studio` glows |
| indigo 600 | `#4f46e5` | `primaryDark` |
| indigo 700 | `#4338ca` | Darkest cool, unused in current shots |

**Cyan is intentionally absent.** The framework's default theme includes a cyan secondary; the brand file explicitly removes it from every atmosphere recipe ("three hues is one too many for a film this spare"). Do not reintroduce cyan anywhere in this film — it would break the two-colour argument the entire palette exists to make.

### Neutral palette (the ground everything sits on)
| Token | Hex | Use |
|---|---|---|
| ink 950 | `#05060a` | `backgroundDeep` — the true floor of the film, used in gradient outer stops and solid-plane compositing |
| ink 900 | `#08090d` | `background` — the base canvas colour for `flat` and most gradient midpoints |
| ink 850 | `#0d0f16` | Gradient inner stop for `canvas`/`workshop` |
| ink 800 | `#12141c` | `surface`; gradient inner stop for `studio` |
| ink 700 | `#1a1d28` | `surfaceRaised`, not currently used in a shot |
| paper | `#f4f5fa` | `text.primary` — the only near-white in the film, reserved for type |

### Background colours (per atmosphere, as coded)
| Atmosphere | Gradient | Vignette |
|---|---|---|
| `flat` (Void, Doubt) | flat `ink 900`, no glow | 0.34 |
| `hearth` (Spark, First Mark, Form, Handover, Title) | radial, amber 500 @ 5.5% alpha center → `ink 900` → `ink 950` | 0.4 |
| `workshop` (Structure) | radial, `ink 850` → `ink 900` → `ink 950`, grid visible | 0.36 |
| `studio` (Momentum) | radial, `ink 800` → `ink 900` → `ink 950`, dual glow (indigo top, amber bottom) | 0.32 |

### Glow colours
- **Warm glow:** amber 400 at 0.32 alpha (accent), 0.2 alpha (accentSoft/wide bloom)
- **Cool glow:** indigo 500 (`primary`), intensity varies 0.18–0.32 depending on atmosphere (`workshop` lower, `studio` higher — the peak movement is lit hardest)

### Typography colours
| Role | Colour | Use |
|---|---|---|
| Primary text | `paper` `#f4f5fa` | Title cards, the two serif lines |
| Secondary text | `rgba(244,245,250,0.72)` | — |
| Muted text | `rgba(244,245,250,0.46)` | The `·` separator glyph in `count`, de-emphasized punctuation |

### Emotional meaning of the system, stated once
Amber = a person; indigo = the system they built. Every colour decision in the film is downstream of that one sentence — warmth is earned and lost and earned back, indigo is competent and cold and never apologizes for it, and the one shot where they meet without either winning (`Form`) is the film's actual thesis rendered as a colour relationship rather than as a line of dialogue.

---

## 7. Lighting Bible

All values as coded in `backgroundsFor()` (framework) and the `atelier` brand's `atmosphere` overrides — this section documents the *meaning* behind numbers already locked in code.

### Void lighting (`flat`, Void/Doubt shots)
- **Intensity:** none — zero glows. The only light in the frame is what grain and vignette imply.
- **Direction:** N/A — no directional source.
- **Bloom:** none.
- **Haze:** none — this is the one atmosphere that should feel like a vacuum, not a hazy room.
- **Atmosphere:** grain only, 0.045 strength — carries the entire sense of "there is a frame here."
- **Contrast:** maximum — true near-black against nothing, the highest-contrast (least forgiving) lighting state in the film.
- **Shadows:** not applicable — there's nothing to cast one.

### Hearth lighting (`hearth`, Spark/First Mark/Form/Handover/Title)
- **Intensity:** 0.2 (single glow) — deliberately restrained; the brand's own comment notes a first pass at 0.14 canvas-wide tint read as "brown" rather than warm, and the fix was containing it as a pool rather than a wash.
- **Direction:** centred, slightly below center (y: 44–46%) — a source that feels like it's *in* the frame with the subject, not lighting it from outside.
- **Bloom:** amber glow, sized to the mark (`bloom = max(w,h) * 0.9`) so it scales correctly across formats and mark sizes — never a fixed-radius bloom.
- **Haze:** none currently coded; a very light warm haze/dust overlay (Section 2's warm dust particle asset) is the one texture addition this atmosphere is missing and worth adding.
- **Atmosphere:** vignette 0.4 — the strongest vignette of any atmosphere, so the warm pool reads against genuinely dark corners; without dark corners the warmth "never means anything" (brand file's own phrasing).
- **Contrast:** high — warm center, black edges, nothing in between.
- **Shadows:** implicit only (no cast-shadow system in this abstract-mark film) — the "shadow" is simply the absence of glow outside the pool.

### Workshop lighting (`workshop`, Structure movement)
- **Intensity:** 0.22, single overhead glow — cold and functional, never warm.
- **Direction:** top-center (y: 2–4%) — like a drafting lamp directly overhead, deliberately unflattering and technical.
- **Bloom:** indigo, moderate size (125% of frame width) — wide enough to feel like ambient cold light, not a hero glow.
- **Haze:** none currently; a cool/mechanical dust particle pass (Section 2) would strengthen this atmosphere's sense of a real workshop space rather than a flat gradient.
- **Atmosphere:** the only recipe with `grid: true` — the drafting grid is this atmosphere's signature texture and does more narrative work than any lighting value.
- **Contrast:** medium — cooler, flatter light than either `flat` or `hearth`; this atmosphere should never compete for drama, it should feel *procedural*.
- **Shadows:** N/A (no cast-shadow system).

### Studio lighting (`studio`, Momentum movement)
- **Intensity:** dual source — indigo overhead at 0.32 (the strongest single glow value in the film), amber from below at 0.22.
- **Direction:** top-center (indigo, y: 4%) opposing bottom-center (amber, y: 96%) — literally opposed across the frame, staging the film's colour argument as a lighting decision.
- **Bloom:** both hues present simultaneously for the first time in the film — this is the one atmosphere where warm and cool share a frame before `Form` resolves them.
- **Haze:** a very light, cool-leaning atmospheric haze would help sell the "both forces in tension" read at full render resolution — worth testing during Motion Polish.
- **Atmosphere:** vignette 0.32 — the loosest vignette of any atmosphere, appropriate to a movement about density and expansion rather than containment.
- **Contrast:** the most dynamic-range-demanding atmosphere in the film — indigo highlight, amber highlight, black floor, all at once. This is the atmosphere to check first for banding/clipping at final export resolution.
- **Shadows:** N/A (no cast-shadow system).

---

## 8. Texture Bible

Every texture in this film is seasoning, not structure — the mark system already carries the image. The rule for all of the below: **if an overlay is noticeable as an overlay, it's too strong; drop opacity by half from wherever it first looks right.**

- **Grain style:** fine, organic, evenly distributed — never clumpy or "digital noise"-looking. Blend mode `overlay` (already coded per-atmosphere at 0.04–0.05 strength). Should read as the reason the frame feels like it was shot on something, not as a visible layer. Test at both 1080p and the eventual 4K master — grain that looks right at preview resolution can read as too coarse at full res.
- **Dust style:** two variants (warm/cool per Section 2), always sparse, always slow — dust that moves fast or clusters reads as "particle effect" rather than atmosphere. Never let dust cross in front of type or the mark itself; it belongs in the negative space.
- **Noise style:** procedural, used only to prevent gradient banding in `workshop`/`studio` — this should be genuinely invisible at normal viewing distance and only exist to protect the gradient's smoothness under compression (YouTube/social re-encoding is the real target, not the raw master).
- **Bloom style:** additive, warm or cool matching the source mark's tone, always sized proportionally to the object it's attached to (never a fixed-size glow slapped over a small object — this already the coded behavior in `Mark.jsx` and should be preserved in any post-layer bloom pass, not overridden by it).
- **Lens effects:** reserved for `Peak` only, and even there, subtle — a single restrained anamorphic streak, cool-toned. No lens effect anywhere else in the film; this restraint is what makes the one use mean something.
- **Vignette:** already atmosphere-specific and coded (0.32–0.4 depending on scene) — any additional vignette pass in grading should be minimal (no more than another 5–8% darkening at the extreme corners) since the coded vignette is already doing real dramatic work per shot.
- **Depth cues:** the film's existing parallax system (three registered depths: back 0.15, mid 0.4, front 0.85) is the primary depth cue and should not be duplicated or fought with a separate depth-of-field blur pass — if a DoF-style softness is ever added in post, it must respect those same three depth bands, not invent a fourth.

---

## 9. Final Production Checklist

Ordered start to finish. Each item should be checked off before the next phase begins.

**A. Reference & Direction**
- [ ] `CREATIVE_DIRECTION.md` v2.0 signed off *(done)*
- [ ] `PRODUCTION_DESIGN.md` (this document) signed off
- [ ] Moodboard references (Section 1) compiled into a single visual reference board per movement, for anyone joining the project mid-stream

**B. Asset Sourcing**
- [ ] Film grain overlay sourced and tested against `flat` atmosphere at full render resolution
- [ ] Warm + cool dust particle overlays sourced
- [ ] Warm light bloom overlay sourced (if the coded `Mark.jsx` bloom needs reinforcement post-grade)
- [ ] Anamorphic lens streak sourced (Peak only)
- [ ] Ink edge reference generated via Magnific (Section 4) and reviewed against the coded `FirstMark` stroke for consistency of feel
- [ ] Official GitHub brand mark downloaded from GitHub's own brand assets (not redrawn)
- [ ] Studio ident + end card built in-engine (Custom, per Section 2)

**C. Soundtrack**
- [ ] Three candidate tracks shortlisted against the Section 6 brief in `CREATIVE_DIRECTION.md`
- [ ] Each candidate test-cut against the locked picture (silent watch first, then with each candidate)
- [ ] Final track licensed, confirmed as commercial/broadcast-cleared for a public framework promo

**D. Picture Lock Confirmation**
- [ ] `timeline.js` bar counts confirmed to match `CREATIVE_DIRECTION.md` Section 3 exactly
- [ ] Opening ident + closing sequence shot list confirmed against Section 3 (not yet implemented, but scoped)
- [ ] Runtime target reconfirmed (~50–52s with bookends, per the Creative Direction's flagged deviation from the original 35–45s target)

**E. Implementation** *(not part of this phase — listed for continuity only)*
- [ ] Build opening ident + closing sequence shots
- [ ] Integrate licensed soundtrack via the existing `soundtrack` prop
- [ ] Re-derive BPM/bars from the real track's tempo

**F. Motion Polish**
- [ ] Grain layered across all shots, checked at full resolution for coarseness
- [ ] Dust layered into `hearth` and `workshop`/`studio` shots per Section 2
- [ ] Bloom reinforcement applied only where the coded glow needs it, not uniformly
- [ ] Lens streak applied to `Peak` only
- [ ] Confirm neither dissolve point (Peak→Form, Handover→Title) is softened or obscured by any added layer

**G. Colour Polish**
- [ ] Full grade pass across all four atmospheres
- [ ] Confirm the warm/cool rule (Section 6) holds under grain and bloom, not just in the raw render
- [ ] Check `studio` atmosphere specifically for banding/clipping at final export resolution (flagged in Section 7 as the highest-risk atmosphere)
- [ ] Confirm no cyan has crept in anywhere

**H. Final Quality Review**
- [ ] Full watch with sound, both formats (Landscape + Reel), at final delivery resolution
- [ ] Silent watch, separately, to confirm the cut-rhythm arc still reads without audio
- [ ] End-card URLs verified live and correct

**I. Master Export**
- [ ] Landscape master exported
- [ ] Reel (vertical) master exported
- [ ] Both masters spot-checked frame-by-frame at the two dissolve points and the studio ident/end card bookends
