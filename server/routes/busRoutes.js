const express = require('express');
const router = express.Router();
const { getBuses, createBus, updateBus, deleteBus } = require('../controllers/busController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getBuses);
router.post('/', protect, adminOnly, createBus);
router.put('/:id', protect, adminOnly, updateBus);
router.delete('/:id', protect, adminOnly, deleteBus);

module.exports = router;
