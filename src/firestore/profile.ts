import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';

import { evaluateAccess } from '@/auth/domainPolicy';
import { AuthFlowError } from '@/auth/errors';
import { getFirebaseServices } from '@/config/firebase';
import {
  buildProfileCreate,
  buildProfileUpdate,
  profileFromSnapshot,
  type UserProfile,
} from '@/firestore/profileDocument';

export type { UserProfile };

interface AccountInput {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  claims: Record<string, unknown> | undefined;
}

function requireDb() {
  const services = getFirebaseServices();
  if (!services) {
    throw new AuthFlowError('Firebase is not configured.', 'config');
  }
  return services.db;
}

/** Writes the signed-in profile only after the domain gate has allowed the account. */
export async function syncAuthorizedProfile(account: AccountInput): Promise<void> {
  const decision = evaluateAccess(account);
  if (decision.action === 'sign-out' || !account.email) {
    throw new AuthFlowError(decision.action === 'sign-out' ? decision.message : 'Missing email.', 'restricted');
  }

  const db = requireDb();
  const ref = doc(db, 'users', account.uid);
  const existing = await getDoc(ref);
  const timestamps = {
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  if (!existing.exists()) {
    const created = buildProfileCreate({
      uid: account.uid,
      email: account.email,
      displayName: account.displayName,
      photoURL: account.photoURL,
      claims: account.claims,
    });
    await setDoc(ref, {
      ...created,
      ...timestamps,
      createdAt: serverTimestamp(),
    });
    return;
  }

  const update = buildProfileUpdate({
    displayName: account.displayName,
    photoURL: account.photoURL,
  });
  await updateDoc(ref, {
    ...update,
    email: account.email,
    ...timestamps,
  });
}

export function subscribeToOwnProfile(
  uid: string,
  onProfile: (profile: UserProfile | null) => void,
  onError: (error: unknown) => void,
): Unsubscribe {
  const db = requireDb();
  return onSnapshot(
    doc(db, 'users', uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        onProfile(null);
        return;
      }
      onProfile(profileFromSnapshot(snapshot.id, snapshot.data()));
    },
    onError,
  );
}

export function subscribeToDirectory(
  onProfiles: (profiles: UserProfile[]) => void,
  onError: (error: unknown) => void,
): Unsubscribe {
  const db = requireDb();
  const directory = query(collection(db, 'users'), orderBy('email'));
  return onSnapshot(
    directory,
    (snapshot) => {
      const profiles = snapshot.docs
        .map((item) => profileFromSnapshot(item.id, item.data()))
        .filter((item): item is UserProfile => item !== null);
      onProfiles(profiles);
    },
    onError,
  );
}
