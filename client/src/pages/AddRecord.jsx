import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { maintenanceAPI, busAPI } from '../services/api';
import toast from 'react-hot-toast';

const WORK_TYPES = [
  'Servicing', 'Tyre Replacement', 'Oil Change', 'Battery Replacement',
  'Repair', 'Insurance Renewal', 'Fuel', 'Cleaning', 'Other',
];

const MAX_BILL_SIZE = 5 * 1024 * 1024;

const initialForm = {
  date: new Date().toISOString().split('T')[0],
  busId: '',
  busNumber: '',
  vendorName: '',
  vendorContact: '',
  workType: '',
  description: '',
  amount: '',
};

const AddRecord = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editRecord = location.state?.record; // For edit mode

  const [form, setForm] = useState(editRecord ? {
    date: editRecord.date?.split('T')[0] || initialForm.date,
    busId: editRecord.busId?._id || editRecord.busId || '',
    busNumber: editRecord.busNumber || '',
    vendorName: editRecord.vendorName || '',
    vendorContact: editRecord.vendorContact || '',
    workType: editRecord.workType || '',
    description: editRecord.description || '',
    amount: editRecord.amount || '',
  } : initialForm);

  const [buses, setBuses] = useState([]);
  const [billFile, setBillFile] = useState(null);
  const [billPreview, setBillPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    busAPI.getAll({ status: 'active' }).then((res) => setBuses(res.data.buses)).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-set busNumber when bus is selected
      if (name === 'busId') {
        const bus = buses.find((b) => b._id === value);
        updated.busNumber = bus?.busNumber || '';
      }
      return updated;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_BILL_SIZE) {
      toast.error('Bill file must be 5MB or smaller');
      e.target.value = '';
      return;
    }
    setBillFile(file);
    if (file.type.startsWith('image/')) {
      setBillPreview(URL.createObjectURL(file));
    } else {
      setBillPreview('pdf');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.busId || !form.busNumber || !form.workType || !form.vendorName || !form.description || !form.amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (Number(form.amount) < 0) {
      toast.error('Amount must be zero or greater');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      if (billFile) formData.append('billImage', billFile);

      if (editRecord) {
        await maintenanceAPI.update(editRecord._id, formData);
        toast.success('Record updated successfully!');
      } else {
        await maintenanceAPI.create(formData);
        toast.success('Record added successfully!');
      }
      navigate('/records');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-500 hover:text-primary hover:bg-surface-low rounded-lg transition-all"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-xl font-bold text-primary">
            {editRecord ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
          </h1>
          <p className="text-sm text-gray-500">
            {editRecord ? 'Update the maintenance entry details' : 'Fill in the details for a new maintenance entry'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Info */}
        <div className="card">
          <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">info</span>
            Basic Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            {/* Bus */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Bus <span className="text-red-500">*</span>
              </label>
              <select
                name="busId"
                value={form.busId}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select Bus</option>
                {buses.map((bus) => (
                  <option key={bus._id} value={bus._id}>
                    {bus.busNumber} — {bus.model}
                  </option>
                ))}
              </select>
            </div>

            {/* Work Type */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Work Type <span className="text-red-500">*</span>
              </label>
              <select
                name="workType"
                value={form.workType}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select Work Type</option>
                {WORK_TYPES.map((wt) => (
                  <option key={wt} value={wt}>{wt}</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-medium">₹</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="input-field pl-8"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Vendor */}
        <div className="card">
          <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">store</span>
            Vendor Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vendorName"
                value={form.vendorName}
                onChange={handleChange}
                placeholder="e.g. Ram Auto Works"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Vendor Contact
              </label>
              <input
                type="text"
                name="vendorContact"
                value={form.vendorContact}
                onChange={handleChange}
                placeholder="Phone / Email"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Description */}
        <div className="card">
          <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">description</span>
            Description &amp; Bill
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the work done in detail..."
                rows={3}
                className="input-field resize-none"
                required
              />
            </div>

            {/* Bill Upload */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Upload Bill / Receipt
              </label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-secondary hover:bg-blue-50/50 transition-all group">
                <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-secondary mb-2 transition-colors">
                  cloud_upload
                </span>
                <p className="text-sm text-gray-500 group-hover:text-secondary font-medium transition-colors">
                  Click to upload or drag &amp; drop
                </p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 5MB</p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {/* Preview */}
              {billPreview && (
                <div className="mt-3 relative inline-block">
                  {billPreview === 'pdf' ? (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                      <span className="material-symbols-outlined text-red-600">picture_as_pdf</span>
                      <span className="text-sm text-red-700 font-medium">{billFile?.name}</span>
                    </div>
                  ) : (
                    <img src={billPreview} alt="Preview" className="h-32 rounded-lg border border-surface-highest object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => { setBillFile(null); setBillPreview(null); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">save</span>
                {editRecord ? 'Update Record' : 'Save Record'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRecord;
