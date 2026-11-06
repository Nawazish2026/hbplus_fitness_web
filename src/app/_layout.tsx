import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/auth/AuthProvider';
import { LoadingScreen } from '@/components/LoadingScreen';
import { resolveRoute } from '@/navigation/routeGuard';
import { colors } from '@/theme/theme';

export const unstable_settings = {
  anchor: 'login',
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { status } = useAuth();
  const segments = useSegments();
  const signedIn = status === 'authenticated';
  const target = resolveRoute(status, segments);

  if (status === 'loading' || status === 'rejecting') {
    return (
      <LoadingScreen
        label={status === 'rejecting' ? 'Closing unauthorized session' : 'Checking your session'}
      />
    );
  }

  return (
    <>
      {target ? <Redirect href={target} /> : null}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
