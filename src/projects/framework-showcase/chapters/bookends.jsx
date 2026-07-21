import React from 'react';
import {
  Stack,
  Center,
  Text,
  Caption,
  Eyebrow,
  Divider,
  useFormat,
  useResponsive,
  useTheme,
} from '@/framework';
import { Chapter } from '../Chapter.jsx';

/**
 * Chapters 01 and 11 — the bookends.
 *
 * Chapter 01 is the only place the display face is shown at its authored size,
 * so it doubles as the check that `hero` (132px at 1920×1080) scales correctly
 * through `px()` rather than overflowing on a phone.
 *
 * Chapter 11 prints the live format and bucket at full size. That is not
 * decoration: it means a rendered still SELF-IDENTIFIES which format produced
 * it, so a portrait render cannot be mistaken for a landscape one in a folder of
 * PNGs — which is exactly how portrait bugs survive review.
 */

export const TitleChapter = () => {
  const { px } = useFormat();

  return (
    <Chapter
      index={1}
      subsystem="Scene shell"
      validates="Scene three-pass composition · pushIn camera · entrance presets · display face at authored size"
      background="hearth"
      camera="pushIn"
    >
      <Center>
        <Stack gap={{ landscape: 20, vertical: 14 }} align="center">
          <Eyebrow>Engineering validation film</Eyebrow>
          <Text variant="hero" style={{ textAlign: 'center', fontSize: px(112) }}>
            Motion Studio
          </Text>
          <Divider width={px(220)} />
          <Text
            variant="subtitle"
            motion={{ preset: 'rise', delay: 12 }}
            style={{ textAlign: 'center', fontSize: px(30) }}
          >
            Eleven chapters. One subsystem each.
          </Text>
        </Stack>
      </Center>
    </Chapter>
  );
};

export const OutroChapter = () => {
  const { px, format } = useFormat();
  const { bucket } = useResponsive();
  const theme = useTheme();

  return (
    <Chapter
      index={11}
      subsystem="Responsive"
      validates="Live format readout — a still identifies the format that produced it"
      background="hearth"
      camera="pull"
    >
      <Center>
        <Stack gap={{ landscape: 18, vertical: 12 }} align="center">
          <Eyebrow>Rendered as</Eyebrow>
          <Text
            variant="hero"
            style={{
              textAlign: 'center',
              fontSize: px(96),
              fontFamily: theme.typography.fontStacks.mono,
            }}
          >
            {format.width}×{format.height}
          </Text>
          <Text
            variant="subtitle"
            motion={{ preset: 'rise', delay: 10 }}
            style={{ textAlign: 'center', fontSize: px(32), color: theme.colors.primary }}
          >
            {format.id} · {bucket}
          </Text>
          <Divider width={px(200)} />
          <Caption>
            Every chapter above reflowed for this bucket without a single per-format branch.
          </Caption>
        </Stack>
      </Center>
    </Chapter>
  );
};
