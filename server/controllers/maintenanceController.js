const path = require('path');
const { randomUUID } = require('crypto');
const { requireFirebase } = require('../config/firebase');

const WORK_TYPES = [
  'Servicing', 'Tyre Replacement', 'Oil Change', 'Battery Replacement',
  'Repair', 'Insurance Renewal', 'Fuel', 'Cleaning', 'Other',
];

const nowIso = () => new Date().toISOString();

const normalizeRecord = (doc) => {
  const r = doc.data();
  return {
    _id: doc.id,
    id: doc.id,
    date: r.date,
    busId: r.bus_id,
    busNumber: r.bus_number,
    vendorName: r.vendor_name,
    vendorContact: r.vendor_contact || '',
    workType: r.work_type,
    description: r.description,
    amount: r.amount,
    billImage: r.bill_image || '',
    billPath: r.bill_path || '',
    addedBy: r.added_by,
    addedByName: r.added_by_name,
    createdAt: r.created_at,
  };
};

const validateRecordPayload = (body, partial = false) => {
  const required = ['date', 'busNumber', 'vendorName', 'workType', 'description', 'amount'];
  if (!partial) {
    const missing = required.find((field) => !body[field]);
    if (missing) return `${missing} is required`;
  }
  if (body.date && Number.isNaN(Date.parse(body.date))) return 'Invalid maintenance date';
  if (body.workType && !WORK_TYPES.includes(body.workType)) return 'Invalid work type';
  if (body.amount !== undefined && (!Number.isFinite(Number(body.amount)) || Number(body.amount) < 0)) return 'Amount must be a valid positive number';
  return null;
};

const uploadBill = async (bucket, file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const filePath = `bills/bill-${Date.now()}-${randomUUID()}${ext}`;
  const storageFile = bucket.file(filePath);
  await storageFile.save(file.buffer, { metadata: { contentType: file.mimetype } });
  const [url] = await storageFile.getSignedUrl({ action: 'read', expires: '2500-01-01' });
  return { url, path: filePath };
};

const deleteBill = async (bucket, filePath) => {
  if (!filePath) return;
  try {
    await bucket.file(filePath).delete({ ignoreNotFound: true });
  } catch (err) {
    console.warn(`Could not delete bill ${filePath}: ${err.message}`);
  }
};

const getAllRecords = async (db) => {
  const snap = await db.collection('maintenance_records').get();
  return snap.docs.map(normalizeRecord);
};

const getRecords = async (req, res) => {
  try {
    const { db } = requireFirebase();
    const { busNumber, workType, startDate, endDate, search, page = 1, limit = 10 } = req.query;
    let records = await getAllRecords(db);

    if (busNumber) records = records.filter((r) => r.busNumber === busNumber.toUpperCase());
    if (workType) records = records.filter((r) => r.workType === workType);
    if (startDate) records = records.filter((r) => r.date >= startDate);
    if (endDate) records = records.filter((r) => r.date <= endDate);
    if (search) {
      const term = search.toLowerCase();
      records = records.filter((r) => [r.vendorName, r.description, r.busNumber].some((value) => value?.toLowerCase().includes(term)));
    }

    records.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const total = records.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const start = (pageNum - 1) * limitNum;

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.max(1, Math.ceil(total / limitNum)),
      records: records.slice(start, start + limitNum),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getRecord = async (req, res) => {
  try {
    const { db } = requireFirebase();
    const doc = await db.collection('maintenance_records').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, record: normalizeRecord(doc) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createRecord = async (req, res) => {
  try {
    const { db, bucket } = requireFirebase();
    const validationError = validateRecordPayload(req.body);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const bill = req.file ? await uploadBill(bucket, req.file) : { url: '', path: '' };
    const payload = {
      date: req.body.date,
      bus_id: req.body.busId || '',
      bus_number: req.body.busNumber.toUpperCase(),
      vendor_name: req.body.vendorName,
      vendor_contact: req.body.vendorContact || '',
      work_type: req.body.workType,
      description: req.body.description,
      amount: Number(req.body.amount),
      bill_image: bill.url,
      bill_path: bill.path,
      added_by: req.user.id,
      added_by_name: req.user.name,
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    const ref = await db.collection('maintenance_records').add(payload);
    const doc = await ref.get();
    res.status(201).json({ success: true, record: normalizeRecord(doc) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateRecord = async (req, res) => {
  try {
    const { db, bucket } = requireFirebase();
    const validationError = validateRecordPayload(req.body, true);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const ref = db.collection('maintenance_records').doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ success: false, message: 'Record not found' });

    const existingData = existing.data();
    if (req.user.role !== 'admin' && existingData.added_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this record' });
    }

    const payload = { updated_at: nowIso() };
    const map = {
      date: 'date',
      busId: 'bus_id',
      busNumber: 'bus_number',
      vendorName: 'vendor_name',
      vendorContact: 'vendor_contact',
      workType: 'work_type',
      description: 'description',
      amount: 'amount',
    };

    Object.entries(map).forEach(([bodyKey, dbKey]) => {
      if (req.body[bodyKey] !== undefined) payload[dbKey] = bodyKey === 'amount' ? Number(req.body[bodyKey]) : req.body[bodyKey];
    });
    if (payload.bus_number) payload.bus_number = payload.bus_number.toUpperCase();

    if (req.file) {
      await deleteBill(bucket, existingData.bill_path);
      const bill = await uploadBill(bucket, req.file);
      payload.bill_image = bill.url;
      payload.bill_path = bill.path;
    }

    await ref.update(payload);
    const doc = await ref.get();
    res.json({ success: true, record: normalizeRecord(doc) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const { db, bucket } = requireFirebase();
    const ref = db.collection('maintenance_records').doc(req.params.id);
    const doc = await ref.get();
    if (doc.exists) await deleteBill(bucket, doc.data().bill_path);
    await ref.delete();
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getRecords, getRecord, createRecord, updateRecord, deleteRecord };
