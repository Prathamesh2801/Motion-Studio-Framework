import React from 'react';
import { useCurrentFrame } from 'remotion';
import {
  Scene,
  Split,
  Stack,
  animate,
  parallax,
  durations,
  stagger as staggerTokens,
  cameraTokens,
  useFormat,
  useResponsive,
  useTheme,
  alpha,
} from '@/framework';
import { Mark } from '../components/Mark.jsx';
import { MarkGrid } from '../components/MarkField.jsx';
import { ATMOSPHERE, CAMERA } from '../narrative.js';

/**
 * MOVEMENT VI — MOMENTUM (shots 11-16, 6 bars).
 *
 * ONE SHOT PER BAR. Six cuts landing exactly on six downbeats is the
 * propulsion, and it is where the bar timebase pays for itself: the cuts are
 * derived from the grid rather than dialled in by hand, so they are on the beat
 * by construction.
 *
 * ── THE RULE THIS MOVEMENT IS UNDER ─────────────────────────────────────────
 * The music is loudest here and the framework can do the most here, and those
 * two facts together are how a film like this gets ruined. Density must peak as
 * ORGANISED complexity, not as noise: if shot 16 does not resolve legibly into
 * shot 17, the movement is overbuilt.
 *
 * So each shot is ONE clear idea, composed with a different layout primitive —
 * not to exhibit the layout system, but because six identical compositions in a
 * row would flatten the acceleration into a loop.
 *
 * Everything enters fast (`durations.fast`) at `tight` stagger. A one-bar shot
 * has no room for a considered entrance.
 */

const useShot = (id) => ({ background: ATMOSPHERE[id], camera: CAMERA[id] });

/** Marks become PLANES here — the film's fourth state. Strokes are behind us. */
const PLANE = { width: 210, height: 132 };

/**
 * 11 · PLANES — strokes become surfaces.
 *
 * `Split` puts two groups in opposition across the frame, which on portrait
 * becomes a stacked column automatically. The first shot where the mark has
 * area rather than only length.
 */
export const Planes = () => {
  const { background, camera } = useShot('planes');
  const { px } = useFormat();

  const group = (tone, seedDelay) => (
    <div style={{ display: 'flex', gap: px(20), justifyContent: 'center' }}>
      {[0, 1, 2].map((i) => (
        <Mark
          key={i}
          shape="plane"
          solid
          tone={tone}
          width={PLANE.width * 0.62}
          height={PLANE.height}
          delay={seedDelay + i * staggerTokens.tight}
          duration={durations.fast}
        />
      ))}
    </div>
  );

  return (
    <Scene background={background} camera={camera}>
      <Split gap={{ landscape: 56, vertical: 34 }} align="center">
        {group('cool', 0)}
        {group('warm', staggerTokens.base)}
      </Split>
    </Scene>
  );
};

/**
 * 12 · LAYERS — depth arrives.
 *
 * Three planes at the framework's three registered parallax depths (back 0.15,
 * mid 0.4, front 0.85), each offset by its own depth. Using the SAME depth
 * constants the camera system uses means this shot's sense of space agrees with
 * every camera move in the film rather than inventing a second scale.
 */
