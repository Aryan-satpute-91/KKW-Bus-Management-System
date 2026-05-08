const express = require('express');
const router = express.Router();
const { getRecords, getRecord, createRecord, updateRecord, deleteRecord } = require('../controllers/maintenanceController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getRecords);
router.get('/:id', protect, getRecord);
router.post('/', protect, upload.single('billImage'), createRecord);
router.put('/:id', protect, upload.single('billImage'), updateRecord);
router.delete('/:id', protect, adminOnly, deleteRecord);

module.exports = router;
