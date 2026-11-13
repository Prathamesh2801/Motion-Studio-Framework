# Scene templates

The 12 templates in `src/templates/scenes/` are the primary authoring surface.
Each is a complete beat: it owns its layout, reflows across every format, and
takes content through **slots**.

Import from `@/templates`.

---

## Shared props

Every template accepts these. They are the reason you rarely need to reach past a
template into the layout system:

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `background` | atmosphere name | varies | `studio` · `hearth` · `workshop` · `flat` |
| `camera` | camera name | varies | `static` · `push` · `pushIn` · `pull` · `pan` · `drift` · `handheld` |
| `delay` | frames | `0` | Push the whole beat's entrance later |
| `step` | frames | `stagger.loose` | Gap between staggered children |
| `align` | `'start' \| 'center'` | editorial default | Most templates; see each below |
| `style` | style object | — | Escape hatch on the scene root |

**Slots take nodes, not strings.** `media` and `actions` accept arbitrary JSX:

```jsx
<HeroScene
  media={<MediaFrame src={asset.image('hero.png')} preset="depth" kenBurns={0.06} />}
  actions={<CTA variant="solid">Get started</CTA>}
/>
```

This is the main defence against template sprawl — a template never grows a prop
per variation, because the caller supplies the node.

---

## The templates

### `TitleScene` — opening card
```jsx
<TitleScene kicker="Motion Studio" title={'Composed,\nnot written.'} subtitle="…" />
```
`kicker` · `title` · `subtitle` · `rule` (default `true`) — no `align`, always
centred. Defaults: `hearth` / `pushIn`.

### `HeroScene` — statement with media and a call to action
```jsx
<HeroScene eyebrow="…" title="…" description="…" media={…} actions={…} />
```
`eyebrow` · `title` · `description` · `media` · `actions` · `align`.
Defaults: `hearth` / `push`.

### `SectionIntro` — chapter marker
```jsx
<SectionIntro index="01" eyebrow="Chapter" title="What the system provides." />
```
`index` · `eyebrow` · `title` · `description` · `align`.
Defaults: `workshop` / `push`.

### `FeatureShowcase` — feature list beside media
```jsx
<FeatureShowcase title="…" features={FEATURES} media={…} mediaFirst />
```
`eyebrow` · `title` · `description` · `features[]` · `media` · `marker`
(`'number'` \| other) · `mediaFirst` · `align`. Defaults: `studio` / `push`.

`features`: `[{ id?, title, description? }]`

### `StatisticsScene` — a row of numbers
```jsx
<StatisticsScene eyebrow="Surface area" title="One architecture." stats={STATS} />
```
`eyebrow` · `title` · `description` · `stats[]` · `columns` · `bare` · `align`.
Defaults: `studio` / `push`.

`stats`: `[{ id?, label, value, prefix?, suffix? }]` — `value` counts up.
Numeric strings are coerced; anything else throws by name.

Leave `columns` undefined unless you mean to override: `Grid` already picks
4/3/2/1 per bucket.

### `TimelineScene` — ordered milestones
```jsx
<TimelineScene eyebrow="Roadmap" title="How it was built." items={MILESTONES} />
```
`eyebrow` · `title` · `description` · `items[]` · `orientation` · `align`.
Defaults: `workshop` / `push`.

`items`: `[{ id?, label, title, description? }]`

Changes *orientation*, not just size: a horizontal track on wide canvases becomes
a vertical run on portrait.

### `QuoteScene` — pull quote
```jsx
<QuoteScene quote={'Make every change at the lowest layer\nthat can express it.'}
            attribution="Architecture principle" role="…" />
```
`quote` · `attribution` · `role` — no `align`, always centred.
Defaults: `hearth` / `pushIn`.

### `GalleryScene` — image grid
```jsx
<GalleryScene eyebrow="Systems" title="Layers of the stack." items={GALLERY} />
```
`eyebrow` · `title` · `description` · `items[]` · `columns` · `aspectRatio`
(default `4/3`) · `align`. Defaults: `studio` / `push`. Uses a tighter
`stagger.base`.

`items`: `[{ id?, src, alt?, caption? }]`

### `ProductShowcase` — a single subject in detail
```jsx
<ProductShowcase badge="Layout primitive" title="Split" description="…"
                 features={['Composable', 'Ratio aware']} media={…} />
```
`badge` · `title` · `description` · `features[]` · `media` · `actions` ·
`mediaFirst` · `align`. Defaults: `studio` / `push`.

### `VideoSection` — full-bleed footage with an overlay
```jsx
<VideoSection media={<Img src={…} />} eyebrow="…" title="…" caption="…" />
```
`media` · `eyebrow` · `title` · `caption` · `anchor` (default `'bottom-left'`) ·
`scrim` (default `'bottom'`). Defaults: `flat` / `static`.

The scrim is the layout's job, not yours — legibility over uncontrolled media is
a layout concern.

### `CTAScene` — the ask
```jsx
<CTAScene title="Compose the next video." primaryAction="Start a project"
          secondaryAction="Read the docs" />
```
`eyebrow` · `title` · `description` · `primaryAction` · `secondaryAction` ·
`contact` · `align` (default `'center'`). Defaults: `hearth` / `pushIn`.

### `OutroScene` — end card
```jsx
<OutroScene brandName="Motion Studio" tagline="…" website="…" />
```
`brandName` · `logo` · `tagline` · `cta` · `ctaVariant` (default `'outline'`) ·
`website`. No `step` or `align`. Defaults: `hearth` / `static`.

---

## Every optional slot is genuinely optional

If a template collapses or throws when an optional slot is omitted, that is a
bug in the template — fix it rather than working around it.

---

## When a template is not enough

In order of preference:

1. **Fill a slot with richer JSX.** Usually sufficient.
2. **Compose layout primitives directly** — `Scene`, `Stack`, `Split`, `Grid`,
   `Center`, `FullBleed` (in `src/framework/layouts`).
3. **Write a new template**, if the shape will recur. It must import from
   `@/framework` only — never from `design/` or another project, or it stops
   being theme-independent. See [EXTENDING.md](EXTENDING.md).

Reaching for (2) occasionally is healthy. Reaching for it every scene means a
template is missing.
