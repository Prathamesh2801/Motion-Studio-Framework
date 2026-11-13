import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/**
 * Three icon animations redrawn from raw-assets/*.png. Each SVG uses the source
 * PNG's pixel space as its viewBox, so coordinates were measured straight off
 * the originals. Backgrounds stay transparent — render as ProRes 4444.
 */
export const ICON_DURATION = 120; // 4s @ 30fps

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const ease = Easing.inOut(Easing.cubic);

/** 0→1 over [start, start + length]. */
const progress = (frame, start, length, easing = ease) =>
  interpolate(frame, [start, start + length], [0, 1], { ...clamp, easing });

/** Stroke draw-on for a path with pathLength={1}. */
const drawn = (p) => ({ strokeDasharray: 1, strokeDashoffset: 1 - p });

const usePop = (start, config = { damping: 12, stiffness: 160 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - start, fps, config });
};

const Stage = ({ viewBox, shadow = true, children }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
    <svg
      viewBox={viewBox}
      style={{
        width: '78%',
        height: '78%',
        overflow: 'visible',
        filter: shadow ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.35))' : undefined,
      }}
    >
      {children}
    </svg>
  </AbsoluteFill>
);

/* ── 1. Cloud, then the slash cuts through it ───────────────────────────── */

// Starts and ends inside the slash's gap, so the path's seam is never visible.
const CLOUD =
  'M 148 247 L 100 247 A 57 57 0 1 1 122.2 137.5 A 88 88 0 1 1 297.6 140 A 57 57 0 1 1 325 247 Z';
const SLASH = { x1: 357, y1: 46, x2: 59, y2: 332 };
// Unit normal to the slash — the two halves drift apart along it after the cut.
const N = { x: 0.693, y: 0.722 };
const INNER_DOTS = [
  [128.5, 189, 10.5], [201, 124.5, 10], [297, 196, 9.5], [174, 155.5, 9.3],
  [161.5, 172.5, 8.7], [252, 197, 8.3], [284, 167, 7],
];
const RAIN = [[161, 300.5], [221, 289], [267.5, 302], [316, 288]];

const Dot = ({ cx, cy, r, start, drop = 0 }) => {
  const s = usePop(start);
  return <circle cx={cx} cy={cy - drop * (1 - s)} r={r * Math.max(0, s)} opacity={Math.min(1, s * 2)} />;
};

export const CloudSlash = () => {
  const frame = useCurrentFrame();
  const outline = progress(frame, 0, 30);
  const cut = progress(frame, 50, 16, Easing.out(Easing.cubic));
  const split = usePop(64, { damping: 10, stiffness: 120 }) * 4;

  // The slash and the gap it leaves grow together from the top-right end.
  const slashLine = (props) => (
    <line {...SLASH} pathLength={1} style={drawn(cut)} {...props} />
  );

  const cloud = (
    <g fill="white">
      <path d={CLOUD} pathLength={1} fill="none" stroke="white" strokeWidth={20} style={drawn(outline)} />
      {INNER_DOTS.map(([cx, cy, r], i) => (
        <Dot key={i} cx={cx} cy={cy} r={r} start={18 + i * 3} />
      ))}
      {RAIN.map(([cx, cy], i) => (
        <Dot key={i} cx={cx} cy={cy} r={10.5} start={30 + i * 4} drop={14} />
      ))}
    </g>
  );

  return (
    <Stage viewBox="0 0 414 383">
      <defs>
        <mask id="cut" maskUnits="userSpaceOnUse" x="-50" y="-50" width="514" height="483">
          <rect x="-50" y="-50" width="514" height="483" fill="white" />
          {slashLine({ stroke: 'black', strokeWidth: 48 })}
        </mask>
        {/* Half-planes either side of the slash line (y = 46 - 0.96(x - 357)). */}
        <clipPath id="sideA"><polygon points="-600,965 1004,-575 -600,-600" /></clipPath>
        <clipPath id="sideB"><polygon points="-600,965 1004,-575 1004,1272 -600,1272" /></clipPath>
      </defs>
      <g mask="url(#cut)">
        <g clipPath="url(#sideA)" transform={`translate(${-N.x * split} ${-N.y * split})`}>{cloud}</g>
        <g clipPath="url(#sideB)" transform={`translate(${N.x * split} ${N.y * split})`}>{cloud}</g>
      </g>
      {slashLine({ stroke: 'white', strokeWidth: 20 })}
    </Stage>
  );
};

