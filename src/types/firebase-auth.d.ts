import type { Persistence } from 'firebase/auth';

/**
 * Firebase publishes this helper on the React Native bundle only.
 * The shared TypeScript entry does not list it, so the app declares the runtime export.
 */
declare module 'firebase/auth' {
  export interface ReactNativeAsyncStorage {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }

  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
