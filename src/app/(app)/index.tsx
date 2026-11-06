import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { OFFICIAL_EMAIL_DOMAIN } from '@/auth/domainPolicy';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Notice } from '@/components/Notice';
import { Screen } from '@/components/Screen';
import { useDirectory, useOwnProfile } from '@/hooks/useProfiles';
import { colors, radii, shadow, space, type as typography } from '@/theme/theme';

const wellbeing = [
  { label: 'Body', detail: 'Movement & strength', progress: '68%', color: colors.accent },
  { label: 'Mind', detail: 'Rest & resilience', progress: '44%', color: colors.teal },
  { label: 'Gut', detail: 'Nourishment & energy', progress: '56%', color: colors.warning },
] as const;

export default function DashboardScreen() {
  const { session, profileSyncError, actionError, isSubmitting, refreshRole, signOut } = useAuth();
  const profile = useOwnProfile(session?.uid);
  const directory = useDirectory(session?.role === 'admin');
  const firstName = session?.displayName?.split(' ')[0] || 'there';

  return (
    <Screen>
      <AppHeader />

      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>YOUR WELLNESS SPACE</Text>
          <Text accessibilityRole="header" style={styles.title}>Good to see you,{`\n`}{firstName}.</Text>
          <Text style={styles.subtitle}>Your HB+ journey is made for real life—one considered step at a time.</Text>
        </View>
        <View style={styles.intention}>
          <View style={styles.intentionOrb} />
          <Text style={styles.intentionLabel}>TODAY’S INTENTION</Text>
          <Text style={styles.intentionTitle}>Make space{`\n`}for yourself.</Text>
          <Text style={styles.intentionText}>A small action today can shape a better rhythm tomorrow.</Text>
        </View>
      </View>

      {profileSyncError ? <Notice message={profileSyncError} /> : null}
      {actionError ? <Notice message={actionError} tone="warning" /> : null}

      <View style={styles.sectionHeading}>
        <View><Text style={styles.sectionTitle}>Your wellbeing</Text><Text style={styles.sectionCopy}>A connected view of how you’re feeling.</Text></View>
        <Text style={styles.sectionTag}>WEEKLY RHYTHM</Text>
      </View>
      <View style={styles.wellbeingGrid}>
        {wellbeing.map((item) => <WellbeingCard key={item.label} {...item} />)}
      </View>

      <View style={styles.memberGrid}>
        <View style={styles.memberCard}>
          <Text style={styles.cardEyebrow}>YOUR ACCOUNT</Text>
          <Text style={styles.accountName}>{session?.displayName ?? 'HB+ member'}</Text>
          <Text style={styles.accountEmail}>{session?.email ?? 'Unknown email'}</Text>
          <View style={styles.accountMeta}><Meta label="ROLE" value={session?.role === 'admin' ? 'Admin' : 'Member'} /><Meta label="SIGN-IN" value={session?.providerIds.join(', ') || 'google.com'} /></View>
        </View>
        <View style={styles.profileCard}>
          <Text style={styles.cardEyebrow}>PRIVATE PROFILE</Text>
          {profile.status === 'loading' ? <Text style={styles.muted}>Opening your secure profile…</Text> : null}
          {profile.status === 'error' ? <Notice message={profile.error ?? 'Protected data is unavailable.'} /> : null}
          {profile.status === 'ready' && profile.profile ? <><Text style={styles.profileName}>{profile.profile.displayName}</Text><Text style={styles.muted}>Your profile is secure and only available to your signed-in account.</Text></> : null}
          {profile.status === 'ready' && !profile.profile ? <Text style={styles.muted}>Your secure profile will appear here once it has synced.</Text> : null}
        </View>
      </View>

      <View style={styles.securityPanel}>
        <View style={styles.securityCopy}>
          <Text style={styles.cardEyebrow}>ACCOUNT ACCESS</Text>
          <Text style={styles.securityTitle}>Your space stays yours.</Text>
          <Text style={styles.muted}>Securely signed in with Google. Access is restricted to verified @{OFFICIAL_EMAIL_DOMAIN} accounts.</Text>
        </View>
        <View style={styles.securityActions}>
          <Button label="Refresh access" variant="secondary" loading={isSubmitting} onPress={() => { void refreshRole(); }} />
          <Button label="Log out" variant="danger" loading={isSubmitting} onPress={() => { void signOut(); }} />
        </View>
      </View>

      {session?.role === 'admin' ? (
        <View style={styles.adminPanel}>
          <Text style={styles.cardEyebrow}>ADMIN AREA</Text><Text style={styles.sectionTitle}>Member directory</Text>
          {directory.status === 'loading' ? <Text style={styles.muted}>Loading members…</Text> : null}
          {directory.status === 'error' ? <Notice message={directory.error ?? 'Directory unavailable.'} /> : null}
          {directory.status === 'ready' && directory.profiles.length === 0 ? <Text style={styles.muted}>No profiles stored yet.</Text> : null}
          {directory.profiles.map((member) => <View key={member.uid} style={styles.memberRow}><Text style={styles.memberName}>{member.displayName}</Text><Text style={styles.memberDetail}>{member.email} · {member.role}</Text></View>)}
        </View>
      ) : null}
    </Screen>
  );
}

