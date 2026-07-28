# System Map — how the built system actually works

A description of the current implementation, not a proposal. Nothing here
suggests changes. Where something is a limitation, it is stated as a fact about
what exists today.

Companion to [PACK_ENGINE.md](PACK_ENGINE.md), which explains *why* the
boundaries are where they are. This explains *what runs*.

---

## 1. Runtime flow — `npm run studio`

### 1.1 Discovery

```
npm run studio
  → remotion studio src/index.jsx
      ├─ remotion.config.js is loaded first by the CLI
      │    · Config.setEntryPoint('./src/index.jsx')
      │    · overrideWebpackConfig: enableTailwind + alias '@' → src/
      │
      └─ src/index.jsx
           registerRoot(RemotionRoot)
              → src/Root.jsx
```

[Root.jsx](../src/Root.jsx) renders two groups of `<Composition>` elements:

```jsx
<Folder name="Packs">{registerPacks()}</Folder>      // data-driven products
{projectsByFolder().map(… registerProject(…))}        // one-off films
```

[packs/register.jsx](../src/packs/register.jsx) walks `PACKS × pack.formats` and
emits one `<Composition>` per pair:

```jsx
<Composition
  id="football-player-stats-landscape"
  component={PackHost}
  defaultProps={{ packId, document: firstSample(pack), format: formatId }}
  durationInFrames={30} fps={30} width={1920} height={1080}   // placeholders
  calculateMetadata={packMetadata}
/>
```

Three facts about this element:

- **The props are fully serialisable** — a pack id, a document, a format name.
  That is what lets the same component be a Studio composition, a `--props` CLI
  render, and a live editor preview with no host-specific entry point.
- **The four dimension props are placeholders.** `calculateMetadata` overwrites
  all of them before anything renders; Remotion requires them present anyway.
- **There is no `schema` prop.** Passing the document schema crashes Studio's
  props sidebar (`ZodSwitch.js:39` calls `value.startsWith(…)` on any
  `string`-typed node, and an absent optional asset arrives as `undefined`).
  Without it, Studio edits props as raw JSON.

Composition ids are `${pack.id}-${formatId}`, e.g. `football-player-stats-reel`.
Only the pack's **first sample** is registered; the other five players are
reached by changing props, not by adding compositions.

### 1.2 Metadata — before a frame exists

When a composition is selected (and again on every props change), Remotion calls
`calculateMetadata({ props })` → [`packMetadata`](../src/packs/PackHost.jsx):

```js
resolvePack(packById(props.packId), props.document, props.format)
  → { durationInFrames, fps, width, height }
```

This is why editing the document in the sidebar changes the film's **length**.
The timeline is derived from the data, so a fixed `durationInFrames` would
truncate the render the moment anyone changed the JSON.

### 1.3 `resolvePack` — the single wiring point

[packs/resolve.js](../src/packs/resolve.js), a pure function. Both hosts call it;
neither computes any of this itself.

```
resolvePack(pack, document, formatId)
│
├─ normalizeDocument(document, pack.schema)
│     migrateDocument()          $schema version gate
│     pack.schema.parse()        zod — THROWS on an invalid document
│
├─ format = FORMATS[formatId ?? doc.format]        → width, height, fps, scale
│
├─ vm = normalizeViewModel(pack.adapter(doc), { packId })
│     pack.adapter(doc)          football JSON → raw ViewModel   ← domain code
│     normalizeMetric(…)         "73" → 73, ids from labels, throws by name
│     resolveAsset(…, packId)    'players/messi.svg'
│                                  → staticFile('packs/football-player-stats/players/messi.svg')
│     assertViewModel(…)         zod — the adapter's output is validated
│
├─ pace  = PACE[doc.timing.pace]                   tight .8 | normal 1 | relaxed 1.25
├─ theme = resolveThemeRef(doc.theme, vm.accent)   brand + accent → theme object
│
└─ returns {
     component: withTheme(pack.Film, theme),   memoised on (component, theme)
     inputProps: { vm, pace },
     durationInFrames: pack.timeline(vm, fps, pace).durationInFrames,
     fps, width, height, format, theme, vm
   }
```

`withTheme` ([framework/render/registerProject.jsx](../src/framework/render/registerProject.jsx))
is memoised on `(Component, theme)`, so repeated resolutions return the *same*
component identity. In the editor that is load-bearing: a fresh identity per
keystroke would remount the composition and restart the animation mid-type.

