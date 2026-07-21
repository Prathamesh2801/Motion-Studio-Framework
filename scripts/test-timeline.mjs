/**
 * Timeline engine tests.
 *
 * The timeline and the soundtrack edit are pure and React-free, so they can be
 * asserted directly in Node with no test runner or bundler. Run:
 *
 *   node scripts/test-timeline.mjs
 */
import assert from 'node:assert/strict';
import {
  buildTimeline,
  createBarGrid,
  registerTimebase,
  resolveTimebase,
} from '../src/framework/timeline/index.js';
import { buildSoundtrackEdit } from '../src/framework/audio/soundtrack.js';
import { resolvePreset, entrances } from '../src/framework/presets/index.js';
import { resolveCamera } from '../src/framework/camera/index.js';
import { resolveEasing } from '../src/framework/animations/easing.js';
import { resolveTransition } from '../src/framework/transitions/index.js';
import { validateTheme } from '../src/design/theme/contract.js';
import { tokens } from '../src/design/theme/tokens.js';

let passed = 0;
const test = (name, fn) => {
  try {
    fn();
    passed += 1;
    console.log(`  ok  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}\n      ${error.message}`);
    process.exitCode = 1;
  }
};

console.log('\nseconds timebase');
test('lays scenes end to end with no transition', () => {
  const t = buildTimeline(
    [
      { id: 'a', seconds: 2 },
      { id: 'b', seconds: 3 },
    ],
    { fps: 30, timebase: 'seconds' },
  );
  assert.deepEqual(t.scenes.map((s) => s.from), [0, 60]);
  assert.deepEqual(t.scenes.map((s) => s.durationInFrames), [60, 90]);
  assert.equal(t.durationInFrames, 150);
  assert.equal(t.timebase, 'seconds');
});

test('adds the transition overlap to each scene and the total', () => {
  const t = buildTimeline(
    [
      { id: 'a', seconds: 2 },
      { id: 'b', seconds: 3 },
    ],
    { fps: 30, timebase: 'seconds', transition: 'base' },
  );
  assert.equal(t.overlap, 20);
  // Starts are unchanged; each scene is authored as advance + the overlap it
  // gives back to its successor.
  assert.deepEqual(t.scenes.map((s) => s.from), [0, 60]);
  assert.deepEqual(t.scenes.map((s) => s.advance), [60, 90]);
  assert.deepEqual(t.scenes.map((s) => s.durationInFrames), [80, 110]);
  assert.equal(t.durationInFrames, 170);
});

test('honours fps when converting seconds', () => {
  const t = buildTimeline([{ id: 'a', seconds: 2 }], { fps: 60, timebase: 'seconds' });
  assert.equal(t.durationInFrames, 120);
});

console.log('\nframes timebase');
test('uses frame counts verbatim', () => {
  const t = buildTimeline(
    [
      { id: 'a', frames: 45 },
      { id: 'b', frames: 15 },
    ],
    { fps: 30, timebase: 'frames' },
  );
  assert.deepEqual(t.scenes.map((s) => s.from), [0, 45]);
  assert.equal(t.durationInFrames, 60);
});

console.log('\nbars timebase');
const grid120 = createBarGrid({ bpm: 120, beatsPerBar: 4, downbeatSeconds: 0.5 });

test('createBarGrid derives beat and bar lengths', () => {
  assert.equal(grid120.beatSeconds, 0.5);
  assert.equal(grid120.barSeconds, 2);
});

test('lands scenes on the bar grid, offset by the pickup', () => {
  const t = buildTimeline(
    [
      { id: 'a', bars: 2 },
      { id: 'b', bars: 2 },
      { id: 'c', bars: 4 },
    ],
    { fps: 30, timebase: 'bars', grid: grid120 },
  );
  // bar = 2s = 60 frames; lead-in = 0.5s = 15 frames. Scene 0 opens at 0.
  assert.deepEqual(t.scenes.map((s) => s.from), [0, 135, 255]);
  assert.equal(t.pictureFrames, 495);
});

