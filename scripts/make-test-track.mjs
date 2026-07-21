/**
 * Generates a synthetic click/pad track on a known grid, used as a TEST FIXTURE
 * so the musical timebase and the soundtrack edit can be verified end to end
 * without shipping a licensed piece of music.
 *
 *   node scripts/make-test-track.mjs
 *
 * Output: public/assets/music/grid-120bpm.wav — 120 BPM, 4/4, first downbeat at
 * 0s, 26s long (13 bars). Accented downbeats make splices audible, and a quiet
 * sustained pad makes crossfades audible.
 */
import fs from 'node:fs';
import path from 'node:path';

const SAMPLE_RATE = 44100;
const SECONDS = 26;
const BPM = 120;
const BEATS_PER_BAR = 4;

const beatSeconds = 60 / BPM;
const total = SAMPLE_RATE * SECONDS;
const samples = new Int16Array(total);

for (let i = 0; i < total; i += 1) {
  const t = i / SAMPLE_RATE;
  const beat = Math.floor(t / beatSeconds);
  const intoBeat = t - beat * beatSeconds;
  const isDownbeat = beat % BEATS_PER_BAR === 0;

  // Percussive click: fast-decaying sine, higher and louder on the downbeat.
  const clickFreq = isDownbeat ? 880 : 440;
  const decay = Math.exp(-intoBeat * (isDownbeat ? 14 : 22));
  const click = Math.sin(2 * Math.PI * clickFreq * intoBeat) * decay * (isDownbeat ? 0.5 : 0.28);

  // Sustained pad so a crossfade has something continuous to hold through.
  const pad =
    (Math.sin(2 * Math.PI * 110 * t) * 0.06 + Math.sin(2 * Math.PI * 164.81 * t) * 0.04) *
    (0.8 + 0.2 * Math.sin(2 * Math.PI * 0.08 * t));

  samples[i] = Math.max(-1, Math.min(1, click + pad)) * 32767 * 0.9;
}

/** Minimal 16-bit mono PCM WAV container. */
const header = Buffer.alloc(44);
const dataBytes = samples.length * 2;
header.write('RIFF', 0);
header.writeUInt32LE(36 + dataBytes, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16); // fmt chunk size
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(1, 22); // mono
header.writeUInt32LE(SAMPLE_RATE, 24);
header.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
header.writeUInt16LE(2, 32); // block align
header.writeUInt16LE(16, 34); // bits per sample
header.write('data', 36);
header.writeUInt32LE(dataBytes, 40);

const out = path.join(process.cwd(), 'public', 'assets', 'music', 'grid-120bpm.wav');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.concat([header, Buffer.from(samples.buffer)]));

console.log(`Wrote ${out} — ${SECONDS}s, ${BPM} BPM, bar = ${beatSeconds * BEATS_PER_BAR}s`);
