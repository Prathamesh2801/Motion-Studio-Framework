/** Text splitting for staggered / per-unit reveals. */

/** Splits into words, preserving the trailing space for correct layout. */
export const splitWords = (text) =>
  String(text)
    .split(/(\s+)/)
    .filter((part) => part.length > 0);

export const splitChars = (text) => Array.from(String(text));

/** Splits on `\n` — lets copy in data files control line breaks. */
export const splitLines = (text) => String(text).split('\n');

export const truncate = (text, max) =>
  text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;

export const toUpper = (text) => String(text).toUpperCase();