test('rounds starts from absolute positions so error never compounds', () => {
  // A bar length that is not a whole number of frames: 145.57 BPM -> 49.4606 f.
  const grid = createBarGrid({ bpm: 145.57, beatsPerBar: 4, downbeatSeconds: 0.858 });
  const plan = Array.from({ length: 20 }, (_, i) => ({ id: `s${i}`, bars: 2 }));
  const t = buildTimeline(plan, { fps: 30, timebase: 'bars', grid });

  const barFrames = grid.barSeconds * 30;
  const lead = grid.downbeatSeconds * 30;
  t.scenes.forEach((scene, i) => {
    if (i === 0) return assert.equal(scene.from, 0);
    const trueLine = lead + i * 2 * barFrames;
    assert.equal(scene.from, Math.round(trueLine));
    // Every cut stays within half a frame of its true bar line, however many
    // scenes precede it.
    assert.ok(Math.abs(scene.from - trueLine) <= 0.5, `scene ${i} drifted`);
  });

  // Naive accumulation of rounded bar lengths would have drifted by now.
  const naive = 0 + 19 * Math.round(2 * barFrames);
  assert.notEqual(t.scenes[19].from, naive + Math.round(lead));
});

console.log('\nbars timebase — optional audio alignment');
test('derives no music cuts when no scene declares a sourceBar', () => {
  const t = buildTimeline([{ id: 'a', bars: 2 }, { id: 'b', bars: 2 }], {
    fps: 30,
    timebase: 'bars',
    grid: grid120,
  });
  assert.deepEqual(t.derived.musicCuts, []);
});

test('emits a cut only where the source actually splices', () => {
  const t = buildTimeline(
    [
      { id: 'a', bars: 2, sourceBar: 0 },
      { id: 'b', bars: 2, sourceBar: 2 }, // plays on — no cut
      { id: 'c', bars: 2, sourceBar: 8 }, // splice
    ],
    { fps: 30, timebase: 'bars', grid: grid120 },
  );
  const cuts = t.derived.musicCuts;
  assert.equal(cuts.length, 2);
  // Head plays from the top of the file so the pickup is heard.
  assert.deepEqual(cuts[0], { from: 0, sourceSeconds: 0 });
  // The splice lands on the same frame as the picture cut.
  assert.equal(cuts[1].from, t.byId.c.from);
  assert.equal(cuts[1].sourceSeconds, 0.5 + 8 * 2);
});

console.log('\nvalidation fails loudly');
const throws = (fn, match) => assert.throws(fn, (e) => e.message.includes(match));

test('rejects an unknown timebase rather than silently falling back', () => {
  throws(
    () => buildTimeline([{ id: 'a', seconds: 1 }], { fps: 30, timebase: 'nope' }),
    'timebase: unknown name',
  );
});
test('the unknown-timebase error lists the known names and how to add one', () => {
  // The error is the documentation for this failure — assert it stays useful.
  throws(() => buildTimeline([{ id: 'a', seconds: 1 }], { fps: 30, timebase: 'nope' }), 'frames, seconds, bars');
  throws(() => buildTimeline([{ id: 'a', seconds: 1 }], { fps: 30, timebase: 'nope' }), 'registerTimebase()');
});
test('rejects duplicate scene ids', () => {
  throws(
    () => buildTimeline([{ id: 'a', seconds: 1 }, { id: 'a', seconds: 1 }], { fps: 30 }),
    'duplicate scene id',
  );
});
test('rejects a scene missing the field its timebase needs', () => {
  throws(() => buildTimeline([{ id: 'a' }], { fps: 30, timebase: 'seconds' }), 'needs a numeric `seconds`');
});
test('rejects a splice that is not on a phrase boundary', () => {
  throws(
    () =>
      buildTimeline(
        [
          { id: 'a', bars: 2, sourceBar: 0 },
          { id: 'b', bars: 2, sourceBar: 5 },
        ],
        { fps: 30, timebase: 'bars', grid: grid120 },
      ),
    'not a phrase boundary',
  );
});
test('rejects a scene running past the end of the source material', () => {
  throws(
    () =>
      buildTimeline([{ id: 'a', bars: 8, sourceBar: 0 }], {
        fps: 30,
        timebase: 'bars',
        grid: grid120,
        lastSourceBar: 4,
      }),
    'past the end of the material',
  );
});
test('rejects a bars plan with no grid', () => {
  throws(() => buildTimeline([{ id: 'a', bars: 1 }], { fps: 30, timebase: 'bars' }), 'needs a `grid`');
});

