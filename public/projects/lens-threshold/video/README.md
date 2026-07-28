# Lens Threshold — video

The two source clips, in place:

- `headset-rotation.mp4` — Video A: the VR headset, slow premium rotation, camera
  moving toward the lenses.
- `world-reveal.mov` — Video B: the sequence that becomes visible after traveling
  through the lens. `.mov`, not `.mp4` — `Portal.jsx` references it by this exact
  extension; if the source file ever gets re-exported as `.mp4`, update both.

Resolved through `assetsFor('lens-threshold')` in `Portal.jsx`, never a raw
`staticFile` path:

```js
import { assetsFor } from '@/framework';
const asset = assetsFor('lens-threshold');
asset.video('headset-rotation.mp4'); // projects/lens-threshold/video/headset-rotation.mp4
asset.video('world-reveal.mov');     // projects/lens-threshold/video/world-reveal.mov
```
