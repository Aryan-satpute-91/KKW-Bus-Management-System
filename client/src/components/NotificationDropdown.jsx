import { useState, useEffect, useRef } from 'react';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

/* eslint-disable react-hooks/set-state-in-effect */

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getAccessRequests();
      // Filter only pending requests
      const pending = res.data.requests.filter(req => req.status === 'pending');
      setRequests(pending);
    } catch (err) {
      console.error('Error fetching access requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    
    // Poll for new requests every minute
    const interval = setInterval(fetchRequests, 60000);
    
    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAction = async (id, status) => {
    try {
      await authAPI.handleAccessRequest(id, status);
      // Refresh list after action
      fetchRequests();
    } catch (err) {
      console.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} request:`, err);
      alert(`Failed to ${status} request. Please try again.`);
    }
  };

  const handleApproveRedirect = (req) => {
    setIsOpen(false);
    navigate('/users', { state: { approveRequest: req } });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-gray-500 hover:bg-surface-low transition-colors relative"
        title="Access Requests"
      >
        <span className="material-symbols-outlined text-2xl">notifications</span>
        {requests.length > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {requests.length}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-card border border-surface-highest overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-surface-highest flex items-center justify-between bg-surface-low/50">
            <h3 className="text-sm font-semibold text-primary">Access Requests</h3>
            <button 
              onClick={fetchRequests}
              className="text-xs text-secondary hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Refresh
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && requests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin mb-2 inline-block">
                  <span className="material-symbols-outlined text-secondary">sync</span>
                </div>
                <p className="text-xs">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-20">person_add</span>
                <p className="text-sm">No pending requests</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-highest">
                {requests.map((request) => (
                  <div key={request.id} className="p-4 hover:bg-surface-low transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium text-gray-900">{request.name}</p>
                      <span className="text-[10px] text-gray-400">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 truncate">{request.email}</p>
                    <div className="bg-surface-low p-2 rounded text-[11px] text-gray-600 mb-3 border border-surface-highest">
                      <span className="font-semibold block mb-0.5">Purpose:</span>
                      {request.purpose}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveRedirect(request)}
                        className="flex-1 bg-green-600 text-white text-xs font-semibold py-1.5 rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(request.id, 'rejected')}
                        className="flex-1 bg-red-50 text-red-600 text-xs font-semibold py-1.5 rounded border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {requests.length > 0 && (
            <div className="p-2 bg-surface-low/30 border-t border-surface-highest text-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                Pending Approval
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
