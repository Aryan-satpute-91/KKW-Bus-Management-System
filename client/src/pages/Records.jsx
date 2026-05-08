import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { maintenanceAPI, busAPI } from '../services/api';
import RecordTable from '../components/RecordTable';
import BillModal from '../components/BillModal';
import { useAuth } from '../context/useAuth';
import toast from 'react-hot-toast';

/* eslint-disable react-hooks/set-state-in-effect */

const WORK_TYPES = [
  'All', 'Servicing', 'Tyre Replacement', 'Oil Change', 'Battery Replacement',
  'Repair', 'Insurance Renewal', 'Fuel', 'Cleaning', 'Other',
];

const Records = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    busNumber: '',
    workType: '',
    startDate: '',
    endDate: '',
  });

  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 10,
        ...filters,
        workType: filters.workType === 'All' ? '' : filters.workType,
      };
      const res = await maintenanceAPI.getAll(params);
      setRecords(res.data.records);
      setPagination((p) => ({ ...p, pages: res.data.pages, total: res.data.total }));
    } catch {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    busAPI.getAll().then((res) => setBuses(res.data.buses)).catch(console.error);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleReset = () => {
    setFilters({ search: '', busNumber: '', workType: '', startDate: '', endDate: '' });
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await maintenanceAPI.delete(deleteTarget._id);
      toast.success('Record deleted');
      setDeleteTarget(null);
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary">Maintenance Records</h1>
          <p className="text-sm text-gray-500">{pagination.total} total records</p>
        </div>
        <button
          onClick={() => navigate('/add-record')}
          className="btn-primary flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Add Record
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative xl:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
            </div>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search vendor, bus, description..."
              className="input-field pl-10"
            />
          </div>

          {/* Bus filter */}
          <select
            name="busNumber"
            value={filters.busNumber}
            onChange={handleFilterChange}
            className="input-field"
          >
            <option value="">All Buses</option>
            {buses.map((b) => (
              <option key={b._id} value={b.busNumber}>{b.busNumber}</option>
            ))}
          </select>

          {/* Work type filter */}
          <select
            name="workType"
            value={filters.workType}
            onChange={handleFilterChange}
            className="input-field"
          >
            {WORK_TYPES.map((wt) => (
              <option key={wt} value={wt}>{wt}</option>
            ))}
          </select>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="btn-outline flex items-center justify-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined text-base">filter_alt_off</span>
            Reset
          </button>
        </div>

        {/* Date range */}
        <div className="flex gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium whitespace-nowrap">From:</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="input-field text-sm py-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium whitespace-nowrap">To:</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="input-field text-sm py-2"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <RecordTable
          records={records}
          loading={loading}
          onView={setSelectedBill}
          onEdit={(record) => navigate('/add-record', { state: { record } })}
          onDelete={setDeleteTarget}
          isAdmin={isAdmin}
        />

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-highest bg-surface-low">
            <p className="text-xs text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page <= 1}
                className="p-2 text-gray-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="p-2 text-gray-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bill Modal */}
      {selectedBill && <BillModal record={selectedBill} onClose={() => setSelectedBill(null)} />}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600">warning</span>
              </div>
              <h3 className="font-semibold text-gray-800">Delete Record?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              This will permanently delete the maintenance record for{' '}
              <strong>{deleteTarget.busNumber}</strong> — {deleteTarget.workType}. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Records;
