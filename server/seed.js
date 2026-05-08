require('dotenv').config();
const { requireFirebase } = require('./config/firebase');

const seedAdmin = async () => {
  const { auth, db } = requireFirebase();
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'System Administrator';

  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env before running npm run seed');
  }

  let user;
  try {
    user = await auth.createUser({ email, password, displayName: name, emailVerified: true });
  } catch (err) {
    if (err.code !== 'auth/email-already-exists') throw err;
    user = await auth.getUserByEmail(email);
  }

  await db.collection('users').doc(user.uid).set({
    name,
    email: email.toLowerCase(),
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { merge: true });

  console.log(`Admin ready: ${email}`);
};

seedAdmin().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
