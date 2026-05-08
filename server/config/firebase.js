const admin = require('firebase-admin');
const path = require('path');

const normalizePrivateKey = (key) => key?.replace(/\\n/g, '\n');

const getCredential = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccountPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    return admin.credential.cert(require(serviceAccountPath));
  }

  const required = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Firebase Admin is missing environment variables: ${missing.join(', ')}`);
  }

  return admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
  });
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: getCredential(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const requireFirebase = () => {
  if (!process.env.FIREBASE_STORAGE_BUCKET) {
    throw new Error('Firebase Admin is missing environment variable: FIREBASE_STORAGE_BUCKET');
  }

  return {
    admin,
    auth: admin.auth(),
    db: admin.firestore(),
    bucket: admin.storage().bucket(),
  };
};

module.exports = { requireFirebase };
