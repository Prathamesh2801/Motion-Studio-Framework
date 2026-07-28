import React from 'react';
import {
  Scene,
  Split,
  Stack,
  MediaFrame,
  SplitText,
  Text,
  Eyebrow,
  Divider,
  useTheme,
  useFormat,
  stagger,
  durations,
} from '@/framework';
import { IdentityCard } from './IdentityCard.jsx';

/**
 * The opening card: a portrait, a name, and who this is.
 *
 * Slots come from the ViewModel's `subject` + `identity` — never from named
 * domain fields. `badgeValue` is a jersey number here, a car number in an F1
 * pack and a rank in a leaderboard, and this file cannot tell the difference.
 *
 * ── WHY THE NUMBER IS BEHIND THE NAME ───────────────────────────────────────
 * Broadcast intros put the squad number huge and ghosted behind the lockup
 * rather than beside it. Beside it, the number competes with the name for the
 * same reading; behind it at low opacity it reads as texture that happens to be
 * meaningful, and the name stays the single focal point. It is also the one
 * element that can absorb the extra width a long name does not use.
 */
export const SubjectIntro = ({
  subject = {},
  chips = [],
  background = 'studio',
  camera = 'pushIn',
  delay = 0,
  step = stagger.loose,
  style,
}) => {
  const theme = useTheme();
  const { px, isVertical } = useFormat();

  const portrait = subject.portrait?.src;

  const lockup = (
    <Stack gap={{ landscape: 24, vertical: 18 }} align="flex-start">
      {subject.role ? <Eyebrow delay={delay}>{subject.role}</Eyebrow> : null}

      <div style={{ position: 'relative', width: '100%' }}>
        {subject.badgeValue ? (
          <Text
            variant="hero"
            color={theme.colors.text.primary}
            motion={{ preset: 'fade', delay, duration: durations.slower }}
            style={{
              position: 'absolute',
              // Pulled up and left so the number sits *behind* the name's
              // cap-height rather than under its baseline — but not so far up
              // that it collides with the eyebrow above.
              top: px(-40),
              left: px(-18),
              fontSize: px(320),
              lineHeight: 0.8,
              opacity: 0.07,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {subject.badgeValue}
          </Text>
        ) : null}

        <SplitText
          variant="hero"
          by="word"
          delay={delay + step}
          step={stagger.tight}
          style={{ position: 'relative' }}
        >
          {subject.name}
        </SplitText>
      </div>

      {subject.secondaryName ? (
        <Text
          variant="subtitle"
          color={theme.colors.text.secondary}
          motion={{ preset: 'rise', delay: delay + step * 2 }}
        >
          {subject.secondaryName}
        </Text>
      ) : null}

      <Divider width="30%" fade={false} delay={delay + step * 2} style={{ opacity: 0.4 }} />

      <IdentityCard
        chips={chips}
        delay={delay + step * 3}
        direction={{ landscape: 'row', vertical: 'row' }}
        gap={{ landscape: 40, vertical: 28 }}
      />
    </Stack>
  );

  if (!portrait) {
    return (
      <Scene background={background} camera={camera} style={style}>
        {lockup}
      </Scene>
    );
  }

  return (
    <Scene background={background} camera={camera} style={style}>
      <Split
        ratio={{ landscape: [5, 6], vertical: [1, 1] }}
        gap={{ landscape: 72, vertical: 40 }}
        // On a phone frame the face should lead; on a wide frame the eye starts
        // at the text and travels to it.
        reverseWhenStacked
      >
        {lockup}
        <MediaFrame
          src={portrait}
          alt={subject.name}
          // `cutout`, not `framed`: these are transparent renders of a person.
          // A frame would put a box around a head.
          variant="cutout"
          fit="contain"
          kenBurns={isVertical ? 0 : 0.05}
          preset="depth"
          delay={delay}
          duration={durations.cinematic}
          ambient="float"
          // The box must be BOUNDED, not just `width: 100%`. A cutout renders
          // with `overflow: visible`, and `height: 100%` against an auto-height
          // flex item resolves to auto — so the image took its intrinsic
          // aspect at full column width and ran off the bottom of the frame.
          // Fixing the aspect ratio and capping the width in design px gives a
          // deterministic box that `contain` letterboxes into, and it scales
          // per format because the cap goes through `px()`.
          style={{
            width: '100%',
            maxWidth: px(520),
            aspectRatio: '3 / 4',
            marginInline: 'auto',
          }}
        />
      </Split>
    </Scene>
  );
};

export default SubjectIntro;
