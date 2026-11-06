import type { AuthStatus } from '../auth/types';

export type AppRoute = '/login' | '/';

export function resolveRoute(status: AuthStatus, segments: readonly string[]): AppRoute | null {
  if (status === 'loading' || status === 'rejecting') {
    return null;
  }

  const signedIn = status === 'authenticated';
  const top = segments[0];
  const inProtected = top === '(app)';
  const onLogin = top === 'login';

  if (!signedIn && inProtected) {
    return '/login';
  }
  if (signedIn && (onLogin || top === undefined || top === 'index')) {
    return '/';
  }
  if (!signedIn && (top === undefined || top === 'index')) {
    return '/login';
  }
  return null;
}
