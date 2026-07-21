import React from 'react';
import {
  Scene,
  Stack,
  Grid,
  Split,
  Center,
  FullBleed,
  Text,
  Caption,
  Eyebrow,
  Surface,
  StatCard,
  ThemeProvider,
  buildTimeline,
  useFormat,
  useResponsive,
  useTheme,
} from '@/framework';
import { StandardFilm, TitleScene, HeroScene, StatisticsScene, GalleryScene, QuoteScene } from '@/templates';
import { editorialTheme } from '@/design';

/**
 * Torture-test cases.
 *
 * Robustness over looks. Every case here is something that WILL happen on a real
 * project — copy longer than the designer imagined, a CMS field that came back
 * empty, a data set with forty rows instead of four — and the question is only
 * whether the framework degrades sensibly or falls apart.
 *
 * These are deliberately ugly. A case that was made to look good would stop
 * testing the thing it was written for.
 */

const LONG_TITLE =
  'A title of roughly two hundred characters, written specifically to overflow every ' +
  'container it is placed inside, so that we find out whether the layout clips it, ' +
  'wraps it, or pushes the rest of the composition off the canvas entirely.';

const UNBREAKABLE = 'Supercalifragilisticexpialidocious_Antidisestablishmentarianism_Pneumonoultramicroscopic';

/** Case chrome: a label so a still says which edge case it is. */
export const Case = ({ id, title, expectation, children, background = 'flat' }) => {
  const { px, format } = useFormat();
  const theme = useTheme();

  return (
    <Scene background={background} camera="static" justify="flex-start">
      <Stack gap={{ landscape: 14, vertical: 10 }} style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: px(16) }}>
          <Text variant="eyebrow" motion={null} style={{ color: theme.colors.primary }}>
            {id} · {title}
          </Text>
          <Text variant="eyebrow" motion={null} style={{ color: theme.colors.text.muted }}>
            {format.id} · {format.width}×{format.height}
          </Text>
        </div>
        <Text
          variant="caption"
          motion={null}
          style={{ color: theme.colors.text.muted, fontSize: px(16) }}
        >
          expect: {expectation}
        </Text>
        <div style={{ width: '100%' }}>{children}</div>
      </Stack>
    </Scene>
  );
};

/** T1 — text that is too long, too short, empty, and unbreakable. */
export const TextExtremes = () => {
  const { px } = useFormat();
  return (
    <Case
      id="T1"
      title="Text extremes"
      expectation="long copy wraps and stays inside the gutters; the unbreakable word does not widen its grid track"
    >
      <Stack gap={{ landscape: 12, vertical: 8 }}>
        <Text variant="sectionTitle" motion={null} style={{ fontSize: px(30) }}>
          {LONG_TITLE}
        </Text>

        <Grid columns={{ ultrawide: 4, landscape: 3, square: 2, portrait: 1 }} gap={12}>
          {/* minmax(0,1fr) is what should stop this widening its column. */}
          <Surface style={{ padding: px(14) }}>
            <Caption>{UNBREAKABLE}</Caption>
          </Surface>
          <Surface style={{ padding: px(14) }}>
            <Caption>x</Caption>
          </Surface>
          <Surface style={{ padding: px(14) }}>
            <Caption>{''}</Caption>
          </Surface>
        </Grid>
      </Stack>
    </Case>
  );
};

/** T2 — templates given ONLY their required props; every optional slot omitted. */
export const MissingSlots = () => (
  <Case
    id="T2"
    title="Missing optional slots"
    expectation="no template throws, and none leaves a gap where an omitted slot was"
    background="studio"
  >
    <Split ratio={[1, 1]} gap={{ landscape: 16, vertical: 10 }}>
      <div style={{ height: 320, position: 'relative', overflow: 'hidden', borderRadius: 12 }}>
        {/* No subtitle, no kicker. */}
        <TitleScene title="Title only" />
      </div>
      <div style={{ height: 320, position: 'relative', overflow: 'hidden', borderRadius: 12 }}>
        {/* No media, no actions, no description, no eyebrow. */}
        <HeroScene title="Hero with nothing else" />
      </div>
    </Split>
  </Case>
);

/** T3 — a grid with far more, and far fewer, items than it was designed for. */
export const GridExtremes = () => {
  const { px } = useFormat();
  const many = Array.from({ length: 40 }, (_, i) => i + 1);

  return (
    <Case
      id="T3"
      title="Grid extremes — 40 items, then 1"
      expectation="40 items stay on the grid and inside the canvas; a single item does not stretch to full width"
    >
      <Stack gap={10}>
        <Grid columns={{ ultrawide: 10, landscape: 8, square: 5, portrait: 4 }} gap={8}>
          {many.map((n) => (
            <Surface key={n} padding={8} style={{ textAlign: 'center' }}>
              <Caption>{n}</Caption>
            </Surface>
          ))}
        </Grid>

        <Grid gap={8}>
          <Surface padding={10}>
            <Caption>the only item</Caption>
          </Surface>
        </Grid>
      </Stack>
    </Case>
  );
};

