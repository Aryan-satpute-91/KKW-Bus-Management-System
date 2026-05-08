const { requireFirebase } = require('../config/firebase');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const normalizeRecord = (doc) => ({ id: doc.id, ...doc.data() });

const getAllRecords = async (db) => {
  const snap = await db.collection('maintenance_records').get();
  return snap.docs.map(normalizeRecord);
};

const groupBy = (records, key) => {
  const grouped = {};
  records.forEach((record) => {
    const label = record[key] || 'Unknown';
    if (!grouped[label]) grouped[label] = { totalAmount: 0, count: 0 };
    grouped[label].totalAmount += Number(record.amount || 0);
    grouped[label].count += 1;
  });
  return Object.entries(grouped)
    .map(([id, value]) => ({ _id: id, ...value }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
};

const getDashboardStats = async (req, res) => {
  try {
    const { db } = requireFirebase();
    const records = await getAllRecords(db);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalExpenses = records.reduce((sum, record) => sum + Number(record.amount || 0), 0);
    const monthRecords = records.filter((record) => {
      const date = new Date(record.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    const monthlyExpenses = monthRecords.reduce((sum, record) => sum + Number(record.amount || 0), 0);

    const recentRecords = records
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .slice(0, 5)
      .map((record) => ({
        _id: record.id,
        date: record.date,
        busNumber: record.bus_number,
        workType: record.work_type,
        vendorName: record.vendor_name,
        amount: record.amount,
        billImage: record.bill_image,
      }));

    res.json({
      success: true,
      stats: {
        totalExpenses,
        totalRecords: records.length,
        monthlyExpenses,
        monthlyCount: monthRecords.length,
      },
      recentRecords,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    const { db } = requireFirebase();
    const year = Number(req.query.year) || new Date().getFullYear();
    const records = (await getAllRecords(db)).filter((record) => new Date(record.date).getFullYear() === year);

    const data = MONTHS.map((month, index) => {
      const bucket = records.filter((record) => new Date(record.date).getMonth() === index);
      return {
        month,
        totalAmount: bucket.reduce((sum, record) => sum + Number(record.amount || 0), 0),
        count: bucket.length,
      };
    });

    res.json({ success: true, year, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getBusWiseReport = async (req, res) => {
  try {
    const { db } = requireFirebase();
    const data = groupBy(await getAllRecords(db), 'bus_number');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getWorkTypeReport = async (req, res) => {
  try {
    const { db } = requireFirebase();
    const data = groupBy(await getAllRecords(db), 'work_type');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboardStats, getMonthlyReport, getBusWiseReport, getWorkTypeReport };