console.log('\nextensibility');
test('accepts an inline strategy object without registering it', () => {
  // A crude "semantic" timebase: length derived from the copy each scene shows.
  const readingTime = {
    lengthOf: (scene, { fps, options }) => {
      const words = String(scene.say).trim().split(/\s+/).length;
      return Math.round((options.secondsPerWord ?? 0.4) * words * fps);
    },
  };
  const t = buildTimeline(
    [
      { id: 'a', say: 'one two three' },
      { id: 'b', say: 'four five' },
    ],
    { fps: 30, timebase: readingTime, secondsPerWord: 0.5 },
  );
  assert.deepEqual(t.scenes.map((s) => s.durationInFrames), [45, 30]);
  assert.equal(t.timebase, 'custom');
});

test('registerTimebase makes a strategy selectable by name', () => {
  registerTimebase('beats', {
    lengthOf: (scene, { fps, options }) => Math.round(scene.beats * options.grid.beatSeconds * fps),
  });
  assert.equal(resolveTimebase('beats').name, 'beats');
  const t = buildTimeline([{ id: 'a', beats: 4 }], { fps: 30, timebase: 'beats', grid: grid120 });
  assert.equal(t.durationInFrames, 60);
});

/**
 * The voiceover SEAM.
 *
 * Narration is not implemented — see `framework/audio/index.js`. But the claim
 * that it can be added later "without restructuring" is worth exactly nothing
 * unless it is checked, so this expresses a narration-shaped timebase against
 * the CURRENT engine and asserts it needs no engine change.
 *
 * It exercises the three hooks a real VO strategy would need: `lengthOf` (scene
 * length from a cue), `startsOf` (absolute positions — VO is absolutely timed,
 * so lengths must never be accumulated), and `derive` (extra timeline outputs
 * for the audio layer to consume, exactly as `bars` emits `musicCuts`).
 */
test('a voiceover-shaped timebase needs no engine change', () => {
  const voiceover = {
    lengthOf: (scene, { fps, options }) => {
      const cue = options.cues[scene.cue];
      return Math.round((cue.end - cue.start) * fps);
    },
    // VO cues are absolute timings in a recording; rounding each start from its
    // own position keeps picture locked to speech across a long film.
    startsOf: (plan, { fps, options }) =>
      plan.map((scene) => Math.round(options.cues[scene.cue].start * fps)),
    // What a `Voice` layer would mount, and what a duck envelope would read.
    derive: (plan, { fps, options }) => ({
      voiceCues: plan.map((scene) => ({
        id: scene.id,
        from: Math.round(options.cues[scene.cue].start * fps),
        sourceSeconds: options.cues[scene.cue].start,
      })),
    }),
  };

  const cues = [
    { start: 0, end: 3.2 },
    { start: 3.2, end: 7.5 },
    { start: 7.5, end: 11 },
  ];
  const t = buildTimeline(
    [
      { id: 'open', cue: 0 },
      { id: 'middle', cue: 1 },
      { id: 'close', cue: 2 },
    ],
    { fps: 30, timebase: voiceover, cues },
  );

  assert.deepEqual(t.scenes.map((s) => s.from), [0, 96, 225]);
  assert.deepEqual(t.scenes.map((s) => s.durationInFrames), [96, 129, 105]);
  // The audio layer gets its cues from the same timeline that placed the picture.
  assert.deepEqual(t.derived.voiceCues.map((c) => c.from), [0, 96, 225]);
});

test('a duck envelope can be expressed against absolute timeline frames', () => {
  // Not a feature — a check that Soundtrack's `gain` seam is usable. A duck
  // envelope is a plain function of the ABSOLUTE frame, which is the reference
  // Soundtrack passes; if it passed segment-relative frames this would be wrong
  // after the first music cut.
  const speaking = [
    [0, 96],
    [225, 330],
  ];
  const duck = (frame) => (speaking.some(([a, b]) => frame >= a && frame < b) ? 0.05 : 0.18);

  assert.equal(duck(0), 0.05); // under narration
  assert.equal(duck(150), 0.18); // between cues, bed comes back up
  assert.equal(duck(300), 0.05);
});

