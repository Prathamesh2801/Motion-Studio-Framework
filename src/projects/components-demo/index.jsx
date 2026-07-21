import React from 'react';
import {
  ThemeProvider,
  Scene,
  SectionHeader,
  StatRow,
  Badge,
  Divider,
  useFormat,
  useResponsive,
} from '@/framework';
import { defaultTheme } from '@/design';

/**
 * Phase 2 verification composition.
 *
 * Renders the ported component library through a real <Scene> (atmosphere +
 * camera + safe margins) under the default <ThemeProvider>. Everything visible
 * — colours, type, shadows, radii, atmosphere — is resolved from the theme at
 * runtime via useTheme(), proving the hybrid theming model end to end. Reflow is
 * driven once by useResponsive. Replaced by real projects in Phase 5.
 */
const STATS = [
  { id: 'a', value: 40, suffix: '+', label: 'Components' },
  { id: 'b', value: 4, label: 'Format buckets' },
  { id: 'c', value: 1, label: 'Source of truth' },
];

const Inner = () => {
  const { px } = useFormat();
  const { responsive } = useResponsive();
  const align = responsive({ landscape: 'left', vertical: 'center' });

  return (
    <Scene background="studio" camera="push">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: align === 'center' ? 'center' : 'flex-start',
          gap: px(responsive({ landscape: 56, vertical: 72 })),
          width: '100%',
          maxWidth: px(1500),
        }}
      >
        <Badge delay={2}>Phase 2 · Component Library</Badge>

        <SectionHeader
          align={align}
          eyebrow="Design System"
          title={'Composable\nby default.'}
          description="Primitives, typography, atmosphere layers and content blocks — every token resolved from the theme at render time."
          rule
          gradient
          delay={8}
          maxWidth={1100}
        />

        <Divider width={px(responsive({ landscape: 1100, vertical: 760 }))} delay={30} origin={align === 'center' ? 'center' : 'left'} />

        <StatRow
          stats={STATS}
          delay={40}
          direction={responsive({ landscape: 'row', vertical: 'column' })}
          style={{ width: '100%' }}
        />
      </div>
    </Scene>
  );
};

export const ComponentsDemo = () => (
  <ThemeProvider theme={defaultTheme}>
    <Inner />
  </ThemeProvider>
);

export default ComponentsDemo;
