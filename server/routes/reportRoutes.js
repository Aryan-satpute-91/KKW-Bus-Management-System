const express = require('express');
const router = express.Router();
const { getMonthlyReport, getBusWiseReport, getWorkTypeReport, getDashboardStats } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardStats);
router.get('/monthly', protect, getMonthlyReport);
router.get('/bus-wise', protect, getBusWiseReport);
router.get('/work-type', protect, getWorkTypeReport);

module.exports = router;
