# Theming

How a brand is defined, validated and mounted — and how fonts get loaded without
silently rendering the wrong typeface.

---

## The split

Only the **visual** half of the design system is a theme:

| | Where | Delivery |
| --- | --- | --- |
| Motion tokens — `curves`, `durations`, `stagger`, `springs` | `framework/motion/` | static import |
| Visual tokens — colours, type, radii, shadows, atmosphere | `design/theme/` | runtime, `useTheme()` |

Motion timing cannot be a theme because the animation functions are pure and
cannot call a hook. A brand that wants different timing overrides it per call
(every preset takes `duration`/`easing`) or ships a preset pack.

---

## Files

```
design/
├─ theme/
│  ├─ tokens.js     Default token VALUES — pure, no React, no Remotion
│  ├─ default.js    Loads fonts, validates, exports `defaultTheme`
│  └─ contract.js   `validateTheme()` + `extendTheme()`
├─ fonts/
│  ├─ stacks.js     Face metadata + CSS stacks — pure
│  └─ index.js      The loaders
└─ brands/
   └─ editorial/    A worked example: light paper, editorial serif
```

**Why `tokens.js` is separate from `default.js`:** the `theme-to-css` codegen
runs in plain Node, and `default.js` triggers font loading, which imports
Remotion and cannot be evaluated outside a bundle. `tokens.js` is plain values
and string interpolation, so both the bundler and a bare `node` can read it.

---

## Building a brand

```js
// design/brands/acme/index.js
import { extendTheme, validateTheme } from '../../theme/contract.js';
import { tokens } from '../../theme/tokens.js';
import { loadFonts } from '../../fonts/index.js';
import { stackFor } from '../../fonts/stacks.js';

loadFonts({ display: 'sora', body: 'inter', mono: 'jetbrainsMono' });

export const acmeTheme = validateTheme(
  extendTheme(tokens, {
    name: 'acme',
    colors: {
      primary: '#0f766e',
      text: { primary: '#0b1120' },
    },
    typography: {
      fontStacks: { display: stackFor('sora'), body: stackFor('inter') },
    },
  }),
  'acme',
);
```

Then export it from `design/brands/index.js` and pass it in
`projects/registry.js` as `theme`.

`extendTheme` deep-merges plain objects and replaces everything else, so you
touch only what differs.

### Validation

`validateTheme()` runs at **theme-definition time**, not inside `ThemeProvider`.
Two reasons: `ThemeProvider` is Ring 1 and the contract is Ring 2, so calling it
there would invert the dependency rule; and validating at definition is simply
better — it runs at import, in every environment, and fails when a brand is
written rather than when it is first rendered.

It reports **every** problem at once, not just the first:

```
Invalid theme "acme":
  - missing `colors.text.secondary`
  - `spacing` should be an object, got string
```

Only load-bearing tokens are required. Optional groups (`glows`, `strokes`,
`blurs`) are omitted deliberately — a contract that forbids reasonable themes
stops being consulted.

---

## Atmosphere: the part that is not just colour

Scene backgrounds are named recipes — `studio`, `hearth`, `workshop`, `flat` —
built from theme colours by `framework/components/layers/backgrounds.js`.

**Their structural constants assume a dark ground.** Glows lighten, grain blends
with `overlay`, the vignette is black. None of that transfers to light paper: a
lightening glow is invisible, `overlay` grain inverts into haze, and a black
vignette reads as dirt.

So a theme may carry an optional `atmosphere` map:

```js
atmosphere: {
  '*':     { grain: 0.025, grainBlend: 'multiply', vignette: 0.06 },
  studio:  { glows: [{ color: '#9a3412', position: { x: 50, y: 4 }, size: 100, intensity: 0.07 }] },
  flat:    { glows: [], vignette: 0 },
}
```

`'*'` applies to every variant; a named variant overrides it. Values are
replaced, not merged — a `glows` array is swapped wholesale, because
half-overriding a lighting rig produces something nobody designed.

The recipe *vocabulary* stays in Ring 1 (every brand has a `studio`); what an
atmosphere *means* on a given ground is a Ring 2 decision.

> This was found by building the `editorial` brand — the default `studio`
> recipe's secondary glow was washing the light canvas green. It is exactly the
> class of bug a second brand exists to surface.

---

## Fonts

```js
import { loadFonts } from '@/design';

export const fontStacks = loadFonts({
  display: 'manrope',
  body: 'inter',
  mono: 'jetbrainsMono',
});
```

Available: `inter`, `manrope`, `sora`, `playfair`, `instrumentSerif`,
`jetbrainsMono`.

### Call at module scope, never inside a component

A webfont that has not finished loading does not throw — the browser silently
paints a fallback face. In a video that means the first N frames render in the
wrong typeface, at the wrong metrics, and therefore with the wrong line breaks.
Nothing fails; the film is quietly broken.

`loadFont()` wraps the load in Remotion's `delayRender()`/`continueRender()`, so
the renderer will not produce frame 0 until the face is ready — but only if the
call has happened by then. Module scope guarantees that.

### Why the face list is hardcoded

Every face is a static `import` in `design/fonts/index.js`. Remotion bundles
statically: a dynamic `import(name)` cannot be traced by the bundler and would
resolve in Studio but fail on a render farm. Adding a face is adding an import
and a registry entry — see [EXTENDING.md](EXTENDING.md).

`loadFace` asserts that the family name the loader registers matches the constant
in `stacks.js`, so the codegen's CSS and the actual loaded font cannot drift.

---

## Tailwind

`src/styles/tailwind.css` is **generated** — do not edit it.

```bash
npm run theme:css      # regenerate from tokens.js
npm run theme:check    # fail if out of date (part of `npm run verify`)
```

The JS theme is authoritative; a Tailwind class cannot vary per frame, so
anything animated must come from JS regardless. Colours, font stacks, spacing and
radii cross over. Shadows, glows, gradients, blurs and text styles deliberately
do **not** — they are applied only from JS, and mirroring them would imply a
parity that does not exist.

This file was hand-maintained until Phase 5 and had already drifted:
`--color-ms-text-muted` was `0.48` in CSS and `0.46` in JS. Nobody noticed,
because nothing fails — you just get two slightly different greys depending on
which side of the system drew the text.
