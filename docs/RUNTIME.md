# The Motion Runtime — `@motion/runtime`

The runtime is the product. Motion Studio authors templates; the runtime
executes them. Three consumers use it, and none of them is privileged:

```
                        ┌──────────────────────┐
                        │   Motion Runtime     │
                        │   (@motion/runtime)  │
                        └──────────┬───────────┘
              ┌────────────────────┼────────────────────┐
              │                    │                    │
      Remotion Studio          the editor        any React app
   registerTemplates()      <MotionTemplate>   <PlayerStatsTemplate>
   authoring + MP4 render    debug + author         the product
```

---

## 1. The public API

```jsx
import { PlayerStatsTemplate } from '@motion/runtime';

<PlayerStatsTemplate data={player} />
```

That is the whole required surface. The complete export list:

| Export | |
| --- | --- |
| `MotionTemplate` | `<MotionTemplate template="football-player" data={…} />` |
| `PlayerStatsTemplate` | the football card, template pinned |
| `SubjectShowcaseTemplate` | the domain-free subject card |
| `listTemplates()` | what can be rendered, with formats and sample ids |
| `getTemplateSample(name, id?)` | real, valid data to start from |
| `getTemplateSamples(name)` | all of a template's samples — builds a picker |
| `configureMotionRuntime({assetBase})` | where assets are served from |
| `currentAssetBase()` | what is in effect |
| `registerTemplates()` | Remotion Studio's entry; meaningless outside a bundle |

### What is deliberately absent

`PackHost`, `resolvePack`, `withTheme`, `PACKS`, the ViewModel, `buildTimeline`,
`FORMATS`, `ThemeProvider`, and `<Player>` itself. The omission **is** the API:
those are the moving parts that let one template serve both an MP4 render and a
web page, and a consumer who depended on them would pin decisions this layer
needs to stay free to change.

Also absent: MP4 rendering. It needs a Node process and a headless browser. A
browser tab cannot do it, and an SDK function that pretended otherwise would be
a lie with a spinner. Rendering stays `npx remotion render`.

---

## 2. Props

| Prop | Default | |
| --- | --- | --- |
| `data` | — | payload **or** full document (required) |
| `template` | — | required on `MotionTemplate`, pinned on the named ones |
| `format` | the template's own | `landscape` · `reel` · `square` |
| `theme` | the template's own | brand name |
| `accent` | from the data | hex override |
| `pace` | `normal` | `tight` · `normal` · `relaxed` |
| `autoPlay` / `loop` | `true` | |
| `controls` | `false` | built-in transport bar |
| `assetBase` | web root | where `packs/…` is served from |
| `fallback` | `null` | rendered instead of the template on error |
| `onError` | — | `(error) => void` |
| `onReady` | — | `({width, height, fps, durationInFrames, durationInSeconds})` |
| `className` / `style` | — | on the wrapper |

Responsive by default: fills its container's width, takes its height from the
template's aspect ratio.

### `data` accepts two shapes

```jsx
// a bare payload — what an app's own API returns
<PlayerStatsTemplate data={{ player, club, league, season, competition, stats }} />

// or a full document, envelope and all
<PlayerStatsTemplate data={getTemplateSample('football-player', 'haaland')} />
```

A payload is wrapped in an envelope internally. The two are told apart
structurally, because asking the consumer to declare which one they have
re-introduces the concept the wrapping exists to hide.

An unspecified theme/format is inherited from **the template's first sample**,
not from a global default — otherwise the football card would come up in the
generic studio brand it was never designed for.

---

## 3. Errors

Two layers, because they catch different things:

- **Bad data** — schema or adapter failure — is caught before mounting by
  `tryResolvePack`. `fallback` renders, `onError` fires.
- **Render-time throws** — a bad preset name, a contract violated at frame 200 —
  are caught by an error boundary around the template.

Inside Motion Studio a throwing composition is the *right* outcome: it names the
bad field and stops a wrong frame shipping. Inside somebody else's product page
the same throw would unmount their tree. The runtime keeps the strictness and
changes only where it lands. A new document resets the boundary, so one bad
payload does not disable the template for the life of the page.

---

## 4. Assets

Templates load portraits, crests and flags at runtime through Remotion's
`staticFile()`, which resolves `packs/<id>/<file>` against
`window.remotion_staticBase` — or the web root when that is unset.

```bash
cp -r node_modules/@motion/runtime/assets/packs public/
```

```jsx
<PlayerStatsTemplate data={player} assetBase="/motion-assets" />
```

`assetBase` sets the same global Remotion uses, which is why supporting it
required no change to `engine/assets.js`. It is applied **during render**, not
in an effect — asset paths resolve inside `resolvePack`, which runs before any
effect would fire, so an effect would produce a flash of missing images on first
paint.

Inside Studio and the renderer, Remotion sets that global itself and is
authoritative about its own public folder; `assetBase` is ignored there, with a
warning.

---

## 5. Packaging

```bash
npm run build:runtime      # → dist/runtime/
```

Produces `index.js` + sourcemap, `package.json` (name `@motion/runtime`, peers
pinned), `README.md`, and `assets/packs/`.

**`react`, `react-dom`, `remotion`, every `@remotion/*` and `zod` are peers.**
Bundling a copy of Remotion would give a consuming app two module instances —
two React contexts — and `useCurrentFrame()` inside a template would read the
wrong one and throw. The `@/` alias is resolved at build time; that is the whole
reason a build step exists rather than publishing `src/`.

### The linked-install trap

Install the **tarball**, not the folder:

```bash
npm pack ./dist/runtime
npm install ../motion-runtime-1.0.0.tgz
```

`npm install ./dist/runtime` and `npm link` create a symlink, and Node then
resolves the package's peers from *the Motion Studio repo's* `node_modules`.
The app gets two Reacts, and the failure is this:

```
Cannot read properties of null (reading 'useMemo')
```

— React's hook dispatcher being null inside `<Player>`. This was hit and
diagnosed while verifying the package, not theorised. If you need the symlink for
live development, add `resolve.dedupe: ['react','react-dom','remotion','@remotion/player']`
to the consuming app's Vite config.

---

## 6. What the runtime is built on

Everything below the runtime is unchanged by productisation. `resolvePack`,
`PackHost`, the timeline engine, the pack manifests and the framework rings are
exactly as they were; the runtime is a layer on top that hides them.

```
MotionTemplate                                      Ring 5 — SDK
  ├─ resolveTemplate(name)      → pack manifest     runtime/templates.js
  ├─ toDocument(data, pack, …)  → document          runtime/document.js
  ├─ tryResolvePack(...)        → mount             packs/resolve.js   (unchanged)
  └─ <Player component={PackHost} inputProps>       packs/PackHost.jsx (unchanged)
```

Two things reach past the SDK on purpose, both first-party:

- **The editor** re-runs `tryResolvePack` itself, because it shows validation
  issues per field and keeps the last valid frame while you type. The SDK
  collapses that to `fallback` + `onError` — a product page wants "show
  something sensible", not a diagnostic.
- **The ref** forwards to the underlying player so the editor's transport can
  play, pause and seek. It is the one place the Remotion object is reachable and
  is not documented for product use.

If the editor could not be rebuilt on the public API, the public API would not be
finished. It was, and it is: `studio/preview/Stage.jsx` renders `<MotionTemplate>`
and no longer knows `PackHost` or `<Player>` exist.
