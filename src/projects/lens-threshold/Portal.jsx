import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, getRemotionEnvironment } from 'remotion';
import { useSceneProgress, cameraPush, focusRack, assetsFor, VignetteLayer, NoiseLayer } from '@/framework';
import { LENS_THRESHOLD_DEFAULT_PROPS, deriveLensThresholdLayout } from './schema.js';

const asset = assetsFor('lens-threshold');
const fullBleed = { width: '100%', height: '100%', objectFit: 'cover' };

/**
 * Lens Threshold — a VR headset becomes the portal into another world.
 *
 * Both source clips play in FULL, back to back, merged rather than cut: the
 * camera pushes in continuously across the whole piece, and the tail of
 * Video A (the headset) overlaps the head of Video B for `rackDuration`
 * frames, cross-dissolving between them via a focus rack. Video A is never
 * trimmed short — the rack consumes exactly its own last `rackDuration`
 * frames — and Video B starts playing from its own frame 0 the moment the
 * rack begins, so its full runtime survives intact afterward too.
 *
 * Both layers share ONE `cameraPush` — applying the move to a shared wrapper,
 * rather than to each video independently, is what keeps the two clips
 * feeling like one uninterrupted shot rather than two that happen to overlap.
 *
 * `VideoFrame` (the framed-card treatment) is deliberately NOT used here —
 * this is edge-to-edge cinema, the same convention `templates/VideoSection`
 * uses for full-bleed footage.
 */
export const Portal = ({
  timing = LENS_THRESHOLD_DEFAULT_PROPS.timing,
  camera = LENS_THRESHOLD_DEFAULT_PROPS.camera,
  focus = LENS_THRESHOLD_DEFAULT_PROPS.focus,
  debug = LENS_THRESHOLD_DEFAULT_PROPS.debug,
}) => {
  const { frame, fps } = useSceneProgress();
  const { durationA, durationB, rackStart, rackEnd, total } = deriveLensThresholdLayout({ timing, fps });
  const isStudio = getRemotionEnvironment().isStudio;

  const cameraStyle = cameraPush({ frame, duration: total, amount: camera.push });
  const rack = focusRack({
    frame,
    delay: rackStart,
    duration: rackEnd - rackStart,
    maxBlur: focus.maxBlur,
    incomingStartBlur: focus.incomingStartBlur,
    incomingStartOpacity: focus.incomingStartOpacity,
    incomingSettleScale: focus.incomingSettleScale,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <AbsoluteFill style={cameraStyle}>
        {/* Video B — its own Sequence, so it plays from ITS frame 0 starting
            at rackStart and runs its full length untouched. `premountFor`
            mounts it hidden a beat early so OffthreadVideo has already
            decoded and cached its opening frames by the time the rack
            reaches it — without this, the clip has to seek cold exactly at
            the merge point, which reads as a stutter/stop before it catches
            up. Can't combine with `layout="none"`, so this one relies on
            the outer AbsoluteFill for full-bleed sizing instead. */}
        <AbsoluteFill style={rack.incoming}>
          <Sequence from={rackStart} durationInFrames={durationB} premountFor={Math.min(45, rackStart)}>
            <OffthreadVideo src={asset.video('world-reveal.mov')} volume={0} style={fullBleed} />
          </Sequence>
        </AbsoluteFill>

        {/* Video A — its own Sequence, its full native length (durationA),
            never cut short; the rack consumes exactly its last frames. */}
        <AbsoluteFill style={rack.outgoing}>
          <Sequence from={-4} durationInFrames={durationA} layout="none">
            <OffthreadVideo src={asset.video('headset-rotation.mp4')} volume={0} style={fullBleed} />
          </Sequence>
        </AbsoluteFill>
      </AbsoluteFill>
      <VignetteLayer strength={0.32} spread={48} />
      <NoiseLayer opacity={0.035} />
      {isStudio && debug.showTimelineMarkers ? (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            padding: '4px 10px',
            fontFamily: 'monospace',
            fontSize: 13,
            color: '#fff',
            background: 'rgba(0,0,0,0.55)',
            borderRadius: 4,
            pointerEvents: 'none',
          }}
        >
          frame {frame} / {total} — A {durationA}f, rack {rackStart}→{rackEnd}, B {durationB}f
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export default Portal;
