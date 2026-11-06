import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { colors, radii, space, type as typography } from '@/theme/theme';

const links = [
  { href: '/' as const, label: 'Dashboard' },
  { href: '/profile' as const, label: 'Profile' },
];

export function AppHeader() {
  const pathname = usePathname();
  const { session, signOut, isSubmitting } = useAuth();

  return (
    <View style={styles.bar}>
      <View style={styles.brandBlock}>
        <View style={styles.mark}>
          <Text style={styles.markText}>HB+</Text>
        </View>
        <View>
          <Text style={styles.brand}>HBPlus Auth</Text>
          <Text style={styles.role}>{session?.role === 'admin' ? 'Admin' : 'Member'}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Pressable
              key={link.href}
              accessibilityRole="link"
              accessibilityState={{ selected: active }}
              onPress={() => router.push(link.href)}
              style={[styles.link, active ? styles.linkActive : null]}
            >
              <Text style={[styles.linkText, active ? styles.linkTextActive : null]}>{link.label}</Text>
            </Pressable>
          );
        })}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log out"
          disabled={isSubmitting}
          onPress={() => {
            void signOut();
          }}
          style={styles.logout}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.md,
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  mark: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    color: colors.lime,
    fontWeight: '800',
    fontSize: 16,
  },
  brand: {
    ...typography.title,
    color: colors.text,
    fontSize: 18,
  },
  role: {
    ...typography.label,
    color: colors.accent,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  link: {
    minHeight: 40,
    paddingHorizontal: space.md,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  linkActive: {
    backgroundColor: colors.text,
  },
  linkText: {
    color: colors.text,
    fontWeight: '600',
  },
  linkTextActive: {
    color: colors.lime,
  },
  logout: {
    minHeight: 40,
    paddingHorizontal: space.md,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '700',
  },
});
