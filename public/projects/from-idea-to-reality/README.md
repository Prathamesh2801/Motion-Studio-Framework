# From Idea to Reality — assets

Resolve these through `assetsFor('from-idea-to-reality')`, never a raw `staticFile` path:

```js
import { assetsFor } from '@/framework';
const asset = assetsFor('from-idea-to-reality');
asset.image('hero.png');   // projects/from-idea-to-reality/images/hero.png
```

Directories: `images/`, `video/`, `music/`, and any other kind you need —
an unknown kind is used verbatim as the folder name.
