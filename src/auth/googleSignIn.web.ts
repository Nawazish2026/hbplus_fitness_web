import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getRedirectResult,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';

import { OFFICIAL_EMAIL_DOMAIN } from '@/auth/domainPolicy';
import { AuthFlowError, readErrorCode } from '@/auth/errors';
import { getFirebaseServices } from '@/config/firebase';

function requireAuth() {
  const services = getFirebaseServices();
  if (!services) {
    throw new AuthFlowError('Firebase is not configured. Add the EXPO_PUBLIC_FIREBASE_* variables.', 'config');
  }
  return services.auth;
}

function googleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  provider.setCustomParameters({
    hd: OFFICIAL_EMAIL_DOMAIN,
    prompt: 'select_account',
  });
  return provider;
}

export async function signInWithGoogle(): Promise<void> {
  const auth = requireAuth();
  await setPersistence(auth, browserLocalPersistence);
  const provider = googleProvider();
  try {
    await signInWithPopup(auth, provider, browserPopupRedirectResolver);
  } catch (error) {
    if (readErrorCode(error) === 'auth/popup-blocked') {
      await signInWithRedirect(auth, provider, browserPopupRedirectResolver);
      return;
    }
    throw error;
  }
}

export async function signOutFromGoogle(): Promise<void> {
  const services = getFirebaseServices();
  if (!services) {
    return;
  }
  await signOut(services.auth);
}

export async function completeGoogleRedirect(): Promise<void> {
  const services = getFirebaseServices();
  if (!services) {
    return;
  }
  await getRedirectResult(services.auth, browserPopupRedirectResolver);
}
