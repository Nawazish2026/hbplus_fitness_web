import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth';
import { Platform } from 'react-native';

import { AuthFlowError } from '@/auth/errors';
import { publicConfig } from '@/config/env';
import { getFirebaseServices } from '@/config/firebase';

let configured = false;

function requireAuth() {
  const services = getFirebaseServices();
  if (!services) {
    throw new AuthFlowError('Firebase is not configured. Add the EXPO_PUBLIC_FIREBASE_* variables.', 'config');
  }
  return services.auth;
}

function configureGoogleSignIn(): void {
  if (configured) {
    return;
  }
  if (!publicConfig.googleWebClientId) {
    throw new AuthFlowError(
      'Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID. Android and iOS exchange a Google ID token with this Web client.',
      'config',
    );
  }

  GoogleSignin.configure({
    webClientId: publicConfig.googleWebClientId,
    iosClientId: publicConfig.googleIosClientId || undefined,
    offlineAccess: false,
    scopes: ['email', 'profile'],
    profileImageSize: 240,
  });
  configured = true;
}

export async function signInWithGoogle(): Promise<void> {
  const auth = requireAuth();
  try {
    configureGoogleSignIn();
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }
    const response = await GoogleSignin.signIn();
    if (isCancelledResponse(response)) {
      throw new AuthFlowError('Sign-in cancelled.', 'cancelled');
    }
    const idToken = response.data.idToken;
    if (!idToken) {
      throw new AuthFlowError(
        'Google did not return an ID token. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to the Web client in this Firebase project.',
        'config',
      );
    }
    const credential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(auth, credential);
  } catch (error) {
    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new AuthFlowError('Sign-in cancelled.', 'cancelled');
    }
    throw error;
  }
}

export async function signOutFromGoogle(): Promise<void> {
  const services = getFirebaseServices();
  try {
    await GoogleSignin.signOut();
  } catch {}
  if (services) {
    await signOut(services.auth);
  }
}

export async function completeGoogleRedirect(): Promise<void> {
  return undefined;
}
