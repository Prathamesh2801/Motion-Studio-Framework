#!/usr/bin/env node
/**
 * spritesheet — any project composition → transparent PNG sprite sheet + JSON + preview.
 *
 *   npm run sprite -- CloudSlash-Square [--size 256] [--fps 30] [--cols N]
 *
 * Renders the `SpriteSheet` still (src/SpriteSheet.jsx): every cell is the
 * animation frozen at one frame, drawn as vectors at `size` px — not a downscale.
 * Output: out/sprites/<id>/{<id>.png, <id>.json, preview.html}
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [id, ...rest] = process.argv.slice(2);
if (!id) {
  console.error('usage: npm run sprite -- <CompositionId> [--size 256] [--fps 30] [--cols N]');
  process.exit(1);
}
const opt = (name, fallback) => {
  const i = rest.indexOf(`--${name}`);
  return i === -1 ? fallback : Number(rest[i + 1]);
};

// Call the CLI through node, not npx: on Windows npx goes via cmd, which
// splits arguments on ',' and '=' and would mangle the --props JSON.
const remotion = (args) => {
  const r = spawnSync(process.execPath, ['node_modules/@remotion/cli/remotion-cli.js', ...args], {
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'inherit'],
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
  return r.stdout;
};

// Source fps, size and length straight from the compositions table.
const row = remotion(['compositions', 'src/index.jsx']).match(
  new RegExp(`^${id}\\s+(\\d+)\\s+(\\d+)x(\\d+)\\s+(\\d+)`, 'm'),
);
if (!row) {
  console.error(`No composition "${id}". Run: npm run compositions`);
  process.exit(1);
}
const [srcFps, width, height, duration] = row.slice(1).map(Number);

const size = opt('size', 256);
const fps = opt('fps', srcFps);
const step = srcFps / fps;
const frames = Math.floor(duration / step);
const cols = opt('cols', Math.ceil(Math.sqrt(frames)));
const rows = Math.ceil(frames / cols);
const scale = size / Math.max(width, height);
const frameWidth = Math.round(width * scale);
const frameHeight = Math.round(height * scale);

const dir = join('out', 'sprites', id);
mkdirSync(dir, { recursive: true });
const png = `${id}.png`;

remotion([
  'still', 'src/index.jsx', 'SpriteSheet', join(dir, png),
  '--image-format=png', '--log=error',
  `--props=${JSON.stringify({ target: id, cols, rows, frames, step, cell: size })}`,
]);

const meta = { image: png, frameWidth, frameHeight, frames, cols, rows, fps };
writeFileSync(join(dir, `${id}.json`), JSON.stringify(meta, null, 2));

// Open in a browser to check the sheet plays back correctly.
writeFileSync(join(dir, 'preview.html'), `<!doctype html><meta charset="utf-8"><title>${id}</title>
<body style="margin:0;display:grid;place-items:center;height:100vh;background:repeating-conic-gradient(#ccc 0 25%,#fff 0 50%) 0 0/20px 20px">
<div id="s" style="width:${frameWidth}px;height:${frameHeight}px;background:url('${png}')"></div>
<script>
const m=${JSON.stringify(meta)};let f=0;
setInterval(()=>{s.style.backgroundPosition=-(f%m.cols)*m.frameWidth+'px '+-Math.floor(f/m.cols)*m.frameHeight+'px';f=(f+1)%m.frames},1000/m.fps);
</script>`);

console.log(`${join(dir, png)}  ${cols}x${rows} grid, ${frames} frames @ ${fps}fps, ${frameWidth}x${frameHeight} each`);
