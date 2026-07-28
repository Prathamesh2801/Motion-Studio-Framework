import React from 'react';
import { Text } from './Text.jsx';
import { useStaggeredMotion } from '../../hooks/useMotion.js';
import { durations, stagger as staggerTokens } from '../../motion/index.js';

/**
 * Text that arrives one piece at a time.
 *
 * `Stagger` already staggers CHILDREN; this staggers the glyphs of a single
 * string, which is the difference between a list animating in and a name
 * assembling itself. It is the standard lockup move for a title card, and until
 * now the only way to get it was to hand-split the string in a composition —
 * i.e. to put content in the JSX.
 *
 * ── WHY THE SPACING IS DONE WITH WORDS, NOT CHARACTERS ──────────────────────
 * Splitting a string into characters and rendering each in its own inline-block
 * destroys the browser's line-breaking: every character becomes a break
 * opportunity, so a long name wraps mid-word. Words are therefore the wrapping
 * unit and characters animate inside them, which keeps `by="char"` safe on a
 * narrow vertical frame — the format this repo renders half its output in.
 */
export const SplitText = ({
  children,
  /** 'char' assembles the word; 'word' reads as speech. */
  by = 'word',
  preset = 'rise',
  delay = 0,
  step = staggerTokens.tight,
  duration = durations.base,
  align = 'left',
  style,
  ...rest
}) => {
  const text = typeof children === 'string' ? children : String(children ?? '');
  const words = text.split(/(\s+)/).filter((part) => part.length > 0);
  const visible = words.filter((word) => !/^\s+$/.test(word));

  // `count` is what lets `from: 'end'` and centre-out orderings work, so it has
  // to be the real number of animated pieces — whitespace spans do not animate.
  const count =
    by === 'word' ? visible.length : visible.reduce((total, word) => total + word.length, 0);

  const motionAt = useStaggeredMotion({ count, preset, delay, step, duration });

  // Position across the WHOLE string, so the stagger keeps accelerating over
  // word boundaries instead of restarting at each one. Counted up front rather
  // than mutated during render: a counter incremented inside map() is a
  // render-order dependency, and React is entitled to reorder that work.
  let cursor = 0;
  const positions = words.map((word) => {
    if (/^\s+$/.test(word)) return null;
    const start = cursor;
    cursor += by === 'word' ? 1 : word.length;
    return start;
  });

  const piece = (content, key, index) => (
    <span key={key} style={{ display: 'inline-block', whiteSpace: 'pre', ...motionAt(index) }}>
      {content}
    </span>
  );

  return (
    <Text align={align} motion={null} style={style} {...rest}>
      {words.map((word, wordIndex) => {
        const start = positions[wordIndex];
        if (start === null) return <span key={`space-${wordIndex}`}>{word}</span>;

        if (by === 'word') return piece(word, `word-${wordIndex}`, start);

        return (
          <span key={`word-${wordIndex}`} style={{ display: 'inline-block', whiteSpace: 'pre' }}>
            {[...word].map((char, charIndex) =>
              piece(char, `char-${wordIndex}-${charIndex}`, start + charIndex),
            )}
          </span>
        );
      })}
    </Text>
  );
};

export default SplitText;
