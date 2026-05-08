import { useState, useEffect } from 'react';
import { busAPI } from '../services/api';
import { useAuth } from '../context/useAuth';
import toast from 'react-hot-toast';

/* eslint-disable react-hooks/set-state-in-effect */

const STATUS_BADGE = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  under_maintenance: 'bg-amber-100 text-amber-700',
};

const STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  under_maintenance: 'Under Maintenance',
};

const EMPTY_FORM = {
  busNumber: '',
  registrationNo: '',
  model: '',
  year: '',
  capacity: '',
  status: 'active',
  notes: '',
};

const Buses = () => {
  const { isAdmin } = useAuth();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBus, setEditBus] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const res = await busAPI.getAll();
      setBuses(res.data.buses);
    } catch {
      toast.error('Failed to load buses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBuses(); }, []);

  const openAdd = () => {
    setEditBus(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (bus) => {
    setEditBus(bus);
    setForm({
      busNumber: bus.busNumber,
      registrationNo: bus.registrationNo || '',
      model: bus.model || '',
      year: bus.year || '',
      capacity: bus.capacity || '',
      status: bus.status,
      notes: bus.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.busNumber) {
      toast.error('Bus number is required');
      return;
    }
    if (form.year) {
      const year = Number(form.year);
      const maxYear = new Date().getFullYear() + 1;
      if (!Number.isInteger(year) || year < 1990 || year > maxYear) {
        toast.error(`Year must be between 1990 and ${maxYear}`);
        return;
      }
    }
    if (form.capacity && Number(form.capacity) < 1) {
      toast.error('Capacity must be at least 1');
      return;
    }
    setSaving(true);
    try {
      if (editBus) {
        await busAPI.update(editBus._id, form);
        toast.success('Bus updated');
      } else {
        await busAPI.create(form);
        toast.success('Bus added');
      }
      setShowModal(false);
      fetchBuses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await busAPI.delete(deleteTarget._id);
      toast.success('Bus removed');
      setDeleteTarget(null);
      fetchBuses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const activeCount = buses.filter((b) => b.status === 'active').length;
  const underMaintCount = buses.filter((b) => b.status === 'under_maintenance').length;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary">Fleet Management</h1>
          <p className="text-sm text-gray-500">
            {buses.length} buses · {activeCount} active · {underMaintCount} under maintenance
          </p>
        </div>
        {isAdmin && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">add</span>
            Add Bus
          </button>
        )}
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : buses.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
          <span className="material-symbols-outlined text-5xl mb-3">directions_bus</span>
          <p className="font-medium">No buses in fleet</p>
          {isAdmin && (
            <button onClick={openAdd} className="btn-primary mt-4 text-sm">
              Add First Bus
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {buses.map((bus) => (
            <div key={bus._id} className="card hover:shadow-card-hover transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-2xl">directions_bus</span>
                </div>
                <span className={`badge ${STATUS_BADGE[bus.status]}`}>
                  {STATUS_LABELS[bus.status]}
                </span>
              </div>
              <h3 className="text-lg font-bold text-primary">{bus.busNumber}</h3>
              <p className="text-sm text-gray-600">{bus.model || 'Unknown Model'}</p>
              <div className="mt-3 space-y-1.5 text-xs text-gray-500">
                {bus.registrationNo && (
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">badge</span>
                    {bus.registrationNo}
                  </div>
                )}
                {bus.year && (
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    Year: {bus.year}
                  </div>
                )}
                {bus.capacity && (
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">airline_seat_recline_normal</span>
                    {bus.capacity} seats
                  </div>
                )}
              </div>
              {isAdmin && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-surface-highest">
                  <button
                    onClick={() => openEdit(bus)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-secondary border border-secondary rounded hover:bg-blue-50 transition-colors font-medium"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(bus)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors font-medium"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-highest">
              <h3 className="font-semibold text-primary">{editBus ? 'Edit Bus' : 'Add New Bus'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Bus Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.busNumber}
                    onChange={(e) => setForm((p) => ({ ...p, busNumber: e.target.value.toUpperCase() }))}
                    placeholder="e.g. KKW-01"
                    className="input-field"
                    required
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    className="input-field"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="under_maintenance">Under Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Registration No.</label>
                  <input
                    type="text"
                    value={form.registrationNo}
                    onChange={(e) => setForm((p) => ({ ...p, registrationNo: e.target.value }))}
                    placeholder="MH15-AB-1234"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Model</label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}
                    placeholder="Ashok Leyland"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Year</label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
                    placeholder="2020"
                    min="1990"
                    max="2030"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Capacity</label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                    placeholder="45"
                    min="1"
                    className="input-field"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Additional notes..."
                    rows={2}
                    className="input-field resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                  {editBus ? 'Update' : 'Add Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600">warning</span>
              </div>
              <h3 className="font-semibold text-gray-800">Remove Bus?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              This will remove <strong>{deleteTarget.busNumber}</strong> from the fleet. Existing maintenance records will be preserved.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 btn-outline">Cancel</button>
              <button onClick={handleDelete} className="flex-1 btn-danger">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Buses;
