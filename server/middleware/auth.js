const { requireFirebase } = require('../config/firebase');

const protect = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const { auth, db } = requireFirebase();
    const decoded = await auth.verifyIdToken(token);
    const userSnap = await db.collection('users').doc(decoded.uid).get();

    if (!userSnap.exists) {
      return res.status(401).json({ success: false, message: 'User profile not found' });
    }

    const user = { id: userSnap.id, ...userSnap.data() };
    if (!user.is_active) {
      return res.status(401).json({ success: false, message: 'User is deactivated' });
    }

    req.firebaseUser = decoded;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: err.message || 'Token invalid or expired' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Admin access required' });
};

module.exports = { protect, adminOnly };