/** T4 — degenerate timelines: one scene, a one-frame scene, and no overlap. */
export const TimelineExtremes = () => {
  const { fps } = useFormat().format;
  const { px } = useFormat();

  const single = buildTimeline([{ id: 'only', seconds: 2 }], { fps: fps ?? 30, transition: 'cut' });
  const oneFrame = buildTimeline(
    [
      { id: 'blink', frames: 1 },
      { id: 'rest', frames: 60 },
    ],
    { fps: fps ?? 30, timebase: 'frames', transition: 'cut' },
  );

  return (
    <Case
      id="T4"
      title="Timeline extremes"
      expectation="a one-scene film and a one-frame scene both build; zero overlap emits no transition"
    >
      <Stack gap={10}>
        <Caption>
          single-scene film: {single.scenes.length} scene, {single.durationInFrames}f, overlap{' '}
          {single.overlap}
        </Caption>
        <Caption>
          one-frame scene: [{oneFrame.scenes.map((s) => s.durationInFrames).join(', ')}]f, total{' '}
          {oneFrame.durationInFrames}f
        </Caption>

        <div style={{ width: '100%', height: px(160), position: 'relative', overflow: 'hidden', borderRadius: 12 }}>
          <StandardFilm
            timeline={single}
            transition="none"
            scenes={{ only: <QuoteScene quote="A film of one scene." attribution="T4" /> }}
          />
        </div>
      </Stack>
    </Case>
  );
};

/** T5 — ThemeProvider nested three deep, alternating brands. */
export const ThemeNesting = () => {
  const { px } = useFormat();

  const Box = ({ depth, children }) => {
    const theme = useTheme();
    return (
      <div
        style={{
          padding: px(14),
          borderRadius: 10,
          background: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <Text variant="eyebrow" motion={null} style={{ color: theme.colors.primary }}>
          depth {depth} · {theme.name}
        </Text>
        <div style={{ marginTop: px(10) }}>{children}</div>
      </div>
    );
  };

  return (
    <Case
      id="T5"
      title="Theme nesting, three deep"
      expectation="each level reads its NEAREST provider; the innermost is the film's theme again"
    >
      <Box depth={1}>
        <ThemeProvider theme={editorialTheme}>
          <Box depth={2}>
            <ThemeProvider theme={editorialTheme}>
              <Box depth={3}>
                <Caption>innermost</Caption>
              </Box>
            </ThemeProvider>
          </Box>
        </ThemeProvider>
      </Box>
    </Case>
  );
};

/** T6 — responsive readout plus a Center with copy far beyond its measure. */
export const ResponsiveStress = () => {
  const { px, format, gutter, safeTop } = useFormat();
  const { bucket } = useResponsive();

  return (
    <Case
      id="T6"
      title="Responsive stress"
      expectation="bucket matches the canvas; Center caps the measure rather than running edge to edge"
    >
      <Stack gap={10}>
        <Caption>
          bucket={bucket} · gutter={Math.round(gutter)} · safeTop={Math.round(safeTop)} · px(100)=
          {Math.round(px(100))}
        </Caption>
        <Center>
          <Text variant="description" motion={null} style={{ fontSize: px(20) }}>
            {LONG_TITLE} {LONG_TITLE}
          </Text>
        </Center>
      </Stack>
    </Case>
  );
};

/** T7 — data-driven templates fed awkward data. */
export const DataExtremes = () => (
  <Case
    id="T7"
    title="Data extremes"
    expectation="an empty list renders nothing rather than throwing; large and zero values both format"
    background="workshop"
  >
    <Stack gap={12}>
      <Grid columns={{ ultrawide: 4, landscape: 4, square: 2, portrait: 2 }} gap={12}>
        <StatCard value={0} label="zero" />
        <StatCard value={1234567} label="large, separated" />
        <StatCard value={99.95} label="decimals" decimals={2} format="plain" />
        <StatCard value={4200} label="compact" format="compact" />
      </Grid>

      {/* Empty collections — the most common CMS failure. */}
      <div style={{ height: 200, position: 'relative', overflow: 'hidden', borderRadius: 12 }}>
        <StatisticsScene eyebrow="Empty" title="No stats supplied" stats={[]} />
      </div>
      <div style={{ height: 200, position: 'relative', overflow: 'hidden', borderRadius: 12 }}>
        <GalleryScene eyebrow="Empty" title="No items supplied" items={[]} />
      </div>
    </Stack>
  </Case>
);
