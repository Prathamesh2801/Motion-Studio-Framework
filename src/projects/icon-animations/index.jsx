import React, { useId, useState } from 'react';
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/**
 * Icon animations redrawn from raw-assets/*.png. Each SVG uses the source
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

// SVG ids are document-global; a unique prefix keeps several instances on one
// page (e.g. a sprite sheet) from all using the first instance's mask.
const useUid = () => useId().replace(/:/g, '');

/**
 * SVG <image> that holds the frame until the picture has loaded. Remotion only
 * waits for media it knows about (e.g. <Img>), not raw SVG images — without
 * this a frame can be captured before the PNG arrives and come out blank.
 */
const SvgImage = (props) => {
  const [handle] = useState(() => delayRender(`Loading ${props.href}`));
  return (
    <image
      {...props}
      onLoad={() => continueRender(handle)}
      onError={() => cancelRender(new Error(`Could not load ${props.href}`))}
    />
  );
};

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
  const u = useUid();
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
        <mask id={`${u}cut`} maskUnits="userSpaceOnUse" x="-50" y="-50" width="514" height="483">
          <rect x="-50" y="-50" width="514" height="483" fill="white" />
          {slashLine({ stroke: 'black', strokeWidth: 48 })}
        </mask>
        {/* Half-planes either side of the slash line (y = 46 - 0.96(x - 357)). */}
        <clipPath id={`${u}A`}><polygon points="-600,965 1004,-575 -600,-600" /></clipPath>
        <clipPath id={`${u}B`}><polygon points="-600,965 1004,-575 1004,1272 -600,1272" /></clipPath>
      </defs>
      <g mask={`url(#${u}cut)`}>
        <g clipPath={`url(#${u}A)`} transform={`translate(${-N.x * split} ${-N.y * split})`}>{cloud}</g>
        <g clipPath={`url(#${u}B)`} transform={`translate(${N.x * split} ${N.y * split})`}>{cloud}</g>
      </g>
      {slashLine({ stroke: 'white', strokeWidth: 20 })}
    </Stage>
  );
};

/* ── 2. Vials, then ✕ and ✓ ─────────────────────────────────────────────── */

const Badge = ({ cx, cy, start, colors, children }) => {
  const s = usePop(start);
  const id = `${useUid()}badge`;
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
      <SvgImage
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
  const u = useUid();
  const shaft = progress(frame, 36, 28, Easing.inOut(Easing.quad));
  const head = usePop(60, { damping: 11, stiffness: 180 });

  return (
    <Stage viewBox="0 0 340 355">
      <defs>
        <mask id={`${u}shaft`} maskUnits="userSpaceOnUse" x="-20" y="-20" width="380" height="395">
          <path d={SPINE} pathLength={1} fill="none" stroke="white" strokeWidth={70} style={drawn(shaft)} />
        </mask>
      </defs>
      <g fill="white">
        {BARS.map(({ x, w, top, start }, i) => {
          const h = (BASELINE - top) * usePop(start, { damping: 14, stiffness: 110 });
          return <rect key={i} x={x} y={BASELINE - h} width={w} height={Math.max(0, h)} />;
        })}
        <path d={SHAFT} mask={`url(#${u}shaft)`} />
        {/* The head grows out of its base, where the shaft enters it. */}
        <g transform={`translate(265 50) scale(${Math.max(0, head)}) translate(-265 -50)`}>
          <path d={HEAD} />
        </g>
      </g>
    </Stage>
  );
};

/* ── 4. Document, then the verified seal ────────────────────────────────── */

const DOC =
  'M 704 299 L 397 299 A 58 58 0 0 0 339 357 L 339 831 A 58 58 0 0 0 397 889 ' +
  'L 805 889 A 58 58 0 0 0 862.5 831 L 862.5 471 Z';
