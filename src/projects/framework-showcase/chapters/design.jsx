import React from 'react';
import {
  Stack,
  Grid,
  Split,
  Text,
  Surface,
  Badge,
  Divider,
  CTA,
  Eyebrow,
  Caption,
  MediaFrame,
  StatCard,
  FeatureList,
  Reveal,
  Stagger,
  useFormat,
  useTheme,
} from '@/framework';
import { Chapter } from '../Chapter.jsx';
import { swatch } from '../content.js';

/**
 * Chapters 04 and 05 — typography and the component library.
 *
 * Chapter 04 iterates the theme's own `textStyles`, so it proves two things at
 * once: that every style a brand declares actually renders, and that the FONTS
 * loaded. A missing webfont is invisible in prose but obvious in a specimen
 * sheet, because the display and body faces stop being distinguishable.
 *
 * Chapter 05 places every component that has no home elsewhere in the film. The
 * rule the plan set: anything that cannot be put on screen here is dead and gets
 * deleted. That is what keeps the public surface honest.
 */

export const TypographyChapter = () => {
  const { px } = useFormat();
  const theme = useTheme();
  const styles = theme.typography.textStyles;

  // Order matters: reading down should feel like a scale, not a shuffle.
  const order = ['hero', 'sectionTitle', 'cardTitle', 'subtitle', 'description', 'caption', 'eyebrow'];
  const names = [...order.filter((n) => styles[n]), ...Object.keys(styles).filter((n) => !order.includes(n))];

  return (
    <Chapter
      index={4}
      subsystem="Typography"
      validates={`${names.length} text styles · ${theme.typography.fontFamilies.display} / ${theme.typography.fontFamilies.body} / ${theme.typography.fontFamilies.mono} — loaded before frame 0`}
      background="workshop"
    >
      <Stack gap={{ landscape: 14, vertical: 10 }} style={{ width: '100%' }}>
        {names.map((name, index) => (
          <Split
            key={name}
            ratio={[1, 4]}
            align="baseline"
            gap={{ landscape: 32, vertical: 8 }}
            direction={{ landscape: 'row', portrait: 'column' }}
          >
            <Text
              variant="caption"
              motion={{ preset: 'fade', delay: index * 3 }}
              style={{ color: theme.colors.text.muted, fontSize: px(17) }}
            >
              {name}
            </Text>
            <Text
              variant={name}
              motion={{ preset: 'rise', delay: index * 3 }}
              style={{
                // Cap the specimen so `hero` (132px) does not blow the chapter
                // apart — the point is the RELATIVE scale and the face, not the
                // absolute size, which chapter 11 shows at full bleed.
                fontSize: px(Math.min(styles[name].fontSize ?? 30, 52)),
              }}
            >
              Grumpy wizards make toxic brew
            </Text>
          </Split>
        ))}
      </Stack>
    </Chapter>
  );
};

export const ComponentsChapter = () => {
  const { px } = useFormat();
  const theme = useTheme();

  return (
    <Chapter
      index={5}
      subsystem="Components"
      validates="Surface · Badge · Divider · MediaFrame · CTA · StatCard · FeatureList · Reveal · Stagger · Eyebrow · Caption"
    >
      <Stack gap={{ landscape: 26, vertical: 18 }} style={{ width: '100%' }}>
        <Eyebrow>Component library</Eyebrow>
        <Text variant="sectionTitle" style={{ fontSize: px(46) }}>
          Everything the framework ships.
        </Text>

        <Grid columns={{ ultrawide: 4, landscape: 3, square: 2, portrait: 1 }} gap={22}>
          <Surface style={{ padding: px(26) }}>
            <Stack gap={14} align="flex-start">
              <Badge>Badge</Badge>
              <Divider />
              <Caption>Surface · Badge · Divider</Caption>
            </Stack>
          </Surface>

          <Surface style={{ padding: px(26) }}>
            <Stack gap={14} align="flex-start">
              <CTA variant="solid">Solid CTA</CTA>
              <CTA variant="outline">Outline CTA</CTA>
            </Stack>
          </Surface>

          <StatCard value={4} label="Format buckets" />

          <Surface style={{ padding: px(20) }}>
            <MediaFrame
              src={swatch('MediaFrame', theme.colors.primary, theme.colors.background)}
              preset="settle"
              kenBurns={0.06}
              style={{ width: '100%', aspectRatio: '16 / 9' }}
            />
          </Surface>

          <Surface style={{ padding: px(26) }}>
            <FeatureList
              features={[
                { title: 'FeatureList', description: 'Marker + copy' },
                { title: 'Staggered', description: 'One delay per item' },
              ]}
            />
          </Surface>

          <Surface style={{ padding: px(26) }}>
            <Stagger step={6}>
              <Caption>Stagger child one</Caption>
              <Caption>Stagger child two</Caption>
              <Caption>Stagger child three</Caption>
            </Stagger>
          </Surface>

          <Surface style={{ padding: px(26) }}>
            <Reveal preset="unmask" delay={10}>
              <Text variant="cardTitle" motion={null} style={{ fontSize: px(30) }}>
                Reveal
              </Text>
            </Reveal>
          </Surface>

          <Surface
            style={{
              padding: px(26),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: theme.glows.primary,
            }}
          >
            <Caption>glows.primary</Caption>
          </Surface>
        </Grid>
      </Stack>
    </Chapter>
  );
};