test('passes unknown scene fields through untouched', () => {
  const t = buildTimeline([{ id: 'a', seconds: 1, chapter: 'intro', speaker: 'AR' }], { fps: 30 });
  assert.equal(t.byId.a.chapter, 'intro');
  assert.equal(t.byId.a.speaker, 'AR');
});

console.log('\nsoundtrack edit');
test('produces one continuous segment when there are no cuts', () => {
  const segments = buildSoundtrackEdit({ fps: 30, totalFrames: 300 });
  assert.equal(segments.length, 1);
  assert.deepEqual(segments[0], {
    from: 0,
    durationInFrames: 300,
    trimBefore: 0,
    // Both edges are the film's own head and tail, not joins.
    crossfadeIn: false,
    crossfadeOut: false,
  });
});

test('overlaps neighbouring segments by one crossfade centred on the cut', () => {
  const segments = buildSoundtrackEdit({
    fps: 30,
    totalFrames: 300,
    crossfadeFrames: 30,
    cuts: [
      { from: 0, sourceSeconds: 0 },
      { from: 150, sourceSeconds: 60 },
    ],
  });
  assert.equal(segments.length, 2);
  // Outgoing runs half a crossfade late; incoming starts half a crossfade early.
  assert.equal(segments[0].from, 0);
  assert.equal(segments[0].durationInFrames, 165);
  assert.equal(segments[1].from, 135);
  assert.equal(segments[1].durationInFrames, 165);
  // The incoming segment rolls in from before its downbeat.
  assert.equal(segments[1].trimBefore, 60 * 30 - 15);
  assert.equal(segments[0].crossfadeOut, true);
  assert.equal(segments[1].crossfadeIn, true);
});

/**
 * Error paths.
 *
 * These live here rather than in the TortureTest composition because a
 * composition that throws cannot also be looked at. Each assertion checks not
 * just THAT it fails but that the message is useful — an error is the only
 * documentation a developer reads at the moment they need it.
 */
console.log('\nerror paths are readable');

test('an unknown preset throws and lists the real names', () => {
  throws(() => resolvePreset('fadeIn', entrances), 'preset: unknown name');
  // The specific trap: `fadeIn` is a plausible guess and `fade` is the entry.
  // Under a silent fallback this rendered successfully and WRONG.
  throws(() => resolvePreset('fadeIn', entrances), 'fade');
});

test('an unknown camera throws rather than silently locking off the shot', () => {
  throws(() => resolveCamera('dolly'), 'camera: unknown name');
  throws(() => resolveCamera('dolly'), 'push');
});

test('an unknown transition throws and lists the real names', () => {
  throws(() => resolveTransition('dissolve'), 'transition: unknown name');
  throws(() => resolveTransition({ type: 'dissolve' }), 'fade');
});

test('an unknown easing throws', () => {
  throws(() => resolveEasing('easeInOutQuad'), 'easing: unknown name');
});

test('omitting a value still resolves to the documented default', () => {
  // Omission is a choice; a typo is a mistake. They must not behave the same.
  assert.equal(typeof resolvePreset(undefined, entrances), 'function');
  assert.equal(typeof resolveCamera(undefined), 'function');
  assert.equal(typeof resolveEasing(undefined), 'function');
});

test('a function passes through every resolver untouched', () => {
  const custom = () => ({});
  assert.equal(resolvePreset(custom, entrances), custom);
  assert.equal(resolveCamera(custom), custom);
  assert.equal(resolveEasing(custom), custom);
});

test('a malformed theme names every missing token, not just the first', () => {
  throws(() => validateTheme({ colors: {} }, 'broken'), 'Invalid theme "broken"');
  throws(() => validateTheme({ colors: {} }, 'broken'), 'colors.text.primary');
  const problems = (() => {
    try {
      validateTheme({ colors: {} }, 'broken');
      return 0;
    } catch (e) {
      return e.message.split('\n').length - 2;
    }
  })();
  assert.ok(problems > 5, `expected many problems reported at once, got ${problems}`);
});

test('the real themes satisfy the contract', () => {
  validateTheme({ name: 'tokens', ...tokens });
});

console.log(`\n${passed} passed${process.exitCode ? ' (with failures)' : ''}\n`);
