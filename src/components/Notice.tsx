import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, space, type as typography } from '@/theme/theme';

interface NoticeProps {
  message: string;
  tone?: 'danger' | 'warning' | 'info';
}

export function Notice({ message, tone = 'danger' }: NoticeProps) {
  return (
    <View style={[styles.box, tone === 'warning' ? styles.warning : tone === 'info' ? styles.info : styles.danger]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: space.md,
  },
  danger: {
    backgroundColor: colors.dangerSurface,
    borderColor: colors.dangerBorder,
  },
  warning: {
    backgroundColor: colors.warningSurface,
    borderColor: colors.warning,
  },
  info: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
  },
  text: {
    ...typography.body,
    color: colors.text,
  },
});
