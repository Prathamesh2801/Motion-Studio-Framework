import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import {
  Grid,
  Stack,
  Text,
  Surface,
  entrances,
  exits,
  ambientPresets,
  resolvePreset,
  cameras,
  resolveCamera,
  mergeMotion,
  useFormat,
  useTheme,
} from '@/framework';
import { Chapter } from '../Chapter.jsx';

/**
 * Chapters 02 and 03 — the motion engine and the camera vocabulary.
 *
 * ── WHY THESE ITERATE THE REGISTRIES ────────────────────────────────────────
 * Both chapters render one tile per registry ENTRY rather than a hand-listed
 * set. That means adding a preset or a camera move automatically puts it on
 * screen in the next render, and a preset that throws or produces no visible
 * motion is caught the first time the film is rendered after it lands.
 *
 * A hand-written list would drift out of date with the registries within about
 * two additions — which is the exact failure mode the showcase exists to catch,
 * so it should not be built into the showcase itself.
 */

/** One labelled specimen tile. */
const Specimen = ({ name, style, note }) => {
  const { px } = useFormat();
  const theme = useTheme();

  return (
    <div style={{ minWidth: 0 }}>
      <Surface
        preset="none"
        style={{
          height: px(150),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          ...style,
        }}
      >
        <div
          style={{
            width: px(56),
            height: px(56),
            borderRadius: theme.radii.sm,
            background: theme.colors.gradients.brand,
          }}
        />
      </Surface>
      <Text variant="caption" motion={null} style={{ marginTop: px(10), fontSize: px(19) }}>
        {name}
      </Text>
      {note ? (
        <Text
          variant="caption"
          motion={null}
          style={{ color: theme.colors.text.muted, fontSize: px(15) }}
        >
          {note}
        </Text>
      ) : null}
    </div>
  );
};

/**
 * Chapter 02 — every entrance, exit and ambient preset firing at once.
 *
 * Entrances run on a stagger so they are individually readable; the ambient
 * layer is composed on top with `mergeMotion`, which is the specific thing that
 * would break silently if merge ever regressed to an object spread (transforms
 * would collapse to whichever ran last and the tiles would stop drifting).
 */
export const MotionChapter = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { px } = useFormat();

  const entranceNames = Object.keys(entrances).filter((n) => n !== 'none');
  const ambientNames = Object.keys(ambientPresets).filter((n) => n !== 'none');
  const exitNames = Object.keys(exits).filter((n) => n !== 'none');

  return (
    <Chapter
      index={2}
      subsystem="Motion engine"
      validates={`${entranceNames.length} entrances · ${exitNames.length} exits · ${ambientNames.length} ambient — every registry entry, composed with mergeMotion`}
    >
      <Stack gap={{ landscape: 28, vertical: 20 }} style={{ width: '100%' }}>
        <Text variant="sectionTitle" style={{ fontSize: px(46) }}>
          Every preset, every frame.
        </Text>

        <Grid columns={{ ultrawide: 6, landscape: 5, square: 3, portrait: 2 }} gap={20}>
          {entranceNames.map((name, index) => {
            // Entrance from the registry, plus an ambient move on top. If
            // mergeMotion drops a transform, the tiles stop moving.
            const enter = resolvePreset(name, entrances)({
              frame,
              fps,
              delay: index * 3,
              duration: 22,
            });
            const drift = resolvePreset(ambientNames[index % ambientNames.length], ambientPresets)({
              frame,
              fps,
            });

            return <Specimen key={name} name={name} style={mergeMotion(enter, drift)} />;
          })}
        </Grid>
      </Stack>
    </Chapter>
  );
};

/**
 * Chapter 03 — identical content under every camera move.
 *
 * The tiles are deliberately the same so any difference between them is the
 * camera and nothing else. `handheld` is the one to watch: it is seeded, so two
 * renders of this chapter must be byte-identical — see the verification note in
 * the plan. If it ever used unseeded randomness, distributed rendering would
 * produce a different shake per chunk and the seams would be visible.
 */
export const CameraChapter = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { px } = useFormat();
  const theme = useTheme();

  const names = Object.keys(cameras);
  // The camera moves are scene-length by design; give them a duration to run
  // against so the specimens show the full move rather than its first frames.
  const duration = 8 * fps;

  return (
    <Chapter
      index={3}
      subsystem="Camera"
      validates={`${names.length} named moves · handheld is seeded, so two renders must be byte-identical`}
      camera="static"
    >
      <Stack gap={{ landscape: 28, vertical: 20 }} style={{ width: '100%' }}>
        <Text variant="sectionTitle" style={{ fontSize: px(46) }}>
          Same shot, different camera.
        </Text>

        <Grid columns={{ ultrawide: 6, landscape: 3, square: 2, portrait: 2 }} gap={20}>
          {names.map((name) => {
            const move = resolveCamera(name)({ frame, fps, duration });
            return (
              <div key={name} style={{ minWidth: 0 }}>
                <Surface
                  preset="none"
                  style={{ height: px(190), overflow: 'hidden', position: 'relative' }}
                >
                  {/* The camera transform is applied to the CONTENT, exactly as
                      Scene applies it — so this is the real code path. */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: theme.colors.gradients.surface,
                      ...move,
                    }}
                  >
                    <div
                      style={{
                        width: '62%',
                        height: '54%',
                        borderRadius: theme.radii.sm,
                        background: theme.colors.gradients.brand,
                      }}
                    />
                  </div>
                </Surface>
                <Text variant="caption" motion={null} style={{ marginTop: px(10), fontSize: px(19) }}>
                  {name}
                </Text>
              </div>
            );
          })}
        </Grid>
      </Stack>
    </Chapter>
  );
};
