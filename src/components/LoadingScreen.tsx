import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, space, type as typography } from '@/theme/theme';

export function LoadingScreen({ label }: { label: string }) {
  return (
    <View style={styles.screen}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    padding: space.lg,
  },
  label: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
  },
});
