/** Official workspace domain. Google's `hd` hint is not a security control. */
export const OFFICIAL_EMAIL_DOMAIN = 'hbplus.fit';
export const ACCESS_RESTRICTED_MESSAGE =
  'Access restricted. Please login using your official domain email.';

const LOCAL_PART = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/;

export interface EmailIdentity {
  email: string | null | undefined;
  emailVerified: boolean;
}

export type AccessDecision =
  | { action: 'allow' }
  | { action: 'sign-out'; message: string };

/**
 * Verified addresses at exactly @hbplus.fit. Subdomains and look-alike domains fail.
 */
export function isOfficialVerifiedEmail(
  email: string | null | undefined,
  emailVerified: boolean,
): boolean {
  if (!emailVerified || typeof email !== 'string') {
    return false;
  }

  const normalized = email.normalize('NFKC').trim().toLowerCase();
  const at = normalized.indexOf('@');
  if (at <= 0 || at !== normalized.lastIndexOf('@')) {
    return false;
  }

  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  if (domain !== OFFICIAL_EMAIL_DOMAIN) {
    return false;
  }
  if (!LOCAL_PART.test(local) || local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return false;
  }

  return true;
}

/** Central sign-in gate. Unauthorized sessions must be revoked immediately. */
export function evaluateAccess(identity: EmailIdentity): AccessDecision {
  if (isOfficialVerifiedEmail(identity.email, identity.emailVerified)) {
    return { action: 'allow' };
  }
  return { action: 'sign-out', message: ACCESS_RESTRICTED_MESSAGE };
}
