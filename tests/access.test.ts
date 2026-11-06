import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ACCESS_RESTRICTED_MESSAGE, evaluateAccess, isOfficialVerifiedEmail } from '../src/auth/domainPolicy.ts';
import { roleFromClaims } from '../src/auth/roles.ts';
import { buildProfileCreate, buildProfileUpdate, sanitizePhotoUrl } from '../src/firestore/profileDocument.ts';
import { resolveRoute } from '../src/navigation/routeGuard.ts';

describe('official domain gate', () => {
  it('uses the required rejection copy', () => {
    assert.equal(
      ACCESS_RESTRICTED_MESSAGE,
      'Access restricted. Please login using your official domain email.',
    );
  });

  it('allows a verified official address, including case and plus tags', () => {
    assert.equal(isOfficialVerifiedEmail('ada@hbplus.fit', true), true);
    assert.equal(isOfficialVerifiedEmail('  Ada.Lovelace@HBPLUS.FIT ', true), true);
    assert.equal(isOfficialVerifiedEmail('dev+ops@hbplus.fit', true), true);
  });

  it('rejects other domains, subdomains, and unverified mail', () => {
    const rejected = [
      ['ada@gmail.com', true],
      ['ada@yahoo.com', true],
      ['ada@hbplus.fitness', true],
      ['ada@hbplus.fit.com', true],
      ['ada@mail.hbplus.fit', true],
      ['ada@hbplus.fit.evil.com', true],
      ['ada@not-hbplus.fit', true],
      ['ada@hbplus.fit', false],
      ['@hbplus.fit', true],
      ['ada@@hbplus.fit', true],
      ['ada@hbplus.fit extra', true],
      [null, true],
    ] as const;

    for (const [email, verified] of rejected) {
      assert.equal(isOfficialVerifiedEmail(email, verified), false, String(email));
      assert.deepEqual(evaluateAccess({ email, emailVerified: verified }), {
        action: 'sign-out',
        message: ACCESS_RESTRICTED_MESSAGE,
      });
    }
  });

  it('keeps a verified official session', () => {
    assert.deepEqual(evaluateAccess({ email: 'ada@hbplus.fit', emailVerified: true }), {
      action: 'allow',
    });
  });
});

describe('roles and profile writes', () => {
  it('accepts only an exact admin claim', () => {
    assert.equal(roleFromClaims({ role: 'admin' }), 'admin');
    assert.equal(roleFromClaims({ role: 'Admin' }), 'user');
    assert.equal(roleFromClaims({ role: 'user' }), 'user');
    assert.equal(roleFromClaims(undefined), 'user');
  });

  it('builds creates from claims and strips unsafe photos', () => {
    const created = buildProfileCreate({
      uid: 'uid-1',
      email: 'ada@hbplus.fit',
      displayName: '  Ada  ',
      photoURL: 'javascript:alert(1)',
      claims: { role: 'admin' },
    });
    assert.equal(created.role, 'admin');
    assert.equal(created.photoURL, null);
    assert.equal(created.displayName, 'Ada');
    assert.equal(sanitizePhotoUrl('https://example.com/a.png'), 'https://example.com/a.png');
  });

  it('does not let an update choose a role', () => {
    const update = buildProfileUpdate({
      displayName: 'Grace',
      photoURL: 'http://example.com/a.png',
    });
    assert.equal('role' in update, false);
    assert.equal(update.photoURL, null);
  });
});

describe('protected routes', () => {
  it('sends signed-out visitors away from the app', () => {
    assert.equal(resolveRoute('unauthenticated', ['(app)', 'profile']), '/login');
    assert.equal(resolveRoute('unconfigured', ['(app)']), '/login');
    assert.equal(resolveRoute('unauthenticated', ['login']), null);
  });

  it('sends a signed-in member to the dashboard', () => {
    assert.equal(resolveRoute('authenticated', ['login']), '/');
    assert.equal(resolveRoute('authenticated', ['(app)']), null);
  });

  it('does not navigate while a session is still being judged', () => {
    assert.equal(resolveRoute('loading', ['(app)']), null);
    assert.equal(resolveRoute('rejecting', ['login']), null);
  });
});
