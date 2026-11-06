import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, type Auth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';

import { createAuth } from '@/config/authPersistence';
import { isFirebaseConfigured, publicConfig } from '@/config/env';

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

let services: FirebaseServices | null = null;

export function getFirebaseServices(): FirebaseServices | null {
  if (!isFirebaseConfigured()) {
    return null;
  }
  if (services) {
    return services;
  }

  const app = getApps()[0] ?? initializeApp(publicConfig.firebase);
  const auth = createAuth(app);
  const db = getFirestore(app);

  if (publicConfig.useAuthEmulator) {
    try {
      connectAuthEmulator(auth, publicConfig.authEmulatorUrl, { disableWarnings: true });
      connectFirestoreEmulator(db, publicConfig.firestoreEmulatorHost, publicConfig.firestoreEmulatorPort);
    } catch {}
  }

  services = { app, auth, db };
  return services;
}