function WellbeingCard({ label, detail, progress, color }: (typeof wellbeing)[number]) {
  return <View style={styles.wellbeingCard}><View style={[styles.colorDot, { backgroundColor: color }]} /><Text style={styles.wellbeingLabel}>{label}</Text><Text style={styles.wellbeingDetail}>{detail}</Text><View style={styles.track}><View style={[styles.fill, { width: progress, backgroundColor: color }]} /></View><Text style={styles.progress}>{progress}</Text></View>;
}

function Meta({ label, value }: { label: string; value: string }) {
  return <View style={styles.meta}><Text style={styles.metaLabel}>{label}</Text><Text style={styles.metaValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'stretch', gap: space.lg, paddingVertical: space.md }, heroCopy: { flex: 1, minWidth: 260, justifyContent: 'center', gap: space.sm },
  eyebrow: { ...typography.label, color: colors.accent, letterSpacing: 1.2, fontSize: 11 }, title: { ...typography.display, color: colors.text, fontSize: 46, lineHeight: 50, letterSpacing: -2 }, subtitle: { ...typography.body, color: colors.muted, maxWidth: 520, fontSize: 17 },
  intention: { width: 330, minHeight: 225, overflow: 'hidden', padding: space.lg, justifyContent: 'flex-end', borderRadius: radii.lg, backgroundColor: colors.teal, ...shadow }, intentionOrb: { position: 'absolute', width: 210, height: 210, borderRadius: radii.pill, backgroundColor: colors.lime, right: -70, top: -70 }, intentionLabel: { ...typography.label, color: colors.text, fontSize: 10, letterSpacing: 1.1 }, intentionTitle: { ...typography.title, color: colors.text, fontSize: 29, lineHeight: 33, letterSpacing: -1, marginTop: 5 }, intentionText: { color: colors.text, fontSize: 12, lineHeight: 17, maxWidth: 230, marginTop: space.sm },
  sectionHeading: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: space.sm, marginTop: space.sm }, sectionTitle: { ...typography.title, color: colors.text, fontSize: 25, letterSpacing: -0.8 }, sectionCopy: { ...typography.body, color: colors.muted, fontSize: 14 }, sectionTag: { ...typography.label, color: colors.muted, fontSize: 10, letterSpacing: 1.1 },
  wellbeingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md }, wellbeingCard: { flexGrow: 1, flexBasis: 220, backgroundColor: colors.backgroundRaised, borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: radii.lg, padding: space.lg, gap: 6 }, colorDot: { width: 10, height: 10, borderRadius: radii.pill, marginBottom: 3 }, wellbeingLabel: { ...typography.title, color: colors.text, fontSize: 21 }, wellbeingDetail: { color: colors.muted, fontSize: 13 }, track: { height: 7, borderRadius: radii.pill, backgroundColor: colors.surfaceBorder, overflow: 'hidden', marginTop: space.md }, fill: { height: '100%', borderRadius: radii.pill }, progress: { ...typography.label, color: colors.text, fontSize: 11, textAlign: 'right' },
  memberGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md }, memberCard: { flexGrow: 1, flexBasis: 300, backgroundColor: colors.text, borderRadius: radii.lg, padding: space.lg, gap: space.sm }, profileCard: { flexGrow: 1, flexBasis: 300, backgroundColor: colors.surface, borderRadius: radii.lg, padding: space.lg, gap: space.sm }, cardEyebrow: { ...typography.label, color: colors.accent, fontSize: 10, letterSpacing: 1.2 }, accountName: { ...typography.title, color: colors.white, fontSize: 25, letterSpacing: -0.8 }, accountEmail: { color: '#DAD3CE', fontSize: 14 }, accountMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg, borderTopWidth: 1, borderTopColor: '#444', marginTop: space.md, paddingTop: space.md }, meta: { gap: 2 }, metaLabel: { ...typography.label, color: colors.lime, fontSize: 9, letterSpacing: 1.1 }, metaValue: { color: colors.white, fontSize: 13, fontWeight: '600' }, profileName: { ...typography.title, color: colors.text, fontSize: 23 }, muted: { ...typography.body, color: colors.muted, fontSize: 14 },
  securityPanel: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: space.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.surfaceBorder, paddingVertical: space.lg }, securityCopy: { flex: 1, minWidth: 260, gap: 5 }, securityTitle: { ...typography.title, color: colors.text, fontSize: 22 }, securityActions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  adminPanel: { backgroundColor: colors.backgroundRaised, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.surfaceBorder, padding: space.lg, gap: space.sm }, memberRow: { paddingVertical: space.sm, borderTopWidth: 1, borderTopColor: colors.surfaceBorder }, memberName: { color: colors.text, fontSize: 15, fontWeight: '700' }, memberDetail: { color: colors.muted, fontSize: 13, marginTop: 2 },
});
