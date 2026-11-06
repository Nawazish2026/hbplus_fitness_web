import { useEffect, useState } from 'react';

import { mapFirestoreError } from '@/auth/errors';
import { subscribeToDirectory, subscribeToOwnProfile, type UserProfile } from '@/firestore/profile';

interface ProfileState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  profile: UserProfile | null;
  error: string | null;
}

interface DirectoryState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  profiles: UserProfile[];
  error: string | null;
}

export function useOwnProfile(uid: string | undefined): ProfileState {
  const [state, setState] = useState<ProfileState>({
    status: uid ? 'loading' : 'idle',
    profile: null,
    error: null,
  });

  useEffect(() => {
    if (!uid) {
      return;
    }
    setState({ status: 'loading', profile: null, error: null });
    return subscribeToOwnProfile(
      uid,
      (profile) => setState({ status: 'ready', profile, error: null }),
      (error) => {
        console.error('Profile listener rejected', error);
        setState({ status: 'error', profile: null, error: mapFirestoreError(error) });
      },
    );
  }, [uid]);

  return state;
}

export function useDirectory(enabled: boolean): DirectoryState {
  const [state, setState] = useState<DirectoryState>({
    status: enabled ? 'loading' : 'idle',
    profiles: [],
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }
    setState({ status: 'loading', profiles: [], error: null });
    return subscribeToDirectory(
      (profiles) => setState({ status: 'ready', profiles, error: null }),
      (error) => {
        console.error('Directory listener rejected', error);
        setState({ status: 'error', profiles: [], error: mapFirestoreError(error) });
      },
    );
  }, [enabled]);

  return state;
}
