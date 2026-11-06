import { readFileSync } from 'node:fs';

import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

import { isOfficialVerifiedEmail } from '../src/auth/domainPolicy.ts';

const [uid, requestedRole] = process.argv.slice(2);
const role = requestedRole ?? 'admin';

if (!uid || (role !== 'admin' && role !== 'user')) {
  console.error('Usage: npm run set-role -- <uid> <admin|user>');
  process.exit(1);
}

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const app = serviceAccountPath
  ? initializeApp({
      credential: cert(JSON.parse(readFileSync(serviceAccountPath, 'utf8'))),
    })
  : initializeApp({
      credential: applicationDefault(),
    });

const auth = getAuth(app);
const user = await auth.getUser(uid);

if (!isOfficialVerifiedEmail(user.email, user.emailVerified)) {
  console.error('Refusing to set a role. The account needs a verified @hbplus.fit email.');
  process.exit(1);
}

await auth.setCustomUserClaims(uid, { role });
await auth.revokeRefreshTokens(uid);

const profile = getFirestore(app).collection('users').doc(uid);
const existing = await profile.get();
if (existing.exists) {
  await profile.set(
    {
      role,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

console.log(`Set role=${role} for ${user.email}. That person must sign in again to receive the new token.`);
