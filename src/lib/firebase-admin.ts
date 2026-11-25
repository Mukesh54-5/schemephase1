import crypto from 'crypto';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const ephemeralSigningSecret = crypto.randomBytes(32).toString('hex');

export const adminAuth = getAuth();
export const firebaseProjectId = firebaseConfig.projectId;
export const sessionSigningKey =
  process.env.SESSION_SECRET ||
  process.env.SQL_PASSWORD ||
  ephemeralSigningSecret;
