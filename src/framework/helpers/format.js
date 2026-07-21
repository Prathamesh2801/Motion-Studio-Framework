/** Display formatting for stats, counters and labels. */

/** 12500 -> "12.5K", 2400000 -> "2.4M". */
export const compactNumber = (value, decimals = 1) => {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${(value / 1e9).toFixed(decimals)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(decimals)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(decimals)}K`;
  return String(Math.round(value));
};

export const withSeparators = (value, locale = 'en-US') =>
  Math.round(value).toLocaleString(locale);

export const percent = (value, decimals = 0) => `${value.toFixed(decimals)}%`;

/** Zero-pads an index for "01 / 06" style counters. */
export const pad = (value, length = 2) => String(value).padStart(length, '0');