export const Layers = () => {
  const frame = useCurrentFrame();
  const { background, camera } = useShot('layers');
  const { px } = useFormat();

  const depths = [
    cameraTokens.parallaxDepths.back,
    cameraTokens.parallaxDepths.mid,
    cameraTokens.parallaxDepths.front,
  ];

  return (
    <Scene background={background} camera={camera}>
      {/* Painted BACK TO FRONT: the largest, furthest plane first, the smallest
          and nearest last. Now that planes occlude, paint order is depth order
          — reverse it and the front plane simply covers the film. */}
      <div style={{ display: 'grid', placeItems: 'center' }}>
        {depths.map((depth, i) => {
          const fromBack = depths.length - 1 - i;
          const isFront = i === depths.length - 1;
          return (
            <div
              key={depth}
              style={{
                gridArea: '1 / 1',
                ...parallax({ frame, depth, distance: px(70), duration: 80 }),
              }}
            >
              <Mark
                shape="plane"
                solid
                tone={isFront ? 'warm' : 'cool'}
                width={PLANE.width * (1 + fromBack * 0.5)}
                height={PLANE.height * (1 + fromBack * 0.5)}
                delay={i * staggerTokens.tight}
                duration={durations.fast}
                glow={isFront ? 1 : 0.3}
              />
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

/** 13 · LATTICE — the field again, faster and wider. Pure rhythm. */
export const Lattice = () => {
  const { background, camera } = useShot('lattice');

  return (
    <Scene background={background} camera={camera}>
      <MarkGrid rows={5} columns={11} warmCell={27} step={1} height={64} gap={20} glow={0.35} />
    </Scene>
  );
};

/**
 * 14 · DEPTH — a staircase climbing away.
 *
 * Planes receding upward, each smaller and dimmer than the one in front of it,
 * so the frame reads as DISTANCE rather than as a stack. The warm plane is at
 * the far end — the idea is still up there, still the thing being built toward.
 *
 * Index 0 is the furthest rung and is painted FIRST; the near rungs paint over
 * it. The vertical offset is what keeps the warm plane visible despite being
 * behind everything: recession alone would bury it.
 */
export const Depth = () => {
  const frame = useCurrentFrame();
  const { background, camera } = useShot('depth');
  const { px } = useFormat();

  const rungs = 5;
  const advance = animate({ frame, from: 0, to: 1, duration: 80, easing: 'smooth' });

  return (
    <Scene background={background} camera={camera}>
      <div style={{ display: 'grid', placeItems: 'center' }}>
        {Array.from({ length: rungs }, (_, i) => {
          // t: 0 = furthest (small, dim, high), 1 = nearest (large, bright, low)
          const t = i / (rungs - 1);
          const rise = px(64) * (rungs - 1 - i) * (0.82 + advance * 0.18);
          // The far rung is the WARM one and must stay bright. Fading it with
          // distance like the others turned it grey — amber at low opacity over
          // near-black is just grey, and the beacon stopped being a beacon.
          const isGoal = i === 0;
          return (
            <div
              key={i}
              style={{
                gridArea: '1 / 1',
                transform: `translate3d(0, ${-rise}px, 0) scale(${0.5 + t * 0.5})`,
                opacity: isGoal ? 1 : 0.42 + t * 0.58,
              }}
            >
              <Mark
                shape="plane"
                solid
                tone={i === 0 ? 'warm' : 'cool'}
                width={PLANE.width * 1.45}
                height={PLANE.height * 0.92}
                delay={(rungs - 1 - i) * staggerTokens.tight}
                duration={durations.fast}
                glow={i === 0 ? 0.9 : 0.18}
              />
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

/**
 * 15 · TRAVERSE — lateral energy.
 *
 * A long horizontal run of planes sliding across the frame, paired with the
 * `pan` camera so the movement and the camera agree. The only shot in the film
 * with real lateral travel, and it exists to break the centre-weighted framing
 * that every other shot uses before the peak lands.
 */
export const Traverse = () => {
  const frame = useCurrentFrame();
  const { background, camera } = useShot('traverse');
  const { px } = useFormat();
  const { responsive } = useResponsive();

  const count = responsive({ landscape: 7, ultrawide: 11, vertical: 5 });
  const travel = animate({ frame, from: px(90), to: px(-90), duration: 86, easing: 'smooth' });

  return (
    <Scene background={background} camera={camera}>
      <div style={{ display: 'flex', gap: px(18), transform: `translate3d(${travel}px, 0, 0)` }}>
        {Array.from({ length: count }, (_, i) => (
          <Mark
            key={i}
            shape="plane"
            solid
            tone={i === Math.floor(count / 2) ? 'warm' : 'cool'}
            width={PLANE.width * 0.5}
            height={PLANE.height * 1.5}
            delay={i}
            duration={durations.fast}
            glow={i === Math.floor(count / 2) ? 1 : 0.25}
          />
        ))}
      </div>
    </Scene>
  );
};

/**
 * 16 · PEAK — maximum density, and the film's loudest frame.
 *
 * Everything at once: a lattice behind, a plane stack in front, warm and cool
 * fully interleaved. This is bar 24 of the score.
 *
 * ── THE MISTAKE THIS SHOT ALREADY MADE ONCE ────────────────────────────────
 * The first build superimposed the lattice and the plane row on the same
 * centre. Every layer summed with every other and the frame turned to mush —
 * the exact failure the header of this file warns about, committed in the
 * first shot that had the means to commit it.
 *
 * The fix was not more opacity tuning. It was SEPARATION: the lattice is a band
 * behind and above, the planes are a row in front and below, and the planes are
 * `solid` so they occlude rather than blend. Two elements, two places, one
 * readable frame. The next cut is a dissolve into stillness, and the peak has
 * to be legible enough for that release to read as relief rather than escape.
 *
 * ── THE LENS STREAK ──────────────────────────────────────────────────────────
 * The film's one deliberate optical artifact, earned by this being its loudest
 * frame — see the VFX research/architecture docs for why it's built here rather
 * than composited from a licensed asset, and why nowhere else in the film gets
 * one. A single stretched, heavily blurred glow, not a hard highlight, so it
 * reads as caught light rather than a UI bar. It sits as its OWN sibling next to
 * the swell-scaled content div, not inside it: a real anamorphic streak is a
 * property of the lens, which should inherit the shot's camera push like
 * everything else in frame, but shouldn't also inherit the content's own
 * independent breathing scale.
 */
export const Peak = () => {
  const frame = useCurrentFrame();
  const { background, camera } = useShot('peak');
  const { px } = useFormat();
  const { responsive } = useResponsive();
  const theme = useTheme();

  const swell = animate({ frame, from: 0.94, to: 1.03, duration: 86, easing: 'smooth' });
  // A horizontal streak is landscape-native — measured directly (isolated
  // on/off diff, both formats): the same geometry spans ~55% of frame width
  // on Landscape but ~92% on Reel, because the streak's absolute px width
  // barely differs while the frame it's crossing is half as wide. Scaled down
  // for vertical/square so the artifact stays a crossing detail rather than
  // becoming a bar spanning the whole frame.
  const streakScaleX = responsive({ landscape: 4.2, vertical: 2.5 });

  return (
    <Scene background={background} camera={camera}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: px(54),
          transform: `scale(${swell})`,
        }}
      >
        {/* The system, behind and above — everything Structure built, at speed. */}
        <div style={{ opacity: 0.62 }}>
          <MarkGrid rows={3} columns={13} step={1} height={54} gap={18} glow={0.2} />
        </div>

        {/* The objects, in front and below. Solid, so they read as things. */}
        <Stack direction="row" gap={20} justify="center" align="center" fill={false}>
          {[0, 1, 2, 3].map((i) => (
            <Mark
              key={i}
              shape="plane"
              solid
              tone={i % 2 === 0 ? 'cool' : 'warm'}
              width={PLANE.width * 0.66}
              height={PLANE.height * (0.9 + (i % 2) * 0.34)}
              delay={i * staggerTokens.tight}
              duration={durations.fast}
              glow={0.5}
            />
          ))}
        </Stack>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse ${px(230)}px ${px(17)}px at 50% 42%, ${alpha(theme.colors.primary, 0.5)} 0%, ${alpha(theme.colors.primary, 0)} 70%)`,
          transform: `scaleX(${streakScaleX}) skewX(-8deg) rotate(-3deg)`,
          filter: `blur(${px(16)}px)`,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
    </Scene>
  );
};
