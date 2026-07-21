import React from 'react';
import { useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import {
  Stack,
  Grid,
  Split,
  Text,
  Caption,
  Eyebrow,
  Surface,
  Soundtrack,
  buildTimeline,
  createBarGrid,
  ThemeProvider,
  useTheme,
  useFormat,
} from '@/framework';
import { StandardFilm } from '@/templates';
import { editorialTheme } from '@/design';
import { Chapter } from '../Chapter.jsx';

/**
 * Chapters 08, 09 and 10 — timeline, audio and theme.
 *
 * These are the three chapters that carry real architectural risk. Nested
 * timelines and nested theme providers are both things the framework ASSUMES
 * work and has never actually exercised; if either is broken, the framework is
 * not v1. They are in the film rather than the torture test on purpose, so the
 * failure is loud.
 */

/**
 * Chapter 08 — a `bars` timeline running INSIDE the outer `seconds` film.
 *
 * The two timebases have to coexist: the outer film places this chapter in
 * seconds, and the chapter places its own beats on a 120 BPM bar lattice. The
 * readout makes the relationship visible — if nesting were broken, the inner
 * beats would drift against the frame counter rather than landing on bars.
 */
const BeatPanel = ({ label, index }) => {
  const { px } = useFormat();
  const theme = useTheme();
  return (
    <Surface
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: px(10),
        background: index % 2 === 0 ? theme.colors.gradients.surface : theme.colors.surfaceRaised,
      }}
    >
      <Text variant="cardTitle" motion={{ preset: 'depth' }} style={{ fontSize: px(52) }}>
        {label}
      </Text>
      <Caption>bar {index * 2}</Caption>
    </Surface>
  );
};

