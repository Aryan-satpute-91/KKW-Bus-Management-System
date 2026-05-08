const admin = require('firebase-admin');

const normalizePrivateKey = (key) => key?.replace(/\\n/g, '\n');

const required = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_STORAGE_BUCKET',
];

const missing = required.filter((key) => !process.env[key]);

if (!admin.apps.length) {
  if (missing.length > 0) {
    throw new Error(`Firebase Admin is missing environment variables: ${missing.join(', ')}`);
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const requireFirebase = () => {
  if (missing.length > 0) {
    throw new Error(`Firebase Admin is missing environment variables: ${missing.join(', ')}`);
  }

  return {
    admin,
    auth: admin.auth(),
    db: admin.firestore(),
    bucket: admin.storage().bucket(),
  };
};

module.exports = { requireFirebase };
