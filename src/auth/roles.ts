export type UserRole = 'admin' | 'user';

export function roleFromClaims(claims: Record<string, unknown> | undefined): UserRole {
  return claims?.role === 'admin' ? 'admin' : 'user';
}
