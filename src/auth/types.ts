import type { UserRole } from './roles';

export type AuthStatus =
  | 'loading'
  | 'rejecting'
  | 'unconfigured'
  | 'unauthenticated'
  | 'authenticated';

export interface AuthSession {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  providerIds: string[];
}
