# Motion Studio Framework

A Remotion motion-graphics toolkit: reusable motion primitives, themes and scene
templates, plus the videos built with them.

React 19 + Remotion 4 + TailwindCSS 4. **JSX only, no TypeScript.**

```bash
npm install
npm run studio                          # Remotion Studio at http://localhost:3000
npm test                                # pure-Node assertions
npm run sprite -- CloudSlash-Square     # sprite sheet → out/sprites/
npm run create-project -- my-film --title "My Film"
```

## Layout

```
src/
├─ framework/   motion engine: animations, presets, camera, transitions, layouts,
│               components, formats, timeline, registerProject
├─ design/      theme contract, tokens, brands, fonts
├─ templates/   12 scene templates + StandardFilm
├─ projects/    one folder per video, listed in projects/registry.js
└─ SpriteSheet.jsx   renders any project as a sprite-sheet still
```

Dependencies point inward: `projects → templates → design → framework`.

## Authoring a film

A film is a timeline + a scene map + content:

```jsx
const timeline = buildTimeline(
  [{ id: 'title', seconds: 4 }, { id: 'outro', seconds: 4 }],
  { fps, timebase: 'seconds', transition: 'base' },
);

<StandardFilm
  timeline={timeline}
  scenes={{
    title: <TitleScene kicker="…" title="…" />,
    outro: <OutroScene brandName="…" />,
  }}
/>;
```

## Transparent export

```bash
npx remotion render src/index.jsx CloudSlash-Square out/icons/CloudSlash.mov \
  --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le
```

## Docs

[AUTHORING](docs/AUTHORING.md) · [TEMPLATES](docs/TEMPLATES.md) ·
[THEMING](docs/THEMING.md) · [TIMELINE](docs/TIMELINE.md) ·
[EXTENDING](docs/EXTENDING.md)
