# Motion Studio Framework

A reusable Remotion motion-graphics framework for producing many *categories* of
video — product showcases, explainers, documentaries, reels, kinetic type,
infographics, brand films and formats that do not exist yet — from one codebase,
without restructuring per project.

React 19 + Remotion 4 + TailwindCSS 4. **JSX only, no TypeScript.** There is no
Vite: Remotion ships its own bundler and Studio, and `remotion.config.js` holds
what would otherwise be build config.

```bash
npm install
npm run studio      # Remotion Studio at http://localhost:3000
npm test            # pure-Node assertions, no runner or bundler needed
npm run verify      # the health check: tests, theme sync, compositions, stills
```

## What authoring a video looks like

A film is **a timeline (structure) + a scene map (which template plays each
beat) + content**. There are no frame offsets, no layout maths, no
`if (isVertical)` branches, and no transition wiring:

```jsx
const timeline = buildTimeline(
  [
    { id: 'title', seconds: 4 },
    { id: 'point', seconds: 5 },
    { id: 'outro', seconds: 4 },
  ],
  { fps, timebase: 'seconds', transition: 'base' },
);

<StandardFilm
  timeline={timeline}
  scenes={{
    title: <TitleScene kicker="…" title="…" subtitle="…" />,
    point: <SectionIntro index="01" eyebrow="…" title="…" />,
    outro: <OutroScene brandName="…" website="…" />,
  }}
/>;
```

Re-ordering the film is re-ordering the array. Every beat reflows across all four
format buckets on its own.

```bash
npm run create-project -- my-film --title "My Film"
```

scaffolds exactly that, ready to render.

## Architecture

Three rings, strict inward dependency — the framework depends on nothing internal:

```
projects → templates → design → framework

src/
├─ framework/   Ring 1 — brand-agnostic, extractable. Motion engine, timeline,
│               layouts, components, camera, transitions, audio, formats, hooks.
├─ design/      Ring 2 — themeable. Theme contract, tokens, brands, fonts.
├─ templates/   12 scene templates + StandardFilm. The authoring surface.
└─ projects/    Ring 3 — one folder per video, listed in `projects/registry.js`.
```

New capability arrives as **registry entries**, never as engine changes: a new
animation, preset, camera move, transition, atmosphere recipe, timebase strategy
or scene template is an addition. See [docs/EXTENDING.md](docs/EXTENDING.md).

## Documentation

| Doc | Read it when |
| --- | --- |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | You want to know why the boundaries are where they are |
| [AUTHORING.md](docs/AUTHORING.md) | You are making a video — **start here** |
| [TEMPLATES.md](docs/TEMPLATES.md) | You need the slot reference for the 12 templates |
| [THEMING.md](docs/THEMING.md) | You are building a brand, or working with fonts |
| [TIMELINE.md](docs/TIMELINE.md) | You need bars/frames, or a custom timebase |
| [EXTENDING.md](docs/EXTENDING.md) | You want to add a preset, camera, transition or template |
| [BEST_PRACTICES.md](docs/BEST_PRACTICES.md) | Before your first review |
| [FRAMEWORK_STATUS.md](docs/FRAMEWORK_STATUS.md) | You want to know what exists and what is proven |
| [COMPATIBILITY.md](docs/COMPATIBILITY.md) | You are upgrading a dependency |

## Verification

The framework's output is *visual*, so regressions are silent — nothing throws
when a font falls back or a layout stops reflowing. Two compositions exist to
make that loud:

- **`FrameworkShowcase`** (92s, 11 chapters) — one chapter per subsystem, so a
  bad frame names the module to open. Re-render after any framework change.
- **`TortureTest`** (28s, 4 formats) — long text, empty slots, extreme layouts,
  and the only place `ultrawide` and `exhibition` are rendered.

`npm run verify` runs the tests, checks the generated Tailwind theme is in sync,
resolves every composition, and renders 18 attributable stills across landscape,
portrait, ultrawide and exhibition. `npm run verify -- --full` adds a complete
MP4 render.
