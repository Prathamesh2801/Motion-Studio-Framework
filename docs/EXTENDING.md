# Extending the framework

The framework's central promise is that **new capability is an addition, not a
rewrite**. This document is how that promise stays true.

If you are about to modify a file in `src/framework/` to support a new video,
stop — one of the recipes below almost certainly covers it.

---

## The registry idiom

Six vocabularies resolve by name, all through
`framework/helpers/registry.js`:

| Vocabulary | Register with | Resolve with |
| --- | --- | --- |
| Easings | *(add to `easings` in `animations/easing.js`)* | `resolveEasing` |
| Entrance / exit / ambient presets | *(add to the map in `presets/`)* | `resolvePreset` |
| Cameras | `registerCamera` | `resolveCamera` |
| Transitions | `registerTransition` | `resolveTransition` |
| Timebases | `registerTimebase` | `resolveTimebase` |
| Fonts | `registerFace` | `loadFace` |

One policy for all of them:

```
a function        → passed through (the one-off escape hatch)
null / undefined  → the registry's documented default
a KNOWN name      → that entry
an UNKNOWN name   → throws, listing the known names
```

Unknown names throw rather than falling back. Silent fallback means a typo
renders successfully and wrong, which is the worst outcome in a system whose
output is judged by eye.

---

## Add a camera move

```js
import { registerCamera, animate, transform } from '@/framework';

registerCamera('creep', ({ frame, duration, easing = 'smooth' }) => ({
  transform: transform({
    scale: animate({ frame, from: 1, to: 1.02, duration, easing }),
    y: animate({ frame, from: 0, to: -12, duration, easing }),
  }),
  transformOrigin: 'center',
}));
```

Then `<Scene camera="creep">` or `<HeroScene camera="creep" />`.

A camera receives `{ frame, duration, fps, ... }` and returns a style object.
Because it is an ordinary motion function, it composes with `mergeMotion` like
anything else.

---

## Add a transition

```js
import { registerTransition } from '@/framework';
import { clockWipe } from '@remotion/transitions/clock-wipe';

registerTransition('clock', (props) => clockWipe({ width: 1920, height: 1080, ...props }));
```

Then `transition="clock"`, or per beat: `{ id: 'x', seconds: 3, transition: 'clock' }`.

Register the *presentation builder* only — timing comes from the shared overlap
token so the timeline and the transition cannot disagree.

---

## Add a timebase

See [TIMELINE.md](TIMELINE.md#writing-a-custom-timebase) for the full contract.
Only `lengthOf` is required:

```js
import { registerTimebase } from '@/framework';

registerTimebase('shots', {
  lengthOf: (scene, { fps }) => Math.round(scene.shotSeconds * fps),
});
```

---

## Add an atmosphere

Atmosphere recipes are theme-level. Rather than editing
`framework/components/layers/backgrounds.js`, override per brand:

```js
// in your brand theme
atmosphere: {
  '*':    { grain: 0.03 },
  studio: { glows: [{ color: '#0f766e', position: { x: 20, y: 10 }, size: 90, intensity: 0.2 }] },
}
```

`'*'` applies to all variants; a named variant overrides it. See
[THEMING.md](THEMING.md#atmosphere-the-part-that-is-not-just-colour).

---

## Add a font

Faces are static imports, because Remotion bundles statically and a dynamic
import would fail on a render farm. Two edits in `design/fonts/`:

```js
// stacks.js — the pure metadata half
export const FACE_META = {
  …,
  spaceGrotesk: { family: 'Space Grotesk', fallback: SYSTEM.sans, note: '…' },
};

// index.js — the loader half
import { loadFont as loadSpaceGrotesk } from '@remotion/google-fonts/SpaceGrotesk';
const loaders = { …, spaceGrotesk: loadSpaceGrotesk };
```

`loadFace` asserts the two agree, so the generated CSS cannot drift from the
font that actually loads.

For a non-Google face, `registerFace(name, { load, family })` takes any loader
returning `{ fontFamily }`.

---

## Add a scene template

A template is a complete beat that owns its layout and reflow.

**The one hard rule: import from `@/framework` only.** Never from `design/`,
never from another project. A template that imports the default theme works
perfectly and is silently unusable for any other brand.

```jsx
import React from 'react';
import { Scene, Stack, SectionHeader, stagger } from '@/framework';

export const NoticeScene = ({
  eyebrow, title, body,
  background = 'workshop',
  camera = 'push',
  delay = 0,
  step = stagger.loose,
  style,
}) => (
  <Scene background={background} camera={camera} style={style}>
    <Stack gap={{ landscape: 40, vertical: 28 }}>
      <SectionHeader eyebrow={eyebrow} title={title} delay={delay} step={step} />
      {body}
    </Stack>
  </Scene>
);
```

Checklist before it counts as a template:

- Accepts the shared props: `background`, `camera`, `delay`, `step`, `style`,
  and `align` if it has an editorial axis.
- Every sizing value is either a token or a per-bucket map — **no
  `if (isVertical)`**.
- Optional slots are genuinely optional; omitting them must not collapse or throw.
- Renders correctly in landscape **and** portrait. Check before committing.
- Takes nodes for media/actions rather than growing a prop per variation.

Export it from `src/templates/index.js`.

---

## Packs

A pack is just a module that calls the register functions — there is no manifest,
no plugin API, and deliberately so: the mechanism should not be formalised before
two real packs exist to shape it.

```js
// packs/documentary/index.js
import { registerCamera, registerTransition } from '@/framework';

export const install = () => {
  registerCamera('vérité', …);
  registerTransition('filmBurn', …);
};
```

Call `install()` once at module scope in your project. If a second pack ever
needs something this convention cannot express, *that* is when to design the API.

---

## When extension is genuinely not enough

Changing Ring 1 is legitimate when the change is about the *engine*, not about
one video: a new format bucket, a new layout primitive, a fix to `mergeMotion`.

The test is whether the change would benefit every future project or only the one
you are working on. If it is the latter, it belongs in the project, a template,
or a pack.

After any Ring 1 change, run `npm run verify` — that is what the showcase and
torture test are for.
