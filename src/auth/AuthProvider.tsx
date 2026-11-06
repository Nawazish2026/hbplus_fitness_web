import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { completeGoogleRedirect, signInWithGoogle, signOutFromGoogle } from '@/auth/googleSignIn';
import { evaluateAccess } from '@/auth/domainPolicy';
import { mapAuthError, mapFirestoreError } from '@/auth/errors';
import { roleFromClaims } from '@/auth/roles';
import type { AuthSession, AuthStatus } from '@/auth/types';
import { getMissingFirebaseConfig, isFirebaseConfigured } from '@/config/env';
import { getFirebaseServices } from '@/config/firebase';
import { syncAuthorizedProfile } from '@/firestore/profile';

interface AuthContextValue {
  status: AuthStatus;
  session: AuthSession | null;
  accessMessage: string | null;
  actionError: string | null;
  profileSyncError: string | null;
  missingConfig: string[];
  isSubmitting: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
  clearActionError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function sessionFromUser(user: User, role: AuthSession['role']): AuthSession {
  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName?.trim() || 'HBPlus member',
    photoURL: user.photoURL,
    role,
    providerIds: user.providerData.map((provider) => provider.providerId),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(isFirebaseConfigured() ? 'loading' : 'unconfigured');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [accessMessage, setAccessMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [profileSyncError, setProfileSyncError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const generation = useRef(0);

  const applyUser = useCallback(async (user: User | null) => {
    const ticket = ++generation.current;
    const stillCurrent = () => ticket === generation.current;

    if (!user) {
      if (!stillCurrent()) {
        return;
      }
      setSession(null);
      setProfileSyncError(null);
      setStatus(isFirebaseConfigured() ? 'unauthenticated' : 'unconfigured');
      return;
    }

    const decision = evaluateAccess({
      email: user.email,
      emailVerified: user.emailVerified,
    });
    if (decision.action === 'sign-out') {
      if (stillCurrent()) {
        setStatus('rejecting');
        setSession(null);
        setAccessMessage(decision.message);
      }
      await signOutFromGoogle();
      return;
    }

    let role: AuthSession['role'] = 'user';
    let claims: Record<string, unknown> | undefined;
    try {
      const token = await user.getIdTokenResult();
      claims = token.claims;
      role = roleFromClaims(claims);
    } catch {
      role = 'user';
    }

    if (!stillCurrent()) {
      return;
    }
    setSession(sessionFromUser(user, role));
    setAccessMessage(null);
    setStatus('authenticated');

    try {
      await syncAuthorizedProfile({
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        photoURL: user.photoURL,
        claims,
      });
      if (stillCurrent()) {
        setProfileSyncError(null);
      }
    } catch (error) {
      if (stillCurrent()) {
        setProfileSyncError(mapFirestoreError(error));
      }
    }
  }, []);

  useEffect(() => {
    const services = getFirebaseServices();
    if (!services) {
      setStatus('unconfigured');
      return;
    }

    let unsubscribe: () => void = () => undefined;
    let active = true;

    void (async () => {
      try {
        await completeGoogleRedirect();
      } catch (error) {
        if (active) {
          const mapped = mapAuthError(error);
          if (mapped.code !== 'cancelled') {
            setActionError(mapped.message);
          }
        }
      }
      if (!active) {
        return;
      }
      unsubscribe = onAuthStateChanged(services.auth, (user) => {
        void applyUser(user);
      });
    })();

    return () => {
      active = false;
      unsubscribe();
    };
  }, [applyUser]);

  const signIn = useCallback(async () => {
    setActionError(null);
    setAccessMessage(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      const mapped = mapAuthError(error);
      if (mapped.code !== 'cancelled') {
        setActionError(mapped.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await signOutFromGoogle();
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.assign('/login');
      }
    } catch (error) {
      setActionError(mapAuthError(error).message);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const refreshRole = useCallback(async () => {
    const services = getFirebaseServices();
    const current = services?.auth.currentUser;
    if (!current) {
      return;
    }
    setIsSubmitting(true);
    try {
      await current.getIdToken(true);
      await applyUser(current);
    } catch (error) {
      setActionError(mapAuthError(error).message);
    } finally {
      setIsSubmitting(false);
    }
  }, [applyUser]);

  const clearActionError = useCallback(() => setActionError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      accessMessage,
      actionError,
      profileSyncError,
      missingConfig: getMissingFirebaseConfig(),
      isSubmitting,
      signIn,
      signOut,
      refreshRole,
      clearActionError,
    }),
    [
      status,
      session,
      accessMessage,
      actionError,
      profileSyncError,
      isSubmitting,
      signIn,
      signOut,
      refreshRole,
      clearActionError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return value;
}
