import React from 'react';
import { Scene, Center, Stack, Text, Divider, stagger } from '@/framework';

/**
 * A single testimonial or thesis line, given the whole frame.
 *
 * Slots: `quote`, `attribution`, `role`. Deliberately holds one idea: a quote
 * competing with other content stops being a quote.
 */
export const QuoteScene = ({
  quote,
  attribution,
  role,
  background = 'hearth',
  camera = 'pushIn',
  delay = 0,
  step = stagger.loose,
  style,
}) => (
  <Scene background={background} camera={camera} style={style}>
    <Center gap={{ landscape: 40, vertical: 32 }} maxWidth={{ landscape: 1500, vertical: 920 }}>
      <Stack gap={{ landscape: 40, vertical: 32 }} align="center">
        {/* An oversized, low-contrast quote mark: reads as punctuation, not decoration. */}
        <Text
          variant="hero"
          align="center"
          motion={{ preset: 'fade', delay, duration: 30 }}
          style={{ opacity: 0.18, lineHeight: 0.7 }}
        >
          &ldquo;
        </Text>

        <Text
          variant="sectionTitle"
          align="center"
          motion={{ preset: 'unmask', delay: delay + step, duration: 34 }}
        >
          {quote}
        </Text>

        {attribution || role ? (
          <>
            <Divider width="22%" origin="center" fade={false} delay={delay + step * 3} style={{ opacity: 0.45 }} />
            <Stack gap={6} align="center">
              {attribution ? (
                <Text variant="subtitle" align="center" motion={{ preset: 'rise', delay: delay + step * 4 }}>
                  {attribution}
                </Text>
              ) : null}
              {role ? (
                <Text
                  variant="eyebrow"
                  align="center"
                  motion={{ preset: 'fade', delay: delay + step * 5 }}
                  style={{ opacity: 0.7 }}
                >
                  {role}
                </Text>
              ) : null}
            </Stack>
          </>
        ) : null}
      </Stack>
    </Center>
  </Scene>
);

export default QuoteScene;