/* ── 2. Vials, then ✕ and ✓ ─────────────────────────────────────────────── */

const Badge = ({ cx, cy, start, colors, children }) => {
  const s = usePop(start);
  const id = `badge-${colors[0].slice(1)}`;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${Math.max(0, s)})`}>
      <defs>
        <radialGradient id={id} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="100%" stopColor={colors[1]} />
        </radialGradient>
      </defs>
      <circle r={57} fill={`url(#${id})`} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))' }} />
      <g fill="none" stroke="white" strokeWidth={15} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </g>
  );
};

export const VialsVerdict = () => {
  const frame = useCurrentFrame();
  const enter = progress(frame, 0, 20, Easing.out(Easing.cubic));
  const x1 = progress(frame, 36, 8);
  const x2 = progress(frame, 42, 8);
  const tick = progress(frame, 70, 12);

  return (
    <Stage viewBox="0 0 426 377" shadow={false}>
      <image
        href={staticFile('projects/icon-animations/vials.png')}
        width={426}
        height={377}
        opacity={enter}
        transform={`translate(0 ${20 * (1 - enter)})`}
      />
      <Badge cx={141.5} cy={314} start={30} colors={['#ff4a4a', '#c80b0b']}>
        <path d="M -22 -22 L 22 22" pathLength={1} style={drawn(x1)} />
        <path d="M 22 -22 L -22 22" pathLength={1} style={drawn(x2)} />
      </Badge>
      <Badge cx={365} cy={311.5} start={64} colors={['#3fd14b', '#11891c']}>
        <path d="M -27 2 L -9 20 L 27 -19" pathLength={1} style={drawn(tick)} />
      </Badge>
    </Stage>
  );
};

/* ── 3. Bars grow, then the arrow ───────────────────────────────────────── */

const BASELINE = 334;
const BARS = [
  { x: 41, w: 67, top: 250, start: 0 },
  { x: 143, w: 67, top: 195, start: 8 },
  { x: 244, w: 65, top: 116, start: 16 },
];
// Tapered shaft, traced from the source: upper edge out, lower edge back.
const SHAFT =
  'M 14 219 L 40 209 L 60 199 L 80 188 L 100 176 L 120 163 L 140 149 L 160 134 L 180 116 ' +
  'L 200 96 L 225 68 L 252 40 L 278 63 L 260 76 L 250 87 L 240 98 L 230 107 L 220 116 ' +
  'L 200 133 L 180 148 L 160 161 L 140 173 L 120 184 L 100 193 L 80 201 L 60 208 L 40 215 L 20 221 Z';
const SPINE = 'M 8 220 L 60 203 L 100 184 L 140 161 L 180 132 L 210 104 L 240 74 L 272 46';
const HEAD = 'M 216 21 L 284 4 L 307 76 L 277 61 Z';

export const ChartArrow = () => {
  const frame = useCurrentFrame();
  const shaft = progress(frame, 36, 28, Easing.inOut(Easing.quad));
  const head = usePop(60, { damping: 11, stiffness: 180 });

  return (
    <Stage viewBox="0 0 340 355">
      <defs>
        <mask id="shaft" maskUnits="userSpaceOnUse" x="-20" y="-20" width="380" height="395">
          <path d={SPINE} pathLength={1} fill="none" stroke="white" strokeWidth={70} style={drawn(shaft)} />
        </mask>
      </defs>
      <g fill="white">
        {BARS.map(({ x, w, top, start }, i) => {
          const h = (BASELINE - top) * usePop(start, { damping: 14, stiffness: 110 });
          return <rect key={i} x={x} y={BASELINE - h} width={w} height={Math.max(0, h)} />;
        })}
        <path d={SHAFT} mask="url(#shaft)" />
        {/* The head grows out of its base, where the shaft enters it. */}
        <g transform={`translate(265 50) scale(${Math.max(0, head)}) translate(-265 -50)`}>
          <path d={HEAD} />
        </g>
      </g>
    </Stage>
  );
};
