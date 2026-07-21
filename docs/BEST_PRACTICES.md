# Best practices

Short, opinionated, and mostly derived from bugs that actually happened.

---

## 1. Make every change at the lowest layer that can express it

The framework's founding rule. Before writing a value into a scene, ask whether
it belongs in a token, a preset, a layout or a template.

A colour in a scene is a colour one scene has. A colour in the theme is a colour
the brand has. The second is almost always what you meant.

---

## 2. Layouts own reflow — scenes never branch on format

If you are writing `if (isVertical)` inside a scene, a layout prop is missing a
per-bucket map:

```jsx
// no
<div style={{ gap: isVertical ? 80 : 40 }}>

// yes
<Stack gap={{ landscape: 40, vertical: 80 }}>
```

This was the single largest structural problem in the reference implementation:
layout primitives existed, every scene bypassed them, and each one carried its
own table of per-format constants. Twelve video categories would have meant
twelve copies of that table.

`vertical` is shorthand for portrait + square. `Split`, `Grid`, `Center`,
`Stack` and `FullBleed` all accept scalars or maps on every sizing prop.

---

## 3. Wrap every dimension in `px()`

```jsx
const { px } = useFormat();
<div style={{ padding: px(48), borderRadius: px(theme.radii.lg) }} />
```

Tokens are authored at 1920×1080. An unwrapped literal is correct in exactly one
format and subtly wrong in the other four.

Note that vertical scaling is deliberately *not* proportional to width — `reel`
is `0.95`, not `0.5625` — because phone type has to stay readable. Do not
"correct" this.

---

## 4. Never write a frame number

Positions, durations and overlaps come from the timeline. If you are adding up
scene lengths or computing a `from`, the timeline should be doing it — and it
already handles the rounding correctly, deriving each start from an absolute
position so error never compounds.

The one number you write per beat is its length.

---

## 5. `preset="none"` when a parent owns the entrance

`Stagger` and `Reveal` animate their children. A child that also has a preset
fires twice, which reads as a stutter:

```jsx
<Stagger>
  <Text preset="none">…</Text>   {/* parent owns it */}
</Stagger>
```

Every animating component accepts `preset="none"` for exactly this.

---

## 6. Compose motion with `mergeMotion`, never object spread

```jsx
// WRONG — silently drops all but the last transform
const style = { ...fadeIn(ctx), ...riseIn(ctx) };

// RIGHT — concatenates transforms, multiplies opacities, joins filters
const style = mergeMotion(fadeIn(ctx), riseIn(ctx));
```

Object spread produces a plausible-looking style object that is missing half the
animation. Nothing throws.

---

## 7. Verify in portrait, every time

Landscape is what you have open; portrait is where the bug is. Layouts reflow,
and only one of the two formats gets looked at by default.

```bash
npm run still -- Film-Landscape out/beat.png --frame=140
npm run still -- Film-Reel      out/beat-v.png --frame=140
```

`npm run verify` renders both automatically, plus ultrawide and exhibition.

---

## 8. Look at the render — the failures are silent

This framework's output is visual, so most regressions do not throw. A font
falls back, a gradient bands, a transition lands a frame short, a layout stops
reflowing — all of these render "successfully".

A still takes seconds; a full render takes minutes. Render stills at
representative frames and *read* them.

---

## 9. Load fonts at module scope

```js
loadFonts({ display: 'manrope', body: 'inter' });   // top level, not in a component
```

Inside a component, the load may not have started before frame 0 is requested,
and the first frames render in a fallback face at the wrong metrics. Nothing
fails; the line breaks are just wrong.

---

## 10. Assets go through `assetsFor`, never raw `staticFile`

```js
const asset = assetsFor('from-idea-to-reality');
asset.image('hero.png');
```

Project-scoped paths mean two films can both have a `logo.png`, and deleting a
project is deleting one directory.

---

## 11. Prefer a slot over a new prop

When a template needs a variation, pass a node:

```jsx
<HeroScene media={<MediaFrame src={…} preset="depth" />} />
```

A template that grows a prop per case (`imageUrl`, `videoUrl`, `iconName`,
`showBadge`…) is on its way to being un-reusable. That is precisely how the
reference implementation's scenes ended up impossible to reuse.

---

## 12. Extend by registry entry, not by editing the engine

New camera move, transition, timebase, atmosphere or font — all of them are
additions. See [EXTENDING.md](EXTENDING.md).

Changing `src/framework/` is legitimate when the change is about the engine
rather than one video. The test: would every future project benefit, or only
this one?

---

## 13. Keep templates on `@/framework` only

A template that imports `design/` or a project stops being theme-independent. It
will work perfectly under the brand you tested and be unusable under any other.

---

## 14. Run `npm run verify` before calling something done

Tests, theme sync, composition resolution, and 18 attributable stills across four
formats and two brands. It takes about two and a half minutes, which is less time
than one bad render costs.
