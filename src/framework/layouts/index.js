/**
 * Layout system (Ring 1).
 *
 * `Scene` is the shell every beat sits in. The primitives below arrange whatever
 * they are given and reflow themselves across all four format buckets, so a
 * scene never writes `if (isVertical)` or carries its own constant tables.
 *
 * Every sizing prop takes a scalar or a per-bucket map:
 *   gap={40}                          same everywhere
 *   gap={{ landscape: 80, vertical: 40 }}
 *
 * Layouts are content-agnostic and composable — nest them freely.
 */
export { Scene } from './Scene.jsx';
export { Stack } from './Stack.jsx';
export { Center } from './Center.jsx';
export { Split } from './Split.jsx';
export { Grid } from './Grid.jsx';
export { FullBleed } from './FullBleed.jsx';
