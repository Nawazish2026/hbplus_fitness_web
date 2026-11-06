const firebaseApiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim() ?? '';
const firebaseAuthDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? '';
const firebaseProjectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? '';
const firebaseStorageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ?? '';
const firebaseMessagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? '';
const firebaseAppId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim() ?? '';
const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? '';
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() ?? '';
const googleAndroidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() ?? '';

export interface PublicConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  googleWebClientId: string;
  googleIosClientId: string;
  googleAndroidClientId: string;
  useAuthEmulator: boolean;
  authEmulatorUrl: string;
  firestoreEmulatorHost: string;
  firestoreEmulatorPort: number;
}

function missingFirebaseKeys(): string[] {
  const entries: Array<[string, string]> = [
    ['EXPO_PUBLIC_FIREBASE_API_KEY', firebaseApiKey],
    ['EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', firebaseAuthDomain],
    ['EXPO_PUBLIC_FIREBASE_PROJECT_ID', firebaseProjectId],
    ['EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', firebaseStorageBucket],
    ['EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', firebaseMessagingSenderId],
    ['EXPO_PUBLIC_FIREBASE_APP_ID', firebaseAppId],
  ];
  return entries.filter(([, value]) => value.length === 0).map(([key]) => key);
}

export const publicConfig: PublicConfig = {
  firebase: {
    apiKey: firebaseApiKey,
    authDomain: firebaseAuthDomain,
    projectId: firebaseProjectId,
    storageBucket: firebaseStorageBucket,
    messagingSenderId: firebaseMessagingSenderId,
    appId: firebaseAppId,
  },
  googleWebClientId,
  googleIosClientId,
  googleAndroidClientId,
  useAuthEmulator: __DEV__ && process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true',
  authEmulatorUrl: process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_URL?.trim() || 'http://127.0.0.1:9099',
  firestoreEmulatorHost: process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST?.trim() || '127.0.0.1',
  firestoreEmulatorPort: Number(process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT ?? '8080') || 8080,
};

export function getMissingFirebaseConfig(): string[] {
  return missingFirebaseKeys();
}

export function isFirebaseConfigured(): boolean {
  return missingFirebaseKeys().length === 0;
}
