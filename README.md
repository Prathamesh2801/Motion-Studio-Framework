# Motion Studio Framework

A reusable Remotion motion-graphics framework for producing many *categories* of
video — product showcases, explainers, documentaries, reels, kinetic type,
infographics, map/timeline animations, hybrid video+motion and more — from one
codebase, without restructuring per project.

React 19 + Remotion 4 + TailwindCSS 4. **JSX only, no TypeScript.** There is no
Vite: Remotion ships its own bundler and Studio; `remotion.config.js` holds what
would otherwise be build config.

```bash
npm install
npm run studio     # Remotion Studio at http://localhost:3000
npm test           # timeline + soundtrack-edit assertions (pure, no runner needed)
```

## Architecture (three rings, strict inward dependency)

```
projects → design → framework      (framework depends on nothing internal)

src/
├─ framework/   Ring 1 — brand-agnostic, extractable. Motion engine, timeline,
│               layouts, components, camera, transitions, audio, formats, hooks.
├─ design/      Ring 2 — themeable. Theme contract + default theme + brand presets + fonts.
├─ templates/   Reusable scene & composition blueprints new projects start from.
└─ projects/    Ring 3 — one folder per video (data + timeline + scenes + descriptor).
```

The full architecture and rationale live in the approved plan
(`motion-studio-framework` plan file). Implementation is incremental; each phase
keeps Remotion Studio compiling and is verified visually.

## Timeline

Scene lengths are authored in whatever timebase suits the video. The engine is a
strategy **registry**, so adding a way to express time is an entry, not a code
path — see `framework/timeline/strategies.js` for the contract.

```js
buildTimeline([{ id: 'intro', seconds: 3 }], { fps, timebase: 'seconds', transition: 'base' })
```

| Timebase  | Scene shape                  | Use |
| --------- | ---------------------------- | --- |
| `frames`  | `{ id, frames }`             | The primitive everything compiles to |
| `seconds` | `{ id, seconds }`            | Default — copy-paced video |
| `bars`    | `{ id, bars, sourceBar? }`   | Grid-locked cuts; **music optional** |

Custom strategies can be registered by name (`registerTimebase`) or passed
inline, which is how semantic/voiceover scheduling plugs in later.

**Status:** Phase 3 complete — timeline engine, transition registry, decoupled
audio and `registerProject` are in and verified by 20 assertions plus a
non-musical (`seconds`) and a grid-locked (`bars`, with audio) demo project.
Next: responsive layout primitives and the scene template library (Phase 4).
