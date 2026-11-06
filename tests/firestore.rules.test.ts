import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, it } from 'node:test';

import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const PROJECT_ID = 'demo-hbplus-auth';

let testEnv: RulesTestEnvironment;

function profile(uid: string, email: string, role: 'admin' | 'user') {
  return {
    uid,
    email,
    displayName: 'Ada Lovelace',
    photoURL: 'https://example.com/ada.png',
    role,
    emailVerified: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };
}

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

after(async () => {
  await testEnv.cleanup();
});

describe('Firestore rules', () => {
  it('blocks anonymous reads and writes', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'users', 'ada')));
    await assertFails(setDoc(doc(db, 'users', 'ada'), profile('ada', 'ada@hbplus.fit', 'user')));
  });

  it('blocks verified email outside the official domain', async () => {
    const db = testEnv.authenticatedContext('ada', {
      email: 'ada@gmail.com',
      email_verified: true,
    }).firestore();
    await assertFails(getDoc(doc(db, 'users', 'ada')));
    await assertFails(setDoc(doc(db, 'users', 'ada'), profile('ada', 'ada@gmail.com', 'user')));
  });

  it('blocks an unverified official address', async () => {
    const db = testEnv.authenticatedContext('ada', {
      email: 'ada@hbplus.fit',
      email_verified: false,
    }).firestore();
    await assertFails(setDoc(doc(db, 'users', 'ada'), profile('ada', 'ada@hbplus.fit', 'user')));
  });

  it('lets a verified member read and create only their own user profile', async () => {
    const db = testEnv.authenticatedContext('ada', {
      email: 'ada@hbplus.fit',
      email_verified: true,
    }).firestore();
    const own = doc(db, 'users', 'ada');
    await assertSucceeds(setDoc(own, profile('ada', 'ada@hbplus.fit', 'user')));
    await assertSucceeds(getDoc(own));
    await assertSucceeds(updateDoc(own, {
      displayName: 'Grace Hopper',
      photoURL: 'https://example.com/grace.png',
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    }));
    await assertFails(getDoc(doc(db, 'users', 'grace')));
    await assertFails(setDoc(doc(db, 'users', 'grace'), profile('grace', 'ada@hbplus.fit', 'user')));
    await assertFails(getDocs(collection(db, 'users')));
    await assertFails(setDoc(doc(db, 'secrets', 'payroll'), { amount: 1 }));
  });

  it('rejects privilege escalation and unsafe fields', async () => {
    const db = testEnv.authenticatedContext('ada', {
      email: 'ada@hbplus.fit',
      email_verified: true,
    }).firestore();
    const own = doc(db, 'users', 'ada');
    await assertSucceeds(setDoc(own, profile('ada', 'ada@hbplus.fit', 'user')));
    await assertFails(updateDoc(own, { role: 'admin', updatedAt: serverTimestamp() }));
    await assertFails(setDoc(doc(db, 'users', 'other'), profile('other', 'ada@hbplus.fit', 'admin')));
    await assertFails(updateDoc(own, { photoURL: 'javascript:alert(1)', updatedAt: serverTimestamp() }));
    await assertFails(updateDoc(own, { email: 'ada@gmail.com', updatedAt: serverTimestamp() }));
  });

  it('lets an admin claim read the directory and blocks a member from forging that claim', async () => {
    const member = testEnv.authenticatedContext('ada', {
      email: 'ada@hbplus.fit',
      email_verified: true,
      role: 'user',
    }).firestore();
    await assertSucceeds(setDoc(doc(member, 'users', 'ada'), profile('ada', 'ada@hbplus.fit', 'user')));

    const admin = testEnv.authenticatedContext('grace', {
      email: 'grace@hbplus.fit',
      email_verified: true,
      role: 'admin',
    }).firestore();
    await assertSucceeds(setDoc(doc(admin, 'users', 'grace'), profile('grace', 'grace@hbplus.fit', 'admin')));
    await assertSucceeds(getDoc(doc(admin, 'users', 'ada')));
    await assertSucceeds(getDocs(collection(admin, 'users')));

    const outsiderAdmin = testEnv.authenticatedContext('mallory', {
      email: 'mallory@gmail.com',
      email_verified: true,
      role: 'admin',
    }).firestore();
    await assertFails(getDocs(collection(outsiderAdmin, 'users')));
    await assertFails(getDoc(doc(outsiderAdmin, 'users', 'ada')));
  });
});
