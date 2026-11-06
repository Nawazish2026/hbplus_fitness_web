import { Image, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Notice } from '@/components/Notice';
import { Screen } from '@/components/Screen';
import { useOwnProfile } from '@/hooks/useProfiles';
import { colors, radii, space, type as typography } from '@/theme/theme';

export default function ProfileScreen() {
  const { session, profileSyncError, isSubmitting, signOut } = useAuth();
  const profile = useOwnProfile(session?.uid);
  const initial = (session?.displayName ?? 'H').slice(0, 1).toUpperCase();

  return (
    <Screen maxWidth={720}>
      <AppHeader />
      <Text accessibilityRole="header" style={styles.title}>
        Profile
      </Text>

      <View style={styles.card}>
        {session?.photoURL ? (
          <Image source={{ uri: session.photoURL }} style={styles.avatar} accessibilityIgnoresInvertColors />
        ) : (
          <View style={styles.fallback}>
            <Text style={styles.fallbackText}>{initial}</Text>
          </View>
        )}
        <View style={styles.identity}>
          <Text style={styles.name}>{session?.displayName}</Text>
          <Text style={styles.email}>{session?.email}</Text>
        </View>
      </View>

      {profileSyncError ? <Notice message={profileSyncError} /> : null}
      {profile.status === 'error' ? <Notice message={profile.error ?? 'Protected data is unavailable.'} /> : null}

      <View style={styles.details}>
        <Row label="User ID" value={session?.uid ?? 'Unknown'} />
        <Row label="Token role" value={session?.role === 'admin' ? 'Admin' : 'User'} />
        <Row label="Stored role" value={profile.profile ? (profile.profile.role === 'admin' ? 'Admin' : 'User') : 'Not loaded'} />
        <Row label="Sign-in" value={session?.providerIds.join(', ') || 'google.com'} />
        <Row label="Last login" value={formatWhen(profile.profile?.lastLoginAt ?? null)} />
      </View>

      <Button
        label="Log out"
        variant="danger"
        loading={isSubmitting}
        onPress={() => {
          void signOut();
        }}
      />
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function formatWhen(date: Date | null): string {
  if (!date) {
    return 'Not recorded';
  }
  return date.toLocaleString();
}

const styles = StyleSheet.create({
  title: {
    ...typography.display,
    color: colors.text,
    fontSize: 32,
  },
  card: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  fallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: colors.accentInk,
    fontSize: 28,
    fontWeight: '800',
  },
  identity: {
    flex: 1,
    gap: space.xs,
  },
  name: {
    ...typography.title,
    color: colors.text,
  },
  email: {
    ...typography.body,
    color: colors.muted,
  },
  details: {
    backgroundColor: colors.backgroundRaised,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: space.lg,
    gap: space.md,
  },
  row: {
    gap: 4,
  },
  rowLabel: {
    ...typography.label,
    color: colors.accent,
    textTransform: 'uppercase',
  },
  rowValue: {
    ...typography.body,
    color: colors.text,
  },
});
