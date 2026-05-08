const { requireFirebase } = require('../config/firebase');

const nowIso = () => new Date().toISOString();

const normalizeBus = (doc) => {
  const data = doc.data();
  return {
    _id: doc.id,
    id: doc.id,
    busNumber: data.bus_number,
    registrationNo: data.registration_no || '',
    model: data.model || '',
    year: data.year || '',
    capacity: data.capacity || '',
    status: data.status || 'active',
    notes: data.notes || '',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

const normalizePayload = (body) => ({
  bus_number: (body.busNumber || body.bus_number || '').toUpperCase().trim(),
  registration_no: body.registrationNo || body.registration_no || '',
  model: body.model || '',
  year: body.year ? Number(body.year) : null,
  capacity: body.capacity ? Number(body.capacity) : null,
  status: body.status || 'active',
  notes: body.notes || '',
});

const validateBusPayload = (payload, partial = false) => {
  if (!partial && !payload.bus_number) return 'Bus number is required';
  if (payload.status && !['active', 'inactive', 'under_maintenance'].includes(payload.status)) return 'Invalid bus status';
  if (payload.year && (!Number.isInteger(payload.year) || payload.year < 1990 || payload.year > new Date().getFullYear() + 1)) return 'Invalid bus year';
  if (payload.capacity && (!Number.isInteger(payload.capacity) || payload.capacity < 1 || payload.capacity > 100)) return 'Invalid bus capacity';
  return null;
};

const getBuses = async (req, res) => {
  try {
    const { db } = requireFirebase();
    const snap = await db.collection('buses').get();
    let buses = snap.docs.map(normalizeBus).sort((a, b) => a.busNumber.localeCompare(b.busNumber));
    if (req.query.status) buses = buses.filter((bus) => bus.status === req.query.status);
    res.json({ success: true, count: buses.length, buses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createBus = async (req, res) => {
  try {
    const { db } = requireFirebase();
    const payload = normalizePayload(req.body);
    const validationError = validateBusPayload(payload);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const duplicate = await db.collection('buses').where('bus_number', '==', payload.bus_number).limit(1).get();
    if (!duplicate.empty) return res.status(400).json({ success: false, message: 'Bus number already exists' });

    const ref = await db.collection('buses').add({ ...payload, created_at: nowIso(), updated_at: nowIso() });
    const bus = await ref.get();
    res.status(201).json({ success: true, bus: normalizeBus(bus) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateBus = async (req, res) => {
  try {
    const { db } = requireFirebase();
    const ref = db.collection('buses').doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ success: false, message: 'Bus not found' });

    const payload = normalizePayload(req.body);
    const validationError = validateBusPayload(payload, true);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    await ref.update({ ...payload, updated_at: nowIso() });
    const bus = await ref.get();
    res.json({ success: true, bus: normalizeBus(bus) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteBus = async (req, res) => {
  try {
    const { db } = requireFirebase();
    await db.collection('buses').doc(req.params.id).delete();
    res.json({ success: true, message: 'Bus removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getBuses, createBus, updateBus, deleteBus };
