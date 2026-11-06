import { ACCESS_RESTRICTED_MESSAGE } from '@/auth/domainPolicy';

export class AuthFlowError extends Error {
  readonly code: 'cancelled' | 'config' | 'native-build' | 'restricted' | 'auth';

  constructor(message: string, code: AuthFlowError['code']) {
    super(message);
    this.name = 'AuthFlowError';
    this.code = code;
  }
}

export function readErrorCode(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === 'string' ? code : null;
  }
  return null;
}

export function readErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong. Try again.';
}

export function mapAuthError(error: unknown): AuthFlowError {
  if (error instanceof AuthFlowError) {
    return error;
  }

  const code = readErrorCode(error);
  const message = readErrorMessage(error);

  if (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    code === 'SIGN_IN_CANCELLED' ||
    code === '-5' ||
    code === '12501'
  ) {
    return new AuthFlowError('Sign-in cancelled.', 'cancelled');
  }

  if (code === 'auth/popup-blocked') {
    return new AuthFlowError('The browser blocked the Google window. Allow popups, or we will redirect you to Google.', 'auth');
  }

  if (code === 'auth/unauthorized-domain') {
    return new AuthFlowError(
      'This domain is not authorized in Firebase Authentication. Add it under Authorized domains.',
      'config',
    );
  }

  if (code === 'auth/network-request-failed') {
    return new AuthFlowError('Network error. Check your connection and try again.', 'auth');
  }

  if (code === 'auth/operation-not-allowed') {
    return new AuthFlowError('Google sign-in is disabled for this Firebase project.', 'config');
  }

  if (code === 'auth/account-exists-with-different-credential') {
    return new AuthFlowError('This email is already linked to a different sign-in method.', 'auth');
  }

  if (code === 'auth/invalid-credential' || code === 'auth/invalid-id-token') {
    return new AuthFlowError(
      'Google did not return a credential Firebase accepts. Confirm the Web client ID belongs to this Firebase project.',
      'config',
    );
  }

  if (/RNGoogleSignin|TurboModuleRegistry|could not be found|not-implemented method on web/i.test(message)) {
    return new AuthFlowError(
      'Google Sign-In on Android and iOS needs a development build. Expo Go does not include the native module. Run npx expo run:ios or npx expo run:android.',
      'native-build',
    );
  }

  if (message === ACCESS_RESTRICTED_MESSAGE) {
    return new AuthFlowError(message, 'restricted');
  }

  return new AuthFlowError(message, 'auth');
}

export function mapFirestoreError(error: unknown): string {
  const code = readErrorCode(error);
  if (code === 'permission-denied') {
    return 'Protected data is unavailable. Firestore rejected this session.';
  }
  if (code === 'unavailable') {
    return 'Firestore is unavailable. Try again in a moment.';
  }
  return 'Could not load protected profile data.';
}
