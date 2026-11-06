import { roleFromClaims, type UserRole } from '../auth/roles';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  emailVerified: true;
  createdAt: Date | null;
  updatedAt: Date | null;
  lastLoginAt: Date | null;
}

export interface ProfileCreate {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  emailVerified: true;
}

export interface ProfileUpdate {
  displayName: string;
  photoURL: string | null;
  emailVerified: true;
}

const HTTPS_URL = /^https:\/\/.+/;

export function sanitizeDisplayName(value: string | null | undefined): string {
  const cleaned = (value ?? '').normalize('NFKC').replace(/[\u0000-\u001F\u007F]/g, '').trim();
  if (!cleaned) {
    return 'HBPlus member';
  }
  return cleaned.slice(0, 120);
}

export function sanitizePhotoUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!HTTPS_URL.test(trimmed) || trimmed.length > 2048) {
    return null;
  }
  return trimmed;
}

/**
 * Role always comes from the signed custom claim. Callers cannot pass a role.
 * Updates omit role so a client cannot promote or demote the stored profile.
 */
export function buildProfileCreate(input: {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  claims: Record<string, unknown> | undefined;
}): ProfileCreate {
  return {
    uid: input.uid,
    email: input.email,
    displayName: sanitizeDisplayName(input.displayName),
    photoURL: sanitizePhotoUrl(input.photoURL),
    role: roleFromClaims(input.claims),
    emailVerified: true,
  };
}

export function buildProfileUpdate(input: {
  displayName: string | null;
  photoURL: string | null;
}): ProfileUpdate {
  return {
    displayName: sanitizeDisplayName(input.displayName),
    photoURL: sanitizePhotoUrl(input.photoURL),
    emailVerified: true,
  };
}

export function profileFromSnapshot(id: string, data: Record<string, unknown>): UserProfile | null {
  if (typeof data.email !== 'string' || typeof data.displayName !== 'string') {
    return null;
  }
  const role: UserRole = data.role === 'admin' ? 'admin' : 'user';
  return {
    uid: typeof data.uid === 'string' ? data.uid : id,
    email: data.email,
    displayName: data.displayName,
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
    role,
    emailVerified: true,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    lastLoginAt: toDate(data.lastLoginAt),
  };
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const toDateFn = (value as { toDate?: unknown }).toDate;
    if (typeof toDateFn === 'function') {
      const date = toDateFn.call(value);
      return date instanceof Date ? date : null;
    }
  }
  return null;
}
