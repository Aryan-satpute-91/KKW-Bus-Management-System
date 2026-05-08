import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import toast from 'react-hot-toast';

/* eslint-disable react-hooks/set-state-in-effect */

const EMPTY_FORM = { name: '', email: '', password: '', role: 'staff' };

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [resettingUserId, setResettingUserId] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('users');
  const [requests, setRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authAPI.getUsers();
      setUsers(res.data.users);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    setReqLoading(true);
    try {
      const res = await authAPI.getAccessRequests();
      setRequests(res.data.requests);
    } catch {
      toast.error('Failed to load access requests');
    } finally {
      setReqLoading(false);
    }
  };

  const handleApproveClick = (req) => {
    setForm({
      name: req.name,
      email: req.email,
      password: '', // Admin sets initial password
      role: 'staff',
      requestId: req.id // Keep track of the request being approved
    });
    setActiveTab('users');
    setShowModal(true);
  };

  useEffect(() => { 
    if (activeTab === 'users') fetchUsers(); 
    else fetchRequests();
  }, [activeTab]);

  useEffect(() => {
    if (location.state?.approveRequest) {
      handleApproveClick(location.state.approveRequest);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.register(form);
      
      // If this was from an access request, update its status to approved
      if (form.requestId) {
        await authAPI.handleAccessRequest(form.requestId, 'approved');
      }
      await sendPasswordResetEmail(auth, form.email);

      if (res.data.alreadyRegistered) {
        toast.success(res.data.message || 'User already exists. Reset link sent.');
      } else {
        toast.success(res.data.message || 'User created successfully');
      }
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchUsers();
      if (activeTab === 'requests') fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (userId) => {
    try {
      const res = await authAPI.toggleUser(userId);
      toast.success(res.data.message);
      fetchUsers();
    } catch {
      toast.error('Failed to toggle user');
    }
  };

  const handleRequest = async (id, status) => {
    try {
      await authAPI.handleAccessRequest(id, status);
      toast.success(`Request ${status}`);
      fetchRequests();
    } catch {
      toast.error('Failed to update request');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await authAPI.deleteUser(deleteTarget.id);
      toast.success(res.data.message || 'User removed');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove user');
    } finally {
      setDeleting(false);
    }
  };

  const handleSendReset = async (userId) => {
    setResettingUserId(userId);
    try {
      const target = users.find((u) => u.id === userId);
      if (!target?.email) throw new Error('User email not found');
      await sendPasswordResetEmail(auth, target.email);
      toast.success(`Password reset link sent to ${target.email}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setResettingUserId(null);
    }
  };

  const visibleRequests = activeTab === 'requests'
    ? requests.filter((r) => r.status === 'pending')
    : requests.filter((r) => r.status !== 'pending');

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary">System Access</h1>
          <p className="text-sm text-gray-500">Manage users and access requests</p>
        </div>
        <div className="flex gap-2 bg-surface-low p-1 rounded-lg border border-surface-highest">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === 'users' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Requests
            {requests.filter(r => r.status === 'pending').length > 0 && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            History
          </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <>
          <div className="flex justify-end">
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-xl">person_add</span>
              Add User
            </button>
          </div>

          <div className="card p-0 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="table-header text-left rounded-tl-lg">User</th>
                    <th className="table-header text-left">Email</th>
                    <th className="table-header text-center">Role</th>
                    <th className="table-header text-center">Status</th>
                    <th className="table-header text-center rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="table-row">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{u.email}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`badge ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-blue-50 text-secondary'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`badge ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {u.id !== currentUser?.id && (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleToggle(u.id)}
                              className={`text-xs font-medium px-3 py-1.5 rounded transition-colors ${
                                u.is_active
                                  ? 'text-red-600 hover:bg-red-50 border border-red-200'
                                  : 'text-green-600 hover:bg-green-50 border border-green-200'
                              }`}
                            >
                              {u.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            {u.is_active && (
                              <button
                                onClick={() => handleSendReset(u.id)}
                                disabled={resettingUserId === u.id}
                                className="text-xs font-medium px-3 py-1.5 rounded transition-colors text-secondary hover:bg-blue-50 border border-blue-200 disabled:opacity-60"
                              >
                                {resettingUserId === u.id ? 'Sending...' : 'Send Reset Link'}
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteTarget(u)}
                              className="text-xs font-medium px-3 py-1.5 rounded transition-colors text-red-700 hover:bg-red-50 border border-red-200"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <div className="card p-0 overflow-hidden">
          {reqLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : visibleRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <span className="material-symbols-outlined text-5xl mb-2">inbox</span>
              <p>{activeTab === 'requests' ? 'No pending requests' : 'No access history yet'}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-header text-left">Requester</th>
                  <th className="table-header text-left">Purpose</th>
                  <th className="table-header text-center">Status</th>
                  <th className="table-header text-center">Date</th>
                  {activeTab === 'history' && <th className="table-header text-center">Reviewed By</th>}
                  <th className="table-header text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRequests.map((r) => (
                  <tr key={r.id} className="table-row">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-800">{r.name}</div>
                      <div className="text-xs text-gray-500">{r.email}</div>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-gray-600 text-xs line-clamp-2" title={r.purpose}>{r.purpose}</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`badge ${
                        r.status === 'pending' ? 'bg-amber-50 text-amber-600' : 
                        r.status === 'approved' ? 'bg-green-50 text-green-600' : 
                        'bg-red-50 text-red-500'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString('en-IN')}
                    </td>
                    {activeTab === 'history' && (
                      <td className="py-4 px-4 text-center text-xs text-gray-500">
                        <div>{r.reviewed_by_name || 'Unknown'}</div>
                        {r.reviewed_at && (
                          <div className="text-gray-400">{new Date(r.reviewed_at).toLocaleDateString('en-IN')}</div>
                        )}
                      </td>
                    )}
                    <td className="py-4 px-4 text-center">
                      {r.status === 'pending' && (
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleApproveClick(r)}
                            className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Approve & Create User"
                          >
                            <span className="material-symbols-outlined text-lg">person_add</span>
                          </button>
                          <button 
                            onClick={() => handleRequest(r.id, 'rejected')}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Reject"
                          >
                            <span className="material-symbols-outlined text-lg">cancel</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-highest">
              <h3 className="font-semibold text-primary">Create New User</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="John Doe"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="user@kkwagh.edu.in"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Password *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Min 6 characters"
                  className="input-field"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  className="input-field"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600">person_remove</span>
              </div>
              <h3 className="font-semibold text-gray-800">Remove User?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              This will remove <strong>{deleteTarget.name}</strong> from system access. Their old maintenance records will remain for history.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="flex-1 btn-outline">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleting}
                className="flex-1 btn-danger flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
