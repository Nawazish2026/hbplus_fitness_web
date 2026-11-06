import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { OFFICIAL_EMAIL_DOMAIN } from '@/auth/domainPolicy';
import { Button } from '@/components/Button';
import { GoogleMark } from '@/components/GoogleMark';
import { Notice } from '@/components/Notice';
import { Screen } from '@/components/Screen';
import { colors, radii, shadow, space, type as typography } from '@/theme/theme';

const pathways = [
  {
    key: 'Body',
    copy: 'Move with intention',
    detail: 'Build strength, ease discomfort and feel more confident in your movement.',
    tint: colors.accent,
  },
  {
    key: 'Mind',
    copy: 'Restore with focus',
    detail: 'Make space for better balance with support shaped around your everyday life.',
    tint: colors.teal,
  },
  {
    key: 'Gut',
    copy: 'Feel balanced daily',
    detail: 'Find practical nutrition guidance that works with your needs and routines.',
    tint: colors.warning,
  },
] as const;

const metrics = [
  { value: '1550+', label: 'lives transformed' },
  { value: '4970+', label: 'strong community' },
  { value: '59800+', label: 'sessions completed' },
] as const;

const trustSignals = [
  'Assessment-led care',
  'Expert coaches & specialists',
  'Built around real routines',
] as const;

const careSteps = [
  {
    number: '01',
    title: 'Understand you',
    copy: 'Start with your lifestyle, goals and the things that matter most to you.',
  },
  {
    number: '02',
    title: 'Build your plan',
    copy: 'Bring the right guidance together across movement, nutrition and wellbeing.',
  },
  {
    number: '03',
    title: 'Grow at your pace',
    copy: 'Make steady progress with support that fits real life, not the other way around.',
  },
] as const;

