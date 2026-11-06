import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, space, type as typography } from '@/theme/theme';

type ButtonVariant = 'primary' | 'google' | 'secondary' | 'danger';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, variant = 'primary', loading = false, disabled, style, ...rest }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        Platform.OS === 'web' ? styles.webPointer : null,
        style,
      ]}
      {...rest}
    >
      {loading ? <ActivityIndicator color={variant === 'google' || variant === 'secondary' ? colors.ink : colors.accentInk} /> : null}
      <Text
        style={[
          styles.label,
          variant === 'danger' ? styles.dangerLabel : variant === 'google' || variant === 'secondary' ? styles.darkLabel : styles.lightLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: radii.pill,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: space.sm,
  },
  primary: {
    backgroundColor: colors.accent,
  },
  google: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.text,
  },
  secondary: {
    backgroundColor: colors.backgroundRaised,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  danger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.55,
  },
  webPointer: {
    cursor: 'pointer',
  } as ViewStyle,
  label: {
    ...typography.body,
    fontWeight: '700',
  },
  lightLabel: {
    color: colors.accentInk,
  },
  darkLabel: {
    color: colors.ink,
  },
  dangerLabel: {
    color: colors.danger,
  },
});
