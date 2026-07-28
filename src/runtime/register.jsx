import { registerPacks } from '@/packs/register.jsx';

/**
 * Remotion Studio's entry into the runtime (Ring 5).
 *
 * Studio is a CONSUMER of the runtime, the same as the editor and an external
 * React app — it just consumes a different part of it. Where a web page mounts
 * `<MotionTemplate>`, Studio needs `<Composition>` elements, which only mean
 * anything inside a Remotion bundle.
 *
 * This is a re-export, not a wrapper, and deliberately so. `registerPacks`
 * already does exactly the right thing, and putting a layer in front of it to
 * make the runtime look more central would add an indirection that carries no
 * behaviour. What matters is the DIRECTION: `Root.jsx` now depends on the
 * runtime's published surface rather than reaching into `packs/` — so the three
 * hosts enter through one door, and `packs/` stays free to move behind it.
 */
export const registerTemplates = registerPacks;

export default registerTemplates;