export default function LoginScreen() {
  const { status, accessMessage, actionError, missingConfig, isSubmitting, signIn } = useAuth();
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [activePathway, setActivePathway] = useState<(typeof pathways)[number]['key']>('Body');
  const configured = status !== 'unconfigured';
  const visibleError = actionError && actionError !== dismissed ? actionError : null;

  const entrance = useRef(new Animated.Value(0)).current;
  const driftY = useRef(new Animated.Value(0)).current;
  const driftX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const floatY = Animated.loop(
      Animated.sequence([
        Animated.timing(driftY, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(driftY, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );

    const floatX = Animated.loop(
      Animated.sequence([
        Animated.timing(driftX, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(driftX, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );

    floatY.start();
    floatX.start();

    return () => {
      floatY.stop();
      floatX.stop();
    };
  }, [driftX, driftY, entrance]);

  const rise = entrance.interpolate({ inputRange: [0, 1], outputRange: [26, 0] });
  const floatY = driftY.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const floatX = driftX.interpolate({ inputRange: [0, 1], outputRange: [0, 12] });
  const activePathwayInfo = pathways.find((pathway) => pathway.key === activePathway) ?? pathways[0];

  return (
    <Screen maxWidth={1180}>
      <View style={styles.shell}>
        <Animated.View style={[styles.darkHero, { opacity: entrance, transform: [{ translateY: rise }] }]}>
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <View style={styles.mark}>
                <Text style={styles.markText}>HB+</Text>
              </View>
              <Text style={styles.brandName}>HOP WITH HB</Text>
            </View>
            <Text style={styles.topNote}>WELLNESS, PERSONALISED</Text>
          </View>

          <View style={styles.hero}>
            <View style={styles.heroCopy}>
              <View style={styles.eyebrowPill}>
                <View style={styles.eyebrowDot} />
                <Text style={styles.kicker}>YOUR LIFE, YOUR HEALTH</Text>
              </View>
              <Text accessibilityRole="header" style={styles.title}>Wellness that understands your lifestyle.</Text>
              <Text style={styles.subtitle}>
                Expert-led support for your body, mind and gut — built around the rhythm of real life.
              </Text>
              <View style={styles.heroActions}>
                <Button
                  accessibilityLabel="Start your wellness journey with Google"
                  label="Start your journey"
                  variant="primary"
                  loading={isSubmitting}
                  disabled={!configured}
                  onPress={() => {
                    setDismissed(actionError);
                    void signIn();
                  }}
                  style={styles.heroButton}
                />
                <Text style={styles.heroNote}>Personalised care. Sustainable progress.</Text>
              </View>
            </View>

            <View style={styles.visual} accessibilityElementsHidden>
              <Animated.View style={[styles.orbLarge, { transform: [{ translateY: floatY }, { translateX: floatX }] }]} />
              <Animated.View style={[styles.orbSmall, { transform: [{ translateY: Animated.multiply(floatY, -0.7) }, { translateX: Animated.multiply(floatX, -0.8) }] }]} />
              <Animated.View style={[styles.orbGlow, { transform: [{ translateY: Animated.multiply(floatY, 0.8) }] }]} />

              <View style={styles.visualCard}>
                <Text style={styles.visualEyebrow}>A MORE CONNECTED APPROACH</Text>
                <Text style={styles.visualTitle}>Small steps.{`\n`}Real change.</Text>
                <View style={styles.progressTrack}>
                  <View style={styles.progressFill} />
                </View>
                <Text style={styles.visualCaption}>{activePathwayInfo.detail}</Text>
                <View style={styles.chipRow}>
                  {pathways.map((pathway) => (
                    <View key={pathway.key} style={[styles.chip, activePathway === pathway.key ? styles.chipActive : null]}>
                      <Text style={[styles.chipText, activePathway === pathway.key ? styles.chipTextActive : null]}>{pathway.key}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.statBlock}>
                <Text style={styles.statNumber}>1550+</Text>
                <Text style={styles.statLabel}>lives transformed</Text>
              </View>
            </View>
          </View>

          <View style={styles.metricRow}>
            {metrics.map((metric) => (
              <View key={metric.label} style={styles.metricPill}>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.pathwaysSection, { opacity: entrance, transform: [{ translateY: rise }] }]}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionKicker}>THREE PATHWAYS, ONE YOU</Text>
            <Text accessibilityRole="header" style={styles.sectionTitle}>Health is connected.{`\n`}Your care should be too.</Text>
            <Text style={styles.sectionCopy}>
              Explore the areas that shape how you feel. Choose a pathway to see how personalised support can help.
            </Text>
          </View>
          <View style={styles.pathwayRow}>
            {pathways.map((pathway) => {
              const active = pathway.key === activePathway;
              return (
                <Pressable
                  key={pathway.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setActivePathway(pathway.key)}
                  style={({ pressed }) => [
                    styles.pathway,
                    active ? styles.pathwayActive : null,
                    pressed ? styles.pathwayPressed : null,
                  ]}
                >
                  <View style={[styles.pathwayDot, { backgroundColor: pathway.tint }]} />
                  <Text style={[styles.pathwayTitle, active ? styles.pathwayTitleActive : null]}>{pathway.key}</Text>
                  <Text style={[styles.pathwayCopy, active ? styles.pathwayCopyActive : null]}>{pathway.copy}</Text>
                  <Text style={[styles.pathwayDetail, active ? styles.pathwayDetailActive : null]}>{pathway.detail}</Text>
                  <Text style={[styles.pathwayAction, active ? styles.pathwayActionActive : null]}>
                    {active ? 'Selected pathway' : 'Explore pathway'} {active ? '✓' : '↗'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View style={[styles.careSection, { opacity: entrance, transform: [{ translateY: rise }] }]}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionKicker}>CARE THAT FITS YOUR LIFE</Text>
            <Text accessibilityRole="header" style={styles.sectionTitle}>A thoughtful plan.{`\n`}A little progress at a time.</Text>
          </View>
          <View style={styles.stepsRow}>
            {careSteps.map((step) => (
              <View key={step.number} style={styles.stepCard}>
                <Text style={styles.stepNumber}>{step.number}</Text>
                <View style={styles.stepRule} />
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepCopy}>{step.copy}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.loginPanel, { opacity: entrance, transform: [{ translateY: rise }] }]}>
          <View style={styles.loginLead}>
            <Text style={styles.loginKicker}>YOUR NEXT STEP</Text>
            <Text style={styles.loginTitle}>Let’s make feeling better feel possible.</Text>
            <Text style={styles.loginText}>Start with a secure sign-in and take the first step toward a plan made for you.</Text>
            <View style={styles.featureList}>
              {trustSignals.map((signal) => (
                <View key={signal} style={styles.featureRow}>
                  <View style={styles.featureDot} />
                  <Text style={styles.featureText}>{signal}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.loginAction}>
            {accessMessage ? <Notice message={accessMessage} /> : null}
            {visibleError ? <Notice message={visibleError} tone="warning" /> : null}
            {!configured ? (
              <Notice tone="warning" message={`Firebase is not configured. Add ${missingConfig.join(', ')} and restart the app.`} />
            ) : null}
            <Button
              accessibilityLabel="Continue with Google"
              label="Continue securely with Google"
              variant="primary"
              loading={isSubmitting}
              disabled={!configured}
              onPress={() => {
                setDismissed(actionError);
                void signIn();
              }}
            />
            <View style={styles.googleRow}>
              <GoogleMark />
              <Text style={styles.hint}>Secure Google sign-in · Official accounts only: @{OFFICIAL_EMAIL_DOMAIN}</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    gap: space.xxl,
  },
  darkHero: {
    backgroundColor: colors.night,
    borderRadius: radii.lg,
    padding: space.lg,
    gap: space.md,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.md,
    paddingBottom: space.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  mark: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    color: colors.night,
    fontSize: 16,
    fontWeight: '800',
  },
  brandName: {
    color: colors.onDark,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  topNote: {
    ...typography.label,
    color: colors.onDarkMuted,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  hero: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: space.xxl,
    paddingVertical: space.lg,
  },
  heroCopy: {
    flex: 1,
    minWidth: 220,
    gap: space.md,
  },
  eyebrowPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: colors.glass,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
  },
  eyebrowDot: {
    width: 7,
    height: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.lime,
  },
  kicker: {
    ...typography.label,
    color: colors.lime,
    fontSize: 10,
    letterSpacing: 1.15,
  },
  title: {
    ...typography.display,
    color: colors.onDark,
    fontSize: 50,
    lineHeight: 54,
    letterSpacing: -2,
  },
  subtitle: {
    ...typography.body,
    color: colors.onDarkMuted,
    maxWidth: 540,
    fontSize: 17,
    lineHeight: 27,
  },
  heroActions: {
    alignItems: 'flex-start',
    gap: space.sm,
    marginTop: space.xs,
  },
  heroButton: {
    minHeight: 58,
    paddingHorizontal: space.lg,
  },
  heroNote: {
    color: colors.onDarkMuted,
    fontSize: 11,
    paddingHorizontal: space.sm,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    paddingTop: space.md,
  },
  metricPill: {
    minWidth: 132,
    flexGrow: 1,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radii.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  metricValue: {
    color: colors.onDark,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  metricLabel: {
    color: colors.onDarkMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  pathwayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  pathway: {
    minWidth: 220,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radii.md,
    padding: space.lg,
    gap: space.sm,
    backgroundColor: colors.backgroundRaised,
  },
  pathwayActive: {
    borderColor: colors.night,
    backgroundColor: colors.night,
    ...shadow,
  },
  pathwayPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  pathwayDot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    marginBottom: space.xs,
  },
  pathwayTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  pathwayTitleActive: {
    color: colors.onDark,
  },
  pathwayCopy: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  pathwayCopyActive: {
    color: colors.lime,
  },
  pathwayDetail: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: space.xs,
  },
  pathwayDetailActive: {
    color: colors.onDarkMuted,
  },
  pathwayAction: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginTop: space.sm,
  },
  pathwayActionActive: {
    color: colors.lime,
  },
  pathwaysSection: {
    gap: space.lg,
  },
  sectionHeading: {
    maxWidth: 680,
    gap: space.sm,
    marginBottom: space.xs,
  },
  sectionKicker: {
    ...typography.label,
    color: colors.accent,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  sectionTitle: {
    ...typography.display,
    color: colors.text,
    fontSize: 38,
    lineHeight: 43,
    letterSpacing: -1.5,
  },
  sectionCopy: {
    ...typography.body,
    color: colors.muted,
    maxWidth: 620,
  },
  careSection: {
    gap: space.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: space.lg,
  },
  stepsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  stepCard: {
    flex: 1,
    minWidth: 190,
    backgroundColor: colors.backgroundRaised,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radii.md,
    padding: space.md,
    gap: space.sm,
  },
  stepNumber: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  stepRule: {
    width: 34,
    height: 3,
    backgroundColor: colors.lime,
    borderRadius: radii.pill,
  },
  stepTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  stepCopy: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  visual: {
    position: 'relative',
    width: 380,
    maxWidth: '100%',
    minHeight: 370,
    borderRadius: radii.lg,
    backgroundColor: colors.nightRaised,
    overflow: 'hidden',
    justifyContent: 'center',
    padding: space.lg,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    ...shadow,
  },
  orbLarge: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: radii.pill,
    backgroundColor: colors.lime,
    right: -138,
    top: -98,
    opacity: 0.83,
  },
  orbSmall: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: radii.pill,
    backgroundColor: colors.teal,
    left: -92,
    bottom: -76,
    opacity: 0.88,
  },
  orbGlow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    bottom: 18,
    right: 4,
    opacity: 0.45,
  },
  visualCard: {
    backgroundColor: 'rgba(255, 253, 248, 0.88)',
    borderRadius: radii.md,
    padding: space.lg,
    gap: space.sm,
    zIndex: 1,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadow,
  },
  visualEyebrow: {
    ...typography.label,
    color: colors.accent,
    fontSize: 10,
    letterSpacing: 1.1,
  },
  visualTitle: {
    ...typography.title,
    color: colors.text,
    fontSize: 27,
    lineHeight: 31,
    letterSpacing: -0.9,
  },
  progressTrack: {
    height: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceBorder,
    overflow: 'hidden',
    marginTop: space.xs,
  },
  progressFill: {
    height: '100%',
    width: '68%',
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
  },
  visualCaption: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  chipRow: {
    flexDirection: 'row',
    gap: space.xs,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  chip: {
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 253, 248, 0.72)',
    paddingHorizontal: space.sm,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: colors.night,
  },
  chipText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  chipTextActive: {
    color: colors.onDark,
  },
  statBlock: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    zIndex: 1,
    backgroundColor: colors.glass,
    borderRadius: radii.md,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  statNumber: {
    color: colors.onDark,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  statLabel: {
    color: colors.onDarkMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  loginPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.night,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: space.lg,
  },
  loginLead: {
    flex: 1,
    minWidth: 220,
    gap: space.sm,
  },
  loginKicker: {
    ...typography.label,
    color: colors.lime,
    fontSize: 10,
    letterSpacing: 1.3,
  },
  loginTitle: {
    ...typography.title,
    color: colors.onDark,
    fontSize: 27,
    lineHeight: 33,
    letterSpacing: -0.8,
  },
  loginText: {
    ...typography.body,
    color: colors.onDarkMuted,
    maxWidth: 480,
  },
  featureList: {
    marginTop: space.sm,
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.lime,
  },
  featureText: {
    ...typography.label,
    color: colors.onDarkMuted,
    fontSize: 12,
  },
  loginAction: {
    width: '100%',
    maxWidth: 430,
    gap: space.sm,
  },
  googleRow: {
    flexDirection: 'row',
    gap: space.sm,
    alignItems: 'center',
    paddingHorizontal: space.sm,
  },
  hint: {
    ...typography.label,
    color: colors.onDarkMuted,
    flex: 1,
    fontWeight: '500',
    fontSize: 11,
  },
});
