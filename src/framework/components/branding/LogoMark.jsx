import React from 'react';
import { useTheme } from '../../theme/index.js';

/**
 * A neutral placeholder mark, drawn as inline SVG (a play triangle inside a
 * pulse ring). Inline rather than an imported file so it inherits theme colours
 * and can be animated per-path — drive `progress` 0..1 to draw the ring on.
 *
 * A brand swaps the paths (or the whole component) for its real mark; the props
 * contract stays the same, so `Outro` and logo scenes keep working.
 */
export const LogoMark = ({ size = 120, color, accent, progress = 1, style }) => {
  const theme = useTheme();
  const ink = color ?? theme.colors.text.primary;
  const ring = accent ?? theme.colors.primary;
  const circumference = 2 * Math.PI * 42;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={style} aria-label="Logo">
      <circle
        cx="50"
        cy="50"
        r="42"
        stroke={ring}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress)}
        transform="rotate(-90 50 50)"
      />
      <path
        d="M42 36.5 L66 50 L42 63.5 Z"
        fill={ink}
        style={{ transformOrigin: '50px 50px', transform: `scale(${progress})`, opacity: progress }}
      />
    </svg>
  );
};

export default LogoMark;