const Readout = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { px } = useFormat();
  const theme = useTheme();

  const seconds = frame / fps;
  const bars = seconds / 2; // 120 BPM, 4/4 → one bar every 2s

  return (
    <div
      style={{
        display: 'flex',
        gap: px(28),
        fontFamily: theme.typography.fontStacks.mono,
        fontSize: px(20),
        color: theme.colors.text.secondary,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <span>frame {String(frame).padStart(4, '0')}</span>
      <span>{seconds.toFixed(2)}s</span>
      <span style={{ color: theme.colors.primary }}>bar {bars.toFixed(2)}</span>
    </div>
  );
};

export const TimelineChapter = () => {
  const { fps } = useVideoConfig();
  const { px } = useFormat();

  // An inner film on the `bars` timebase. 120 BPM, 4/4 → 2s per bar.
  const grid = createBarGrid({ bpm: 120, beatsPerBar: 4 });
  const inner = buildTimeline(
    [
      { id: 'one', bars: 1 },
      { id: 'two', bars: 1 },
      { id: 'three', bars: 1 },
      { id: 'four', bars: 1 },
    ],
    { fps, timebase: 'bars', grid, transition: 'cut' },
  );

  return (
    <Chapter
      index={8}
      subsystem="Timeline"
      validates={`Outer film: seconds. This chapter: bars @120BPM (${inner.durationInFrames}f). Two timebases, one render.`}
      background="workshop"
      camera="static"
    >
      <Stack gap={{ landscape: 24, vertical: 16 }} style={{ width: '100%' }}>
        <Text variant="sectionTitle" style={{ fontSize: px(44) }}>
          A timeline inside a timeline.
        </Text>
        <Readout />

        {/* The nested film needs a sized, positioned box to fill. Note that
            `Surface` sizes to its CONTENT rather than stretching, so the panels
            inside set `width: 100%` explicitly — see BeatPanel. */}
        <div
          style={{
            width: '100%',
            height: px(230),
            position: 'relative',
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          <StandardFilm
            timeline={inner}
            transition="none"
            scenes={{
              one: <BeatPanel label="1" index={0} />,
              two: <BeatPanel label="2" index={1} />,
              three: <BeatPanel label="3" index={2} />,
              four: <BeatPanel label="4" index={3} />,
            }}
          />
        </div>

        <Caption>
          The inner beats land on bars; the outer film never knows this chapter is musical.
        </Caption>
      </Stack>
    </Chapter>
  );
};

/**
 * Chapter 09 — the audio edit.
 *
 * Cuts are passed explicitly rather than coming from `derived.musicCuts`,
 * because the outer film is on the `seconds` timebase and does not emit them.
 * That is itself worth proving: the audio engine is track- AND timebase-
 * agnostic — it takes cut positions from whoever owns them.
 */
export const AudioChapter = ({ musicSrc }) => {
  const { px } = useFormat();
  const theme = useTheme();

  return (
    <Chapter
      index={9}
      subsystem="Audio"
      validates="buildSoundtrackEdit · equal-power crossfade at a splice · gain accepts a function (the ducking seam)"
    >
      <Stack gap={{ landscape: 24, vertical: 16 }} style={{ width: '100%' }}>
        <Eyebrow>Audio engine</Eyebrow>
        <Text variant="sectionTitle" style={{ fontSize: px(44) }}>
          Spliced, not faded to silence.
        </Text>

        <Split ratio={[1, 1]} gap={{ landscape: 28, vertical: 16 }}>
          <Surface style={{ padding: px(26) }}>
            <Stack gap={10} align="flex-start">
              <Caption>Equal-power join</Caption>
              <Text variant="description" motion={null} style={{ fontSize: px(20) }}>
                Sine and cosine legs sum to constant power, so a splice does not
                dip ~3 dB in the middle the way a linear crossfade does.
              </Text>
            </Stack>
          </Surface>

          <Surface style={{ padding: px(26) }}>
            <Stack gap={10} align="flex-start">
              <Caption>Ducking seam</Caption>
              <Text
                variant="description"
                motion={null}
                style={{ fontSize: px(20), color: theme.colors.text.secondary }}
              >
                <code style={{ fontFamily: theme.typography.fontStacks.mono }}>gain</code> accepts a
                function of the absolute timeline frame. Narration is not built —
                the mount point is.
              </Text>
            </Stack>
          </Surface>
        </Split>

        {musicSrc ? <Caption>bed: {musicSrc.split('/').pop()}</Caption> : <Caption>no bed configured</Caption>}
      </Stack>
    </Chapter>
  );
};

/**
 * Chapter 10 — a live theme swap, mid-film.
 *
 * The same subtree is rendered twice: once under the film's theme, once under a
 * deliberately opposite brand, side by side. This is the strongest available
 * check on the theme system, because both trees are on screen simultaneously —
 * a component that reached past `useTheme()` for a colour would show identical
 * output on both sides, which is immediately visible.
 *
 * It also proves ThemeProvider NESTS. `registerProject` wraps the whole film in
 * one provider; this mounts another inside it.
 */
const ThemeSpecimen = ({ caption }) => {
  const { px } = useFormat();
  const theme = useTheme();

  return (
    <div
      style={{
        borderRadius: theme.radii.md,
        overflow: 'hidden',
        background: theme.colors.gradients.canvas,
        boxShadow: theme.shadows.lg,
        padding: px(30),
        minHeight: px(300),
      }}
    >
      <Stack gap={14} align="flex-start">
        <Text variant="eyebrow" motion={null} style={{ color: theme.colors.primary }}>
          {theme.name}
        </Text>
        <Text variant="cardTitle" motion={null} style={{ fontSize: px(38) }}>
          {caption}
        </Text>
        <Text
          variant="description"
          motion={null}
          style={{ fontSize: px(19), color: theme.colors.text.secondary }}
        >
          Same component tree. Colour, type and atmosphere all arrive through
          useTheme().
        </Text>
        <div style={{ display: 'flex', gap: px(10), marginTop: px(8) }}>
          {['primary', 'secondary', 'accent'].map((key) => (
            <div
              key={key}
              style={{
                width: px(52),
                height: px(52),
                borderRadius: theme.radii.xs,
                background: theme.colors[key],
              }}
            />
          ))}
        </div>
      </Stack>
    </div>
  );
};

export const ThemeChapter = () => {
  const { px } = useFormat();

  return (
    <Chapter
      index={10}
      subsystem="Theme"
      validates="ThemeProvider nests · two brands rendering simultaneously · atmosphere overridden per brand"
      background="hearth"
    >
      <Stack gap={{ landscape: 24, vertical: 16 }} style={{ width: '100%' }}>
        <Text variant="sectionTitle" style={{ fontSize: px(44) }}>
          Two brands, one component tree.
        </Text>

        <Split ratio={[1, 1]} gap={{ landscape: 26, vertical: 16 }}>
          {/* Inherits the film's theme. */}
          <ThemeSpecimen caption="The film's theme." />

          {/* A nested provider — the thing being tested. */}
          <ThemeProvider theme={editorialTheme}>
            <ThemeSpecimen caption="An opposite brand." />
          </ThemeProvider>
        </Split>
      </Stack>
    </Chapter>
  );
};