const FOLD = 'M 703.5 299 L 703.5 471.5 L 862.5 471.5';
const DOC_LINES = [[434.5, 622], [535, 697], [631.5, 607], [734, 556]]; // y, right end
const SEAL = { cx: 769, cy: 786.5, r: 161 };
const DOC_TICK = 'M 695 784 L 753 843 L 852 737';

/** Draw-on that also hides the round-cap dot a zero-length dash leaves behind. */
const drawnRound = (p) => ({ ...drawn(p), opacity: p > 0 ? 1 : 0 });

export const DocVerified = () => {
  const frame = useCurrentFrame();
  const u = useUid();
  const outline = progress(frame, 0, 30);
  const fold = progress(frame, 24, 12);
  const seal = Math.max(0, usePop(64));
  const ring = progress(frame, 64, 18);
  const tick = progress(frame, 78, 12);
  const stroke = { fill: 'none', stroke: 'white', strokeWidth: 38, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const around = (s) => `translate(${SEAL.cx} ${SEAL.cy}) scale(${s}) translate(${-SEAL.cx} ${-SEAL.cy})`;

  return (
    <Stage viewBox="290 250 690 750">
      <defs>
        {/* The seal hides the page beneath it as it grows — never before it exists. */}
        <mask id={`${u}seal`} maskUnits="userSpaceOnUse" x="250" y="200" width="800" height="850">
          <rect x="250" y="200" width="800" height="850" fill="white" />
          <circle cx={SEAL.cx} cy={SEAL.cy} r={145 * seal} fill="black" />
        </mask>
      </defs>
      <g mask={`url(#${u}seal)`} {...stroke}>
        <path d={DOC} pathLength={1} style={drawnRound(outline)} />
        <path d={FOLD} pathLength={1} style={drawnRound(fold)} />
        {DOC_LINES.map(([y, x2], i) => (
          <path
            key={i}
            d={`M 429 ${y} L ${x2} ${y}`}
            pathLength={1}
            style={drawnRound(progress(frame, 34 + i * 6, 12))}
          />
        ))}
      </g>
      <g {...stroke} transform={around(seal)}>
        <circle
          cx={SEAL.cx}
          cy={SEAL.cy}
          r={SEAL.r}
          strokeWidth={37}
          pathLength={1}
          transform={`rotate(-90 ${SEAL.cx} ${SEAL.cy})`}
          style={drawnRound(ring)}
        />
        <path d={DOC_TICK} pathLength={1} style={drawnRound(tick)} />
      </g>
    </Stage>
  );
};

/* ── 5. Neon cylinder, right angle, 90 ──────────────────────────────────── */

const NEON = '#7fd6ff';
const CYL = { cx: 538, rx: 462, top: 148.5, topRy: 106, bottom: 997, bottomRy: 89 };
const L = CYL.cx - CYL.rx;
const R = CYL.cx + CYL.rx;
const ellipse = (cy, ry) => `M ${L} ${cy} A ${CYL.rx} ${ry} 0 1 1 ${R} ${cy} A ${CYL.rx} ${ry} 0 1 1 ${L} ${cy}`;
const BODY =
  `M ${L} ${CYL.top} L ${L} ${CYL.bottom} A ${CYL.rx} ${CYL.bottomRy} 0 0 0 ${R} ${CYL.bottom} ` +
  `L ${R} ${CYL.top} A ${CYL.rx} ${CYL.topRy} 0 0 1 ${L} ${CYL.top} Z`;
// Dashed quarter-arc of the right-angle marker, centred on its corner.
const ARC_C = { x: 1010, y: 1019, r: 170 };
const arcPoint = (deg) => {
  const t = (deg * Math.PI) / 180;
  return `${ARC_C.x + ARC_C.r * Math.cos(t)} ${ARC_C.y + ARC_C.r * Math.sin(t)}`;
};
const ANGLE_ARC = `M ${arcPoint(-80)} A ${ARC_C.r} ${ARC_C.r} 0 0 1 ${arcPoint(-3)}`;

export const Cylinder90 = () => {
  const frame = useCurrentFrame();
  const u = useUid();
  const rims = progress(frame, 0, 26);
  const sides = progress(frame, 10, 22);
  const glass = progress(frame, 24, 20);
  const marker = progress(frame, 40, 16);
  const foot = progress(frame, 54, 10);
  const notch = progress(frame, 60, 6);
  const arc = progress(frame, 62, 18);
  const label = Math.max(0, usePop(66));
  const count = Math.round(90 * progress(frame, 66, 30, Easing.out(Easing.cubic)));
  const neon = {
    fill: 'none',
    stroke: NEON,
    strokeWidth: 9,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    filter: `url(#${u}glow)`,
  };

  return (
    <Stage viewBox="40 0 1320 1124" shadow={false}>
      <defs>
        <filter id={`${u}glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="near" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="far" />
          <feMerge>
            <feMergeNode in="far" />
            <feMergeNode in="near" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`${u}body`} x1="0" x2="1">
          <stop offset="0" stopColor={NEON} stopOpacity="0.45" />
          {/* the glass highlight down the inside of the left wall */}
          <stop offset="0.07" stopColor="#e6f7ff" stopOpacity="0.7" />
          <stop offset="0.18" stopColor={NEON} stopOpacity="0.12" />
          <stop offset="0.82" stopColor={NEON} stopOpacity="0.12" />
          <stop offset="1" stopColor={NEON} stopOpacity="0.45" />
        </linearGradient>
        <radialGradient id={`${u}pool`}>
          <stop offset="0" stopColor="#3fb6ff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#0a63d8" stopOpacity="0.9" />
        </radialGradient>
        <mask id={`${u}arc`} maskUnits="userSpaceOnUse" x="900" y="800" width="400" height="300">
          <path d={ANGLE_ARC} pathLength={1} fill="none" stroke="white" strokeWidth={30} style={drawn(arc)} />
        </mask>
      </defs>

      <g opacity={glass}>
        <path d={BODY} fill={`url(#${u}body)`} />
        <ellipse cx={CYL.cx} cy={CYL.bottom - 4} rx={CYL.rx - 22} ry={CYL.bottomRy - 14} fill={`url(#${u}pool)`} />
      </g>

      <g {...neon}>
        <path d={ellipse(CYL.top, CYL.topRy)} pathLength={1} style={drawn(rims)} />
        <path d={ellipse(CYL.bottom, CYL.bottomRy)} pathLength={1} style={drawn(rims)} />
        <path d={`M ${L} ${CYL.top} L ${L} ${CYL.bottom}`} pathLength={1} style={drawn(sides)} />
        <path d={`M ${R} ${CYL.top} L ${R} ${CYL.bottom}`} pathLength={1} style={drawn(sides)} />
        <path d="M 1000 140 L 1010 140 L 1010 1019" pathLength={1} style={drawn(marker)} />
        <path d="M 1010 1019 L 1272 1019" pathLength={1} style={drawn(foot)} />
        <path d="M 1010 857 L 1034 857" pathLength={1} style={drawn(notch)} />
        <path d={ANGLE_ARC} strokeDasharray="16 13" mask={`url(#${u}arc)`} />
      </g>

      <g
        opacity={Math.min(1, label * 1.5)}
        transform={`translate(1194 770) scale(${0.6 + 0.4 * label}) translate(-1194 -770)`}
      >
        <text
          x={1194}
          y={858}
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight={700}
          fontSize={240}
          fill="#0b2a5e"
          stroke={NEON}
          strokeWidth={8}
          paintOrder="stroke"
          filter={`url(#${u}glow)`}
        >
          {count}
        </text>
      </g>
    </Stage>
  );
};

/* ── 6. Disc, then the droplets bead up ─────────────────────────────────── */

// Measured on raw-assets/2 Icons.png (copied to disc.png); disc-clean.png has
// them painted out. Each droplet is cut from disc.png with a soft elliptical mask.
const DROPLETS = [
  { cx: 271.5, cy: 96, rx: 17, ry: 17 },
  { cx: 233, cy: 140.5, rx: 20, ry: 23.5 },
  { cx: 197, cy: 196.5, rx: 25, ry: 26.5 },
  { cx: 149, cy: 277, rx: 31, ry: 35 },
];

const Droplet = ({ d, i, u, start }) => {
  const k = Math.max(0, usePop(start, { damping: 7, stiffness: 140 }));
  // Squash-and-stretch: wider than tall on the overshoot, like a bead settling.
  return (
    <g transform={`translate(${d.cx} ${d.cy}) scale(${k} ${k * (2 - k)}) translate(${-d.cx} ${-d.cy})`}>
      <mask id={`${u}d${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width="447" height="401">
        <ellipse cx={d.cx - 1} cy={d.cy + 1} rx={d.rx + 5} ry={d.ry + 5} fill="white" filter={`url(#${u}soft)`} />
      </mask>
      <SvgImage href={staticFile('projects/icon-animations/disc.png')} width={447} height={401} mask={`url(#${u}d${i})`} />
    </g>
  );
};

export const DropletBeads = () => {
  const u = useUid();
  const disc = usePop(0, { damping: 14, stiffness: 120 });

  return (
    <Stage viewBox="0 0 447 401" shadow={false}>
      <defs>
        <filter id={`${u}soft`}>
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <g
        opacity={Math.min(1, disc * 1.4)}
        transform={`translate(212 203) scale(${0.85 + 0.15 * disc}) translate(-212 -203)`}
      >
        <SvgImage href={staticFile('projects/icon-animations/disc-clean.png')} width={447} height={401} />
        {DROPLETS.map((d, i) => (
          <Droplet key={i} d={d} i={i} u={u} start={30 + i * 14} />
        ))}
      </g>
    </Stage>
  );
};

/* ── 7. Two vials, then the caps seal on ────────────────────────────────── */

// Each cap is cut from vials-duo.png along its bottom edge — an ellipse arc
// fitted to the source (centre, radii). `neck` is the glass lip it lands on.
const VIAL_W = 1254;
const VIALS = [
  { cap: { cx: 345, cy: 377, rx: 241, ry: 88 }, x0: 100, x1: 600, neck: { cx: 349, cy: 440, rx: 172 }, start: 0, drop: 26 },
  { cap: { cx: 912, cy: 452, rx: 232, ry: 56 }, x0: 670, x1: 1160, neck: { cx: 916, cy: 488, rx: 167 }, start: 6, drop: 52 },
];
const LIFT = 300;

/** Everything above the cap's bottom arc, within its vial's column. */
const capRegion = ({ cap: c, x0, x1 }) =>
  `M ${x0} 0 L ${x1} 0 L ${x1} ${c.cy} L ${c.cx + c.rx} ${c.cy} ` +
  `A ${c.rx} ${c.ry} 0 0 1 ${c.cx - c.rx} ${c.cy} L ${x0} ${c.cy} Z`;

export const VialsSealed = () => {
  const frame = useCurrentFrame();
  const u = useUid();
  const src = staticFile('projects/icon-animations/vials-duo.png');

  return (
    <Stage viewBox="80 60 1100 1120" shadow={false}>
      <defs>
        <mask id={`${u}bodies`} maskUnits="userSpaceOnUse" x="0" y="0" width={VIAL_W} height={VIAL_W}>
          <rect width={VIAL_W} height={VIAL_W} fill="white" />
          {VIALS.map((v, i) => <path key={i} d={capRegion(v)} fill="black" />)}
        </mask>
        {VIALS.map((v, i) => (
          <React.Fragment key={i}>
            <mask id={`${u}cap${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width={VIAL_W} height={VIAL_W}>
              <path d={capRegion(v)} fill="white" />
            </mask>
            <clipPath id={`${u}col${i}`}>
              <rect x={v.x0} y={0} width={v.x1 - v.x0} height={VIAL_W} />
            </clipPath>
          </React.Fragment>
        ))}
      </defs>

      {VIALS.map((v, i) => {
        const rise = progress(frame, v.start, 22, Easing.out(Easing.cubic));
        // Easing.bounce settles at 1 from below, so the cap bounces on the neck
        // instead of overshooting into the glass.
        const fall = progress(frame, v.drop, 24, Easing.bounce);
        const shown = progress(frame, v.drop, 5);
        return (
          <g key={i}>
            <g opacity={rise} transform={`translate(0 ${50 * (1 - rise)})`}>
              <g clipPath={`url(#${u}col${i})`}>
                <SvgImage href={src} width={VIAL_W} height={VIAL_W} mask={`url(#${u}bodies)`} />
              </g>
              {/* the open neck's glass lip — gone once the cap lands */}
              <ellipse
                cx={v.neck.cx} cy={v.neck.cy} rx={v.neck.rx} ry={16}
                fill="none" stroke="white" strokeOpacity={0.55} strokeWidth={6}
                opacity={1 - fall}
              />
            </g>
            <g opacity={shown} transform={`translate(0 ${-LIFT * (1 - fall)})`}>
              <SvgImage href={src} width={VIAL_W} height={VIAL_W} mask={`url(#${u}cap${i})`} />
            </g>
          </g>
        );
      })}
    </Stage>
  );
};

/* ── 8. Four vials rise like a bar chart ────────────────────────────────── */

// Column boundaries sit in the gaps between vials; FLOOR is just below their bases.
const FOUR = { w: 1331, h: 1182, floor: 1160 };
const FOUR_COLS = [[0, 323, 472], [323, 618, 378], [618, 929, 285], [929, 1331, 29]]; // x0, x1, top

export const FourVialsRise = () => {
  const u = useUid();
  const src = staticFile('projects/icon-animations/four-vials.png');

  return (
    <Stage viewBox="40 0 1250 1182" shadow={false}>
      <defs>
        {FOUR_COLS.map(([x0, x1], i) => (
          <clipPath key={i} id={`${u}c${i}`}>
            <rect x={x0} y={0} width={x1 - x0} height={FOUR.floor} />
          </clipPath>
        ))}
      </defs>
      {FOUR_COLS.map(([, , top], i) => (
        <Riser key={i} clip={`url(#${u}c${i})`} start={i * 9} height={FOUR.floor - top} src={src} />
      ))}
    </Stage>
  );
};

/** One vial column emerging from the floor line, settling with a little spring. */
const Riser = ({ clip, start, height, src }) => {
  const s = usePop(start, { damping: 13, stiffness: 120 });
  return (
    <g clipPath={clip}>
      <SvgImage href={src} width={FOUR.w} height={FOUR.h} transform={`translate(0 ${(height + 20) * (1 - s)})`} />
    </g>
  );
};

/* ── 9. Dispensers lower, then pour into the vials ──────────────────────── */

// dispensers-clean.png has the streams painted out (rims rebuilt underneath);
// dispensers-streams.png holds just the streams. NOZZLE splits dispensers from vials.
const DISP = { w: 1268, h: 1241, nozzle: 462, pourTop: 455, pourBottom: 630 };
const DISP_COLS = [[0, 470], [470, 815], [815, 1268]];

export const DispenserPour = () => {
  const frame = useCurrentFrame();
  const u = useUid();
  const clean = staticFile('projects/icon-animations/dispensers-clean.png');
  const streams = staticFile('projects/icon-animations/dispensers-streams.png');
  const img = (href) => <SvgImage href={href} width={DISP.w} height={DISP.h} />;

  return (
    <Stage viewBox="120 30 1030 1180" shadow={false}>
      <defs>
        {DISP_COLS.map(([x0, x1], i) => (
          <React.Fragment key={i}>
            <clipPath id={`${u}top${i}`}>
              <rect x={x0} y={0} width={x1 - x0} height={DISP.nozzle} />
            </clipPath>
            <clipPath id={`${u}bot${i}`}>
              <rect x={x0} y={DISP.nozzle} width={x1 - x0} height={DISP.h - DISP.nozzle} />
            </clipPath>
            {/* the stream grows down from the nozzle */}
            <clipPath id={`${u}pour${i}`}>
              <rect
                x={x0}
                y={DISP.pourTop}
                width={x1 - x0}
                height={(DISP.pourBottom - DISP.pourTop) * progress(frame, 44 + i * 12, 12, Easing.in(Easing.quad))}
              />
            </clipPath>
          </React.Fragment>
        ))}
      </defs>

      {DISP_COLS.map((_, i) => {
        const rise = progress(frame, i * 4, 22, Easing.out(Easing.cubic));
        const lower = progress(frame, 12 + i * 4, 24, Easing.out(Easing.back(1.2)));
        return (
          <g key={i}>
            <g clipPath={`url(#${u}bot${i})`} opacity={rise}>
              <g transform={`translate(0 ${60 * (1 - rise)})`}>{img(clean)}</g>
            </g>
            <g clipPath={`url(#${u}pour${i})`}>{img(streams)}</g>
            <g clipPath={`url(#${u}top${i})`} opacity={Math.min(1, lower * 1.5)}>
              <g transform={`translate(0 ${-140 * (1 - lower)})`}>{img(clean)}</g>
            </g>
          </g>
        );
      })}
    </Stage>
  );
};

/* ── 10. Horizontal vial, then the cap slides on ────────────────────────── */

// The cap is cut along its collar's curved left edge (an ellipse arc fitted to
// the source); above and below the collar the cut runs straight down at CAPH.cx.
const CAPH = { w: 2106, h: 747, cx: 1622, cy: 392, rx: 121, ry: 205 };
const CAPH_REGION =
  `M ${CAPH.w} 0 L ${CAPH.cx} 0 L ${CAPH.cx} ${CAPH.cy - CAPH.ry} ` +
  `A ${CAPH.rx} ${CAPH.ry} 0 0 0 ${CAPH.cx} ${CAPH.cy + CAPH.ry} ` +
  `L ${CAPH.cx} ${CAPH.h} L ${CAPH.w} ${CAPH.h} Z`;

export const VialCapSlide = () => {
  const frame = useCurrentFrame();
  const u = useUid();
  const src = staticFile('projects/icon-animations/vial-capped.png');
  const enter = progress(frame, 0, 24, Easing.out(Easing.cubic));
  const slide = progress(frame, 30, 26, Easing.bounce);
  const shown = progress(frame, 30, 6);
  const img = <SvgImage href={src} width={CAPH.w} height={CAPH.h} />;

  return (
    <Stage viewBox="110 60 1880 640" shadow={false}>
      <defs>
        <mask id={`${u}body`} maskUnits="userSpaceOnUse" x="0" y="0" width={CAPH.w} height={CAPH.h}>
          <rect width={CAPH.w} height={CAPH.h} fill="white" />
          <path d={CAPH_REGION} fill="black" />
        </mask>
        <mask id={`${u}cap`} maskUnits="userSpaceOnUse" x="0" y="0" width={CAPH.w} height={CAPH.h}>
          <path d={CAPH_REGION} fill="white" />
        </mask>
      </defs>
      <g opacity={enter} transform={`translate(${-160 * (1 - enter)} 0)`}>
        <g mask={`url(#${u}body)`}>{img}</g>
        {/* the open neck's glass lip — gone once the cap is on */}
        <ellipse
          cx={CAPH.cx - 14} cy={CAPH.cy} rx={22} ry={CAPH.ry - 12}
          fill="none" stroke="white" strokeOpacity={0.5} strokeWidth={6}
          opacity={1 - slide}
        />
      </g>
      <g opacity={shown} transform={`translate(${520 * (1 - slide)} 0)`}>
        <g mask={`url(#${u}cap)`}>{img}</g>
      </g>
    </Stage>
  );
};
