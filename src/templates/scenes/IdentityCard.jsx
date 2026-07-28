import React from 'react';
import {
  Stack,
  Emblem,
  Text,
  Caption,
  useTheme,
  useFormat,
  useStaggeredMotion,
  stagger,
} from '@/framework';

/**
 * A strip of labelled facts with icons — the "who and where" line.
 *
 * Slots: `chips` (`{ id, label, value, icon }`), which is the ViewModel's
 * `identity` array passed straight through. The template never names a chip, so
 * the same strip carries a crest + flag + league for a footballer, a team +
 * engine + tyre for a driver, and a sector + ticker for a company.
 *
 * Used inline inside other scenes as often as it is used alone, so it renders no
 * `Scene` of its own — it is a BLOCK, not a full frame. Templates that own a
 * frame make themselves unusable as a component of a richer one.
 */
export const IdentityCard = ({
  chips = [],
  direction = { landscape: 'row', vertical: 'column' },
  align = { landscape: 'center', vertical: 'flex-start' },
  gap = { landscape: 40, vertical: 18 },
  iconSize = 44,
  delay = 0,
  step = stagger.base,
  style,
}) => {
  const theme = useTheme();
  const { px } = useFormat();
  const motionAt = useStaggeredMotion({ count: chips.length, preset: 'rise', delay, step });

  if (!chips.length) return null;

  return (
    <Stack direction={direction} align={align} gap={gap} wrap style={style}>
      {chips.map((chip, index) => (
        <div
          key={chip.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: px(theme.spacing.sm),
            ...motionAt(index),
          }}
        >
          {chip.icon ? (
            <Emblem src={chip.icon.src} alt={chip.label} size={iconSize} preset="none" />
          ) : null}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Caption color={theme.colors.text.muted} uppercase motion={null}>
              {chip.label}
            </Caption>
            <Text variant="cardTitle" color={theme.colors.text.primary} motion={null}>
              {chip.value}
            </Text>
          </div>
        </div>
      ))}
    </Stack>
  );
};

export default IdentityCard;
