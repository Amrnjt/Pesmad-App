import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required server environment variable: ${name}`);
  return value;
}

export function getFirebaseAdminApp(): App {
  if (getApps().length > 0) return getApp();

  return initializeApp({
    credential: cert({
      projectId: requiredEnv('FIREBASE_PROJECT_ID'),
      clientEmail: requiredEnv('FIREBASE_CLIENT_EMAIL'),
      privateKey: requiredEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    }),
  });
}

export function getAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getPesmadFirestore() {
  const databaseId = requiredEnv('FIREBASE_DATABASE_ID');
  return getFirestore(getFirebaseAdminApp(), databaseId);
}