`resolveThemeRef` ([packs/theme.js](../src/packs/theme.js)) also caches, because
`extendTheme` builds a new object each call and a new theme identity would miss
the `withTheme` cache.

### 1.4 Render

```
<PackHost packId document format />
  │  packById(packId) → the manifest (components, zod schemas — not serialisable)
  │  resolvePack(...)  → runs the whole pipeline again
  ▼
<Themed(Film) vm={…} pace={1}>
  └─ <ThemeProvider theme={…}>          ← visual tokens enter the tree here
       └─ <Film vm pace>
```

> `resolvePack` runs **twice** per render pass — once inside
> `calculateMetadata`, once inside `PackHost`. It is pure, so this is a
> correctness-neutral repetition of work, not a divergence risk.

[Film.jsx](../src/packs/football-player-stats/Film.jsx):

```jsx
const { fps } = useVideoConfig();                    // from the host
const timeline = buildPackTimeline(vm, fps, pace);   // beats → absolute frames
const hero = heroMetric(vm);                         // the 'emphasis: hero' metric

<StandardFilm timeline={timeline} transition="fade" scenes={{
  intro:     <SubjectIntro subject={vm.subject} chips={vm.identity} />,
  board:     <StatBoard metrics={vm.metrics} eyebrow={…} title={…} />,
  spotlight: hero ? <MetricSpotlight metric={hero} … /> : null,
  signoff:   <OutroScene brandName={vm.subject.name} … />,
}} />
```

The scene **map** is fixed; which beats are *scheduled* comes from the data —
`buildPackTimeline` only emits `spotlight` when a metric declared
`emphasis: 'hero'`.

### 1.5 Scenes and time

[StandardFilm](../src/templates/compositions/StandardFilm.jsx) lays the timeline
into a `TransitionSeries`:

```jsx
<TransitionSeries.Sequence durationInFrames={scene.durationInFrames} name={scene.id}>
  {sceneElement}
</TransitionSeries.Sequence>
<TransitionSeries.Transition presentation={…} timing={…} />   // between scenes
```

A scene chooses its transition *type*; the *duration* always comes from the
timeline's overlap, because scene positions were computed against it.

**Each `Sequence` rebases `useCurrentFrame()` to 0 for its children.** That is
why a scene's `delay` values are small local numbers and no scene knows its
absolute position in the film.

### 1.6 How data reaches an animation

```
vm.metrics[4]              { id:'rating', value:8.7, max:10, label:'Average Rating' }
   │  (prop)
<MetricSpotlight metric={…}>
   │  (props: value, max, delay, duration)
<RatingArc value={8.7} max={10} delay={12} duration={40}>
   │
   ├─ useCurrentFrame()                          ← Remotion context (the ONLY frame read)
   ├─ animate({ frame, from:0, to:0.87, delay, duration, easing })
   │     └─ pure: (numbers) => number
   ├─ useTheme()      → colour tokens            ← React context
   └─ useFormat()     → useVideoConfig() → px()  ← format scaling
```

The animation layer receives **a value, a delay and a duration**. It never
receives `vm`, a player, or a domain object. `framework/animations/*` are pure
`({frame, …}) => styleObject` with no React at all — which is why `npm test`
asserts the motion maths in plain Node.

The only frame readers in the system are five hooks: `useMotion`,
`useStaggeredMotion`, `useAmbientMotion`, `useSceneProgress`, `useCountUp`
(plus `useCurrentFrame` directly inside `ProgressBar`/`RatingArc`).

### 1.7 CLI render

`npx remotion render football-player-stats-landscape out.mp4 --props='{…}'`
takes the identical path: same `PackHost`, same `calculateMetadata`, same
`resolvePack`. The only difference is that frames are written to a file.

---

## 2. Editor flow — `npm run editor`

### 2.1 Boot

```
npm run editor
  → vite                       (vite.config.js: root = repo root)
      · publicDir = ./public   ← the SAME folder Remotion serves
      · alias '@' → src/       ← must match remotion.config.js or imports break in one host
      · plugins: react(), tailwindcss()
      │
      └─ index.html  →  /src/studio/main.jsx
                          · import '@/styles/tailwind.css'   (editor chrome only)
                          · createRoot(#root).render(<StrictMode><App/></StrictMode>)
```

