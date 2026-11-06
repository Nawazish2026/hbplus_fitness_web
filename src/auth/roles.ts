export type UserRole = 'admin' | 'user';

/** Custom claims are server-signed. Anything other than the exact admin claim is a user. */
export function roleFromClaims(claims: Record<string, unknown> | undefined): UserRole {
  return claims?.role === 'admin' ? 'admin' : 'user';
}
