const express = require('express');
const router = express.Router();
const { login, forgotPassword, resetPassword, getMe, register, getUsers, toggleUser, deleteUser, sendUserPasswordReset, requestAccess, getAccessRequests, handleAccessRequest } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

// Access Requests
router.post('/request-access', requestAccess);
router.get('/access-requests', protect, adminOnly, getAccessRequests);
router.put('/access-requests/:id', protect, adminOnly, handleAccessRequest);

// Admin only routes
router.post('/register', protect, adminOnly, register);
router.get('/users', protect, adminOnly, getUsers);
router.put('/users/:id/toggle', protect, adminOnly, toggleUser);
router.post('/users/:id/password-reset', protect, adminOnly, sendUserPasswordReset);
router.delete('/users/:id', protect, adminOnly, deleteUser);

module.exports = router;
