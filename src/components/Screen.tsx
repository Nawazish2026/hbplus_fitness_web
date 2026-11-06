import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, space } from '@/theme/theme';

interface ScreenProps {
  children: ReactNode;
  maxWidth?: number;
}

export function Screen({ children, maxWidth = 1040 }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const horizontal = width >= 900 ? space.xl : space.md;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{
        paddingTop: insets.top + space.xl,
        paddingBottom: insets.bottom + space.xxl,
        paddingHorizontal: horizontal,
      }}
    >
      <View style={[styles.content, { maxWidth }]}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: '100%',
    alignSelf: 'center',
    gap: space.lg,
  },
});
