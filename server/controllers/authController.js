const { requireFirebase } = require('../config/firebase');

const nowIso = () => new Date().toISOString();

const userFromDoc = (doc) => ({ id: doc.id, ...doc.data() });

const login = async (req, res) => {
  res.status(410).json({
    success: false,
    message: 'Login is handled by Firebase Auth on the client. Send the Firebase ID token to protected API routes.',
  });
};

const forgotPassword = async (req, res) => {
  res.status(410).json({
    success: false,
    message: 'Password reset emails are sent by Firebase Auth on the client.',
  });
};

const resetPassword = async (req, res) => {
  res.status(410).json({
    success: false,
    message: 'Password reset is handled by Firebase Auth on the client.',
  });
};

const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

const register = async (req, res) => {
  try {
    const { auth, db } = requireFirebase();
    const { name, email, password, role = 'staff' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let authUser;

    try {
      authUser = await auth.createUser({
        email: normalizedEmail,
        password,
        displayName: name,
        emailVerified: false,
        disabled: false,
      });
    } catch (err) {
      if (err.code !== 'auth/email-already-exists') throw err;
      authUser = await auth.getUserByEmail(normalizedEmail);
    }

    const userRef = db.collection('users').doc(authUser.uid);
    const existing = await userRef.get();
    const payload = {
      name,
      email: normalizedEmail,
      role,
      is_active: true,
      updated_at: nowIso(),
    };

    if (!existing.exists) payload.created_at = nowIso();
    await userRef.set(payload, { merge: true });

    res.status(existing.exists ? 200 : 201).json({
      success: true,
      alreadyRegistered: existing.exists,
      message: existing.exists ? 'User already exists. Profile updated.' : 'User created successfully.',
      user: { id: authUser.uid, ...payload },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { db } = requireFirebase();
    const snap = await db.collection('users').orderBy('created_at', 'desc').get();
    res.json({ success: true, users: snap.docs.map(userFromDoc) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const toggleUser = async (req, res) => {
  try {
    const { auth, db } = requireFirebase();
    const userRef = db.collection('users').doc(req.params.id);
    const snap = await userRef.get();

    if (!snap.exists) return res.status(404).json({ success: false, message: 'User not found' });

    const nextActive = !snap.data().is_active;
    await userRef.update({ is_active: nextActive, updated_at: nowIso() });
    await auth.updateUser(req.params.id, { disabled: !nextActive });

    res.json({ success: true, message: `User ${nextActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { auth, db } = requireFirebase();
    const userId = req.params.id;

    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot remove your own account' });
    }

    const snap = await db.collection('users').doc(userId).get();
    if (!snap.exists) return res.status(404).json({ success: false, message: 'User not found' });

    await db.collection('users').doc(userId).delete();
    await auth.deleteUser(userId);

    res.json({ success: true, message: `${snap.data().name} removed successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const sendUserPasswordReset = async (req, res) => {
  try {
    const { auth, db } = requireFirebase();
    const snap = await db.collection('users').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ success: false, message: 'User not found' });

    const link = await auth.generatePasswordResetLink(snap.data().email);
    res.json({
      success: true,
      message: 'Password reset link generated. Send it to the user or use client email reset.',
      resetLink: link,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const requestAccess = async (req, res) => {
  try {
    const { db } = requireFirebase();
    const { name, email, purpose } = req.body;
    if (!name || !email || !purpose) {
      return res.status(400).json({ success: false, message: 'Please fill all fields' });
    }

    await db.collection('access_requests').add({
      name,
      email: email.toLowerCase().trim(),
      purpose,
      status: 'pending',
      created_at: nowIso(),
    });

    res.status(201).json({ success: true, message: 'Request sent to administrator' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAccessRequests = async (req, res) => {
  try {
    const { db } = requireFirebase();
    const snap = await db.collection('access_requests').orderBy('created_at', 'desc').get();
    res.json({ success: true, requests: snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const handleAccessRequest = async (req, res) => {
  try {
    const { db } = requireFirebase();
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid request status' });
    }

    const ref = db.collection('access_requests').doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ success: false, message: 'Request not found' });

    await ref.update({
      status,
      reviewed_by: req.user.id,
      reviewed_by_name: req.user.name,
      reviewed_at: nowIso(),
    });

    res.json({ success: true, message: `Request ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
  getMe,
  register,
  getUsers,
  toggleUser,
  deleteUser,
  sendUserPasswordReset,
  requestAccess,
  getAccessRequests,
  handleAccessRequest,
};