`src/index.jsx` (Remotion) and `src/studio/main.jsx` (Vite) are the only two
entry points, and they never import each other.

### 2.2 Where documents come from

They are **static ES imports**, not fetches:

```js
// packs/football-player-stats/pack.js
import messi from './data/messi.json';
…
samples: [messi, ronaldo, haaland, mbappe, pedri, bellingham]
```

Vite (and webpack) inline them at build time. Nothing is loaded over the network
at runtime; the "player dropdown" is choosing between objects already in memory.

### 2.3 State

[EditorProvider](../src/studio/state/EditorProvider.jsx) — React context +
`useReducer`, no store library.

```js
state = { packId, document, format, issues }
```

- `restore()` reads `localStorage['msf.editor.v1']`, and falls back to
  `PACKS[0]` + `firstSample(pack)` (football + Messi) if anything is missing,
  unparseable, or names a pack that no longer exists.
- Every state change is persisted by an effect.
- **The reducer returns the same object when nothing changed.** This is
  deliberate: `<Player>` re-resolves on `inputProps` identity change.

Actions:

| Action | Effect |
| --- | --- |
| `selectPack` | swap pack, load its first sample |
| `selectSample` | swap the whole document (the player dropdown) |
| `setFormat` | landscape / reel / square |
| `setDocument` | wholesale replace (the JSON panel) |
| `patchDocument` | shallow merge at the envelope (`theme`, `timing`) |
| `patchPaths` | deep path edits via `applyPatch` (the pack's facets) |
| `setIssues` | validation results from the Stage |

### 2.4 Mounting the Player

[Stage.jsx](../src/studio/preview/Stage.jsx):

```jsx
const resolved = useMemo(() => tryResolvePack(pack, document, format), [pack, document, format]);
const lastGood = useRef(resolved.mount);
if (resolved.ok) lastGood.current = resolved.mount;
const mount = resolved.mount ?? lastGood.current;

const inputProps = useMemo(() => ({ packId: pack.id, document, format }), [pack.id, document, format]);

<Player
  ref={playerRef}
  component={PackHost}
  inputProps={inputProps}
  durationInFrames={mount.durationInFrames}
  fps={mount.fps}
  compositionWidth={mount.width}
  compositionHeight={mount.height}
  controls loop autoPlay acknowledgeRemotionLicense
/>
```

`tryResolvePack` is the non-throwing door into the same resolver: it returns
`{ ok, mount, issues }`. An invalid document keeps the **last good mount** on
screen and shows errors in the inspector — because a document is invalid
halfway through almost every edit. The render path throws instead.

**`<Player>` is what makes this work at all.** Framework components call
`useCurrentFrame()`, which requires Remotion's timing context; rendering
`<StatBoard>` in a plain React tree throws. `<Player>` supplies that context
inside an ordinary DOM app.

### 2.5 What happens when you change the player dropdown

```
<select onChange>                                    Controls.jsx
   │  dispatch({ type:'selectSample', document: haaland })
   ▼
reducer → { ...state, document: haaland }            new object identity
   ▼
context value changes (useMemo on [state])
   ▼
Stage re-renders
   ├─ useMemo deps [pack, document, format] changed
   │    → tryResolvePack(...) runs the full pipeline again
   │        · zod parse → adapter → ViewModel → theme → duration
   ├─ inputProps identity changes
   └─ <Player> re-resolves its composition and re-renders the CURRENT frame
         ▼
      <PackHost packId document format>  ← inside the Player's timing context
         └─ resolvePack(...) → <Themed(Film) vm pace>
               └─ same scenes, same animations, new values
```

No refetch, no rebuild, no remount of the Player itself. The playhead keeps its
position; all six football documents produce the same 590-frame timeline (every
player has a rating, so every film gets the spotlight beat), so playback
continues without a visible jump.

The transport ([Transport.jsx](../src/studio/preview/Transport.jsx)) subscribes
to the player's `frameupdate` / `play` / `pause` events and seeks via
`playerRef.current.seekTo()`.

### 2.6 The facet dropdowns (League / Season / Competition)

These are **declared by the pack**, not written by the editor:

```js
// packs/football-player-stats/facets.js
{ id:'league', label:'League', options: [
    { id:'laliga', label:'LaLiga', patch: {
        'data.league.name': 'LaLiga',
        'data.league.country': 'Spain',
        'data.league.logo': 'leagues/laliga.svg',
    } }, … ] }
```

`Controls.jsx` renders a `<select>` for each entry of `pack.facets` and
dispatches the chosen option's `patch`. It contains no domain vocabulary —
enforced by a grep test over `src/studio`.

Two details:

- An option carries a **patch**, not a value, because the choices are compound
  (a league is a name *and* a logo).
- The selected option is found by `patchMatches(document, option.patch)` — read
  back off the document rather than stored beside it. One source of truth, so a
  hand edit in the JSON panel updates the dropdowns automatically, and a
  document holding an unlisted value shows `— custom —` rather than lying.

### 2.7 The JSON panel

Local text buffer → debounce 200 ms → `JSON.parse` → `dispatch(setDocument)`.
Two reasons for the buffer: mid-typing text is usually invalid JSON, and every
commit changes `inputProps` identity (a commit per keystroke would stutter the
preview). It re-syncs from the document only when the textarea is unfocused, so
another panel cannot yank the caret.

---

## 3. Component hierarchy

### 3.1 The editor (`npm run editor`)

```
main.jsx
└─ <StrictMode>
   └─ <App>
      └─ <EditorProvider>                      context: {packId, document, format, issues, pack, dispatch}
         └─ <Layout>
            ├─ <Header>                        pack title · document title
            ├─ <aside> <Controls>              pack ▾ player ▾ | league ▾ season ▾ competition ▾ | theme ▾ aspect ▾ pace ▾ accent
            ├─ <main>  <Stage onResolved>
            │            ├─ <Player>           ◀══ REMOTION TIMING CONTEXT STARTS
            │            │   └─ <PackHost packId document format>
            │            │       └─ resolvePack() → <Themed(Film)>
            │            │           └─ <ThemeProvider theme>
            │            │               └─ <Film vm pace>
            │            │                   └─ <StandardFilm timeline scenes>
            │            │                       └─ <TransitionSeries>
            │            │                           ├─ <Sequence name="intro">    <SubjectIntro>
            │            │                           ├─ <Transition/>
            │            │                           ├─ <Sequence name="board">    <StatBoard>
            │            │                           ├─ <Transition/>
            │            │                           ├─ <Sequence name="spotlight"><MetricSpotlight>
            │            │                           ├─ <Transition/>
            │            │                           └─ <Sequence name="signoff">  <OutroScene>
            │            │                                                          ◀══ CONTEXT ENDS
            │            └─ <Transport playerRef>
            └─ <aside>
               ├─ <AssetPanel vm>              thumbnails read off the ViewModel
               ├─ <JsonPanel>                  document text + issues
               └─ <ExportPanel>                the equivalent CLI command
```

### 3.2 Inside a scene

```
<SubjectIntro subject={vm.subject} chips={vm.identity}>
└─ <Scene background="studio" camera="pushIn">          ← framework/layouts
   ├─ <AnimatedBackground variant="studio">             gradient + glow + grid + grain
   ├─ <AbsoluteFill style={cameraStyle}>                resolveCamera('pushIn')({frame,…})
   │  └─ <AbsoluteFill> gutters + safe areas from useFormat()
   │     └─ <Split ratio reverseWhenStacked>            row on landscape, column on vertical
   │        ├─ <Stack>                                  the lockup
   │        │  ├─ <Eyebrow>                → <Text variant="eyebrow" motion>
   │        │  ├─ <Text variant="hero">                 ghosted squad number
   │        │  ├─ <SplitText by="word">     → useStaggeredMotion → per-word <span>
   │        │  ├─ <Divider>
   │        │  └─ <IdentityCard chips>
   │        │     └─ per chip: <Emblem src> + <Caption> + <Text>
   │        └─ <MediaFrame variant="cutout"> → <Img> + zoomTo() + useAmbientMotion
   └─ <FilmOverlay>                                     vignette / grain in front
```

Every leaf resolves colour through `useTheme()` and size through
`useFormat().px()`, and gets its transform/opacity from a hook that read the
frame.

### 3.3 Remotion Studio

```
src/index.jsx → registerRoot(RemotionRoot)
└─ <RemotionRoot>
   ├─ <Folder name="Packs">
   │   ├─ <Composition id="football-player-stats-landscape" component={PackHost} …/>
   │   ├─ <Composition id="football-player-stats-reel"      …/>
   │   ├─ <Composition id="football-player-stats-square"    …/>
   │   └─ <Composition id="subject-showcase-…"              …/>
   ├─ <Folder name="Film">      <Composition component={Themed(FromIdeaToReality)} …/>
   ├─ <Folder name="Showcase">  …
   └─ <Folder name="Prototypes">…
```

From `PackHost` down, the tree is **identical** to the editor's. That is the
architecture's central claim, and it is literally the same component.

---

## 4. Public entry points

### 4.1 Internal boundaries (what code inside this repo imports)

| Barrel | Ring | Contents |
| --- | --- | --- |
| `@/framework` | 1 | motion, timeline, layouts, components, hooks, camera, transitions, formats, `withTheme`, `registerProject` |
| `@/design` | 2 | `defaultTheme`, brands, `extendTheme`, `validateTheme`, fonts |
| `@/templates` | 2.5 | 16 scene templates + `StandardFilm` |
| `@/engine` | 2.5 | ViewModel + document schemas, normalize, validate, patch, assets |
| `@/packs/*` | 3a | **no barrel** — `registry.js`, `resolve.js`, `PackHost.jsx`, `theme.js` are imported by path |

### 4.2 Process entry points

| File | Started by | Role |
| --- | --- | --- |
| [src/index.jsx](../src/index.jsx) | `remotion studio` / `render` / `still` | `registerRoot` |
| [src/studio/main.jsx](../src/studio/main.jsx) | `vite` | `createRoot().render(<App/>)` |
| [index.html](../index.html) | `vite` | loads `main.jsx` |

### 4.3 What an external React project can import today

**Nothing.** This is not a limitation of the design so much as a fact about the
package:

```json
{ "name": "motion-studio-framework", "private": true, "type": "module" }
```

- `"private": true` — npm refuses to publish it.
- No `"main"`, no `"module"`, no `"exports"` — nothing declares an importable
  surface, so `import … from 'motion-studio-framework'` has no target.
- No library build. `npm run editor:build` produces `out/editor/`, a bundled
  **application** (an `index.html` plus hashed JS/CSS), not a consumable module.
- Every internal import uses the `@/` alias, which is a *bundler* setting in
  `remotion.config.js` and `vite.config.js`. A consumer's bundler would have to
  reproduce it, because nothing rewrites those specifiers at publish time.

The nearest thing to a reusable unit is `PackHost` + `resolvePack`, and both
require a Remotion timing context to render. §7 covers what that means for an
external site.

---

## 5. What is coupled

### 5.1 Football pack → engine — **intentional**

| Where | What |
| --- | --- |
| `schema.js` | imports `engine/schema/primitives.js`, `engine/schema/document.js` |
| `timeline.js` | imports `engine/viewmodel.js` for `heroMetric` |
| `adapter.js` | imports nothing; conforms to the ViewModel shape by contract, checked by `assertViewModel` at runtime and by tests |

Deliberate, and the direction is right: `packs → engine`, never back. `engine/`
contains no football vocabulary (enforced by the grep test).

Note the import style: those three files use **relative paths, not `@/`**,
because they are pure and must load in plain Node so `npm test` can assert them
without a bundler. `Film.jsx` uses `@/templates` because it contains JSX and was
never going to load outside a bundler.

### 5.2 Football pack → pack system — **intentional**

The manifest shape (`id`, `Film`, `schema`, `adapter`, `timeline`, `formats`,
`samples`, `facets`, `subjectLabel`) is the contract `resolvePack`,
`registerPacks` and the editor all read. The pack is reached only through
`packById(id)` from [packs/registry.js](../src/packs/registry.js).

One consequence worth naming: `PackHost` resolves through the **global** `PACKS`
array. Importing the football pack therefore drags in the registry, and the
registry imports `subject-showcase` too.

### 5.3 Football pack → Remotion — **intentional and hard**

This is the deepest coupling in the system.

| Where | What |
| --- | --- |
| `Film.jsx` | `useVideoConfig()` from `remotion` |
| `StandardFilm` | `TransitionSeries`, `Sequence` |
| every scene | `Scene` → `AbsoluteFill`, `useCurrentFrame()` via hooks |
| `MediaFrame`, `Emblem` | `Img` from `remotion` |
| `engine/assets.js` | `staticFile()` |

**The film cannot render outside a Remotion timing context** — Studio, the
renderer, or `<Player>`. This is not incidental; it is the reason `<Player>` is
the sharing mechanism rather than a mock frame provider.

### 5.4 Football pack → React — **intentional**

`Film.jsx` and the scenes are JSX components. `schema.js`, `adapter.js`,
`timeline.js` and `facets.js` are plain JS with no React import — which is why
the entire data pipeline is unit-tested in Node.

### 5.5 Football pack → Remotion Studio — **not coupled**

The pack contains no Studio-specific code. Studio discovers it because
`Root.jsx` imports `registerPacks()`. The dependency points
`Root → packs`, never the reverse. Removing Studio would not touch the pack.

### 5.6 Football pack → the editor — **not coupled, with one deliberate inversion**

`src/studio/` imports `packs/`; `packs/` never imports `studio/`. The pack runs
identically with the editor deleted.

The inversion: `facets.js` and `subjectLabel` are **editor-facing metadata that
lives in the pack**. The pack knows an editor might exist and describes itself in
generic terms (`label`, `options`, `patch`); the editor renders that description
without knowing what a league is. This was chosen so the editor stays
domain-free — the alternative put football vocabulary in `studio/`, which would
require a second editor for the next sport.

### 5.7 Editor → everything else

`studio/` imports `@/packs/registry.js`, `@/packs/resolve.js`,
`@/packs/PackHost.jsx`, `@/packs/theme.js`, `@/engine` and `@/framework`
(`FORMATS` only). It is the outermost ring and nothing imports it.

---

## 6. What is reusable

Three categories:

- **F — Framework.** Domain-free, brand-free, would work in any Remotion project.
- **M — Motion Studio only.** Reusable across packs *inside this repo*; depends
  on this repo's rings or registries.
- **X — External React apps.** Importable by a separate project today.

| Layer | Class | Notes |
| --- | --- | --- |
| `framework/animations` | **F** | Pure `({frame,…}) => style`. No React, no Remotion import. The most portable code here. |
| `framework/motion`, `helpers`, `formats` | **F** | Plain values and functions. |
| `framework/timeline` | **F** | `buildTimeline` is pure; timebases are a registry. |
| `framework/hooks` | **F** | Need a Remotion context, not this repo. |
| `framework/layouts`, `components` | **F** | Brand-agnostic; read theme via context. Need a Remotion context. |
| `framework/render` (`withTheme`, `registerProject`) | **F** | Generic Remotion wiring. |
| `design/` (contract, tokens, brands) | **F** | Any project could adopt the contract; the brands are this repo's. |
| `templates/` scene library | **F** | Depends only on `@/framework`. `SubjectIntro`/`StatBoard`/`MetricSpotlight`/`IdentityCard` take ViewModel slices, so they are reusable by any pack in any sport. |
| `engine/` | **F** | ViewModel + document contracts, normalisation, patching. Imports `remotion` only for `staticFile`. |
| `packs/resolve.js` | **M** | Generic over packs, but imports `@/design` (via `theme.js`) and the `FORMATS` table. |
| `packs/theme.js` | **M** | Knows this repo's brand list by name. |
| `packs/registry.js`, `PackHost`, `register.jsx` | **M** | The registry is this repo's list of packs. |
| `packs/football-player-stats/Film.jsx` | **M** | Pure function of a ViewModel; reusable by anything that can build one and provide a Remotion context. |
| pack `schema`/`adapter`/`timeline`/`facets` | **M** | Pure; the football-shaped half of the system. |
| `subject-showcase` | **M** | The worked example new packs are copied from. |
| `studio/` (the editor) | **M** | An application, not a library. |
| `<Player>` | — | Third-party (`@remotion/player`); the external app would install it itself. |
| **Anything at all** | **X** | **None.** See §4.3 — the package is private, exposes no entry point, and ships no library build. |

The distinction that matters: a great deal of this code is *architecturally*
reusable — domain-free, well-bounded, dependency-correct — and *none of it is
currently reachable* from outside the repo, because no packaging exists.

---

## 7. What is missing for `<PlayerStatsTemplate data={player} />`

The target: a separate React + Vite project installs something, imports one
component, passes a plain JSON object, and gets the animated football template.
No editor, no Remotion Studio.

Eight things stand between here and there. None is a redesign; all are absent.

**1. A package boundary.** `private: true`, no `exports` map, no `main`. Nothing
is importable by name. A consumer has no target to install or resolve.

**2. A library build.** The only build produces an application bundle. There is
no compilation step that emits importable modules — and it would have to
compile JSX, since consumers cannot be assumed to transform `node_modules`.

**3. Alias resolution at publish time.** Every internal import is `@/…`, defined
in two bundler configs. Published as-is, those specifiers are unresolvable in
someone else's project. Nothing currently rewrites them.

**4. A component with that signature.** `<PlayerStatsTemplate data={player} />`
does not exist in any form. What exists is:

- `Film` — takes `{ vm, pace }`, a *normalised ViewModel*, not a document, and
  throws outside a Remotion context.
- `PackHost` — takes `{ packId, document, format }`, and also requires that
  context.

The desired component would have to own the `<Player>` mount internally (so the
consumer never sees Remotion), decide its own size and duration, and accept a
raw document rather than a ViewModel. No such wrapper exists.

**5. A way to reach a pack without the registry.** `PackHost` resolves via
`packById()` against the global `PACKS` array, so importing football also pulls
in `subject-showcase`, every brand, and the whole registry. There is no
"resolve *this* pack manifest directly" entry point exposed for external use —
`resolvePack(pack, doc, format)` takes a manifest and would serve, but it is not
part of any published surface.

**6. An asset base.** `staticFile()` returns `window.remotion_staticBase`-prefixed
paths, or root-relative `/packs/football-player-stats/…` when that global is
unset. An external site must therefore serve those files **at its own web root**
under exactly that path, or set the Remotion global. There is no option to tell
the pack "your assets live at `/cdn/football/`" — asset roots are baked in
`engine/assets.js` as `packs/<packId>/…`.

**7. Declared peer dependencies and a version contract.** `react` 19,
`remotion` 4.0.495 and `@remotion/player` 4.0.495 must agree between this code
and the host app — Remotion is strict about matching versions across its
packages. Nothing declares that today.

**8. Fonts and styles behaviour.** Two findings here, one of which is good news:

- *Good news:* the film itself needs **no Tailwind**. Every visual value in
  `framework/`, `templates/` and the packs comes from inline styles fed by
  `useTheme()`/`useFormat()`; the only `className` in the film-side tree is a
  passthrough prop on `Text`. Tailwind is used exclusively by the editor's
  chrome. A consumer would not need to adopt Tailwind to render the template.
- *Not handled:* brands call `loadFonts()` at **module scope**
  (`@remotion/google-fonts`), so importing a brand triggers a font load as a
  side effect of the import, in whatever app loads it. There is no opt-out and
  no documented behaviour for a host that manages its own fonts.

Also absent, though less structural: no TypeScript declarations (the repo is JSX
by policy, so a consumer gets no types), and no story for tree-shaking the
unused packs out of a consumer's bundle.

---

## 8. Final diagram

```
════════════════════════════════════════════════════════════════════════════════
 STARTUP                     TWO HOSTS, ONE SOURCE TREE
════════════════════════════════════════════════════════════════════════════════

  npm run studio                                  npm run editor
        │                                               │
  remotion.config.js                              vite.config.js
   · entry src/index.jsx                           · root = repo root
   · webpack: alias @→src, Tailwind                · publicDir = ./public
        │                                           · alias @→src, Tailwind
        ▼                                               ▼
  src/index.jsx                                   index.html → src/studio/main.jsx
  registerRoot(RemotionRoot)                      createRoot().render(<App/>)
        │                                               │
        ▼                                               ▼
  ┌─────────────────────────┐                   ┌──────────────────────────────┐
  │ Root.jsx                │                   │ <App>                        │
  │  <Folder "Packs">       │                   │  <EditorProvider>            │
  │   registerPacks()       │                   │   state {packId, document,   │
  │    → <Composition       │                   │          format, issues}     │
  │        component=       │                   │   ├── <Controls>  dropdowns  │
  │          PackHost       │                   │   ├── <AssetPanel>           │
  │        defaultProps=    │                   │   ├── <JsonPanel>            │
  │          {packId,       │                   │   └── <Stage>                │
  │           document,     │                   │        tryResolvePack(…)     │
  │           format}       │                   │        keeps last good mount │
  │        calculateMetadata│                   │            │                 │
  │          = packMetadata │                   │            ▼                 │
  │      />                 │                   │        <Player               │
  └───────────┬─────────────┘                   │          component=PackHost  │
              │                                 │          inputProps={packId, │
              │  Remotion calls                 │            document, format} │
              │  calculateMetadata({props})     │          + <Transport>       │
              │                                 └──────────────┬───────────────┘
              └──────────────┬─────────────────────────────────┘
                             │
════════════════════════════ ▼ ═════════════════════════════════════════════════
 PACK ENGINE          (Ring 3a — the single wiring point, pure)
════════════════════════════════════════════════════════════════════════════════
                    packs/resolve.js · resolvePack(pack, document, format)
                             │
   JSON ──────────►  ┌───────┴────────────────────────────────────────┐
 messi.json          │ 1. packById(packId)          registry.js       │
 ronaldo.json        │ 2. pack.schema.parse()       zod — throws      │
 haaland.json        │ 3. FORMATS[format]           w/h/fps/scale     │
 mbappe.json         │ 4. pack.adapter(doc)  ◄── THE DOMAIN BOUNDARY  │
 pedri.json          │      football → ViewModel                      │
 bellingham.json     │ 5. normalizeViewModel()      coerce, assets,   │
                     │                              assertViewModel   │
   THEME ──────────► │ 6. resolveThemeRef(theme, vm.accent)           │
 broadcastNight      │      brand + club accent → theme object        │
 broadcastDay        │ 7. withTheme(pack.Film, theme)  memoised       │
 terrace             │ 8. pack.timeline(vm, fps, pace)                │
                     │      → durationInFrames                        │
                     └───────┬────────────────────────────────────────┘
                             │ { component, inputProps:{vm,pace},
                             │   durationInFrames, fps, width, height, theme, vm }
                             ▼
                    packs/PackHost.jsx   ◄── the one mountable unit
                    serialisable props in, resolved film out
                             │
════════════════════════════ ▼ ═════════════════════════════════════════════════
 REMOTION TIMING CONTEXT BEGINS  (Studio/renderer OR <Player> — identical below)
════════════════════════════════════════════════════════════════════════════════
                    <ThemeProvider theme>          ← visual tokens enter
                             │
                    <Film vm pace>                 Ring 3a · packs/football…
                      useVideoConfig() → fps
                      buildPackTimeline(vm,fps,pace)
                      heroMetric(vm)
                             │
                    <StandardFilm timeline scenes> Ring 2.5 · templates
                      <TransitionSeries>
                        ├ Sequence "intro"   ─► <SubjectIntro   subject, chips>
                        ├ Sequence "board"   ─► <StatBoard      metrics>
                        ├ Sequence "spotlight"► <MetricSpotlight metric>   ▲ only if
                        └ Sequence "signoff" ─► <OutroScene>               │ a metric
                             │                         each Sequence       │ is 'hero'
                             │                         rebases frame → 0   │
                             ▼
                    SCENES (Ring 2.5) — ViewModel slices in, no domain nouns
                      <Scene background camera>
                        ├ AnimatedBackground   gradient·glow·grid·grain
                        ├ camera move          resolveCamera(name)({frame,…})
                        ├ content              Split · Stack · Grid · Center
                        └ FilmOverlay          vignette·grain in front
                             │
                             ▼
                    FRAMEWORK COMPONENTS (Ring 1)
                      Text · SplitText · Emblem · MediaFrame · Surface
                      CountUp · ProgressBar · RatingArc · Divider · Reveal
                             │
                    ┌────────┴───────────────────────────────┐
                    │  useTheme()      → colours, type       │ React context
                    │  useFormat()     → px(), gutters       │ useVideoConfig
                    │  useMotion()     ─┐                    │
                    │  useCountUp()     ├─► useCurrentFrame()│ THE ONLY frame reads
                    │  useSceneProgress()┘                   │
                    └────────┬───────────────────────────────┘
                             ▼
                    ANIMATIONS (Ring 1) — pure, no React
                      fadeIn · riseIn · blurIn · scaleIn · flipIn · maskReveal
                      animate({frame, from, to, delay, duration, easing})
                      mergeMotion(a, b)   ← concatenates transforms,
                                            multiplies opacities
                             │
                             ▼
                      { opacity, transform, filter }  →  style object
                             │
════════════════════════════ ▼ ═════════════════════════════════════════════════
 OUTPUT
════════════════════════════════════════════════════════════════════════════════
    Studio: live canvas          Player: live <div> in the website
    CLI:    npx remotion render … --props='{packId, document, format}'  → MP4

    Data never flows backward. Animations never see a document.
    The Film never learns which host mounted it.
```
