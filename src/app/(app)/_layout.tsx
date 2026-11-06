import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/auth/AuthProvider';
import { LoadingScreen } from '@/components/LoadingScreen';
import { colors } from '@/theme/theme';

export default function ProtectedLayout() {
  const { status } = useAuth();

  if (status === 'loading' || status === 'rejecting') {
    return <LoadingScreen label="Checking your session" />;
  }

  if (status !== 'authenticated') {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
