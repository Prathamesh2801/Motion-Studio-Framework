import React from 'react';
import { useTheme } from '../../theme/index.js';
import { useFormat } from '../../hooks/useFormat.js';
import { useMotion } from '../../hooks/useMotion.js';
import { compactStyle } from '../../helpers/style.js';

/**
 * Base text primitive. Every typography component is a thin wrapper around this,
 * so behaviour (format scaling, motion, gradient fill, theme resolution) is
 * implemented exactly once.
 *
 * Reads the visual theme at runtime via useTheme(), so the same component
 * renders in any brand. Not intended for direct use in compositions — reach for
 * `HeroTitle`, `Description` and friends, which carry the semantic intent.
 */
export const Text = ({
  children,
  /** Key of `theme.typography.textStyles`. */
  variant = 'description',
  as: Tag = 'div',
  color,
  align = 'left',
  weight,
  size,
  lineHeight,
  letterSpacing,
  maxWidth,
  uppercase = false,
  /** Paints the text with a gradient (CSS value) instead of a flat colour. */
  gradient,
  /** Motion options forwarded to `useMotion`; pass `null` to opt out. */
  motion = {},
  style,
  className,
  ...rest
}) => {
  const theme = useTheme();
  const { px } = useFormat();
  const { textStyles, fontStacks } = theme.typography;
  const { family, ...base } = textStyles[variant] ?? textStyles.description;
  const motionStyle = useMotion(motion ?? { preset: 'none' });

  const resolvedColor = color ?? theme.colors.text.primary;
  const gradientStyle = gradient
    ? {
        backgroundImage: gradient,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
      }
    : { color: resolvedColor };

  return (
    <Tag
      className={className}
      style={compactStyle({
        ...base,
        fontFamily: fontStacks[family] ?? fontStacks.body,
        fontSize: px(size ?? base.fontSize),
        fontWeight: weight ?? base.fontWeight,
        lineHeight: lineHeight ?? base.lineHeight,
        letterSpacing: letterSpacing ?? base.letterSpacing,
        textTransform: uppercase ? 'uppercase' : base.textTransform,
        textAlign: align,
        maxWidth: maxWidth === undefined ? undefined : px(maxWidth),
        margin: 0,
        whiteSpace: 'pre-wrap',
        // A word with no break opportunity — a URL, an email, a long compound —
        // otherwise renders past its container and bleeds into whatever is
        // beside it. `minmax(0, 1fr)` in Grid stops that from resizing the
        // LAYOUT, but nothing stopped the glyphs themselves overflowing until
        // here. `break-word` only engages when a word genuinely cannot fit, so
        // normal copy is unaffected.
        overflowWrap: 'break-word',
        ...gradientStyle,
        ...motionStyle,
        ...style,
      })}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Text;
