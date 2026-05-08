import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportAPI } from '../services/api';
import StatCard from '../components/StatCard';
import RecordTable from '../components/RecordTable';
import BillModal from '../components/BillModal';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../context/useAuth';

const MonthlyTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-surface-highest rounded-lg p-3 shadow-card text-sm">
        <p className="font-semibold text-primary">{label}</p>
        <p className="text-secondary">₹{Number(payload[0].value).toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, monthlyRes] = await Promise.all([
          reportAPI.getDashboard(),
          reportAPI.getMonthly(new Date().getFullYear()),
        ]);
        setStats(dashRes.data.stats);
        setRecentRecords(dashRes.data.recentRecords);
        setMonthlyData(monthlyRes.data.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
            {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here's what's happening with your fleet today</p>
        </div>
        <Link
          to="/add-record"
          className="btn-primary flex items-center gap-2 hidden sm:flex"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Add Record
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Expenses"
          value={loading ? '—' : `₹${Number(stats?.totalExpenses || 0).toLocaleString('en-IN')}`}
          icon="currency_rupee"
          color="navy"
          subtitle="All time"
        />
        <StatCard
          title="This Month"
          value={loading ? '—' : `₹${Number(stats?.monthlyExpenses || 0).toLocaleString('en-IN')}`}
          icon="calendar_month"
          color="blue"
          subtitle={`${stats?.monthlyCount || 0} entries`}
        />
        <StatCard
          title="Total Records"
          value={loading ? '—' : (stats?.totalRecords || 0).toLocaleString('en-IN')}
          icon="list_alt"
          color="green"
          subtitle="All maintenance entries"
        />
        <StatCard
          title="Quick Actions"
          value="Add Record"
          icon="add_circle"
          color="orange"
          subtitle="Click to add entry"
        />
      </div>

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly Chart */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-primary text-base">Monthly Expenses — {new Date().getFullYear()}</h3>
            <Link to="/reports" className="text-xs text-secondary hover:underline font-medium">View Full Report →</Link>
          </div>
          {loading ? (
            <div className="h-56 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip content={<MonthlyTooltip />} />
                <Bar dataKey="totalAmount" fill="#005faf" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick Summary */}
        <div className="card flex flex-col">
          <h3 className="font-semibold text-primary text-base mb-4">Quick Info</h3>
          <div className="space-y-4 flex-1">
            {[
              { icon: 'build', label: 'Active Buses', color: 'bg-blue-50 text-secondary' },
              { icon: 'warning', label: 'Pending Alerts', color: 'bg-orange-50 text-orange-600' },
              { icon: 'receipt_long', label: 'Bills Uploaded', color: 'bg-green-50 text-green-600' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 bg-surface-low rounded-lg">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.color}`}>
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                </div>
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
          <Link to="/reports" className="btn-outline text-center mt-4 flex items-center justify-center gap-2 text-sm">
            <span className="material-symbols-outlined text-lg">analytics</span>
            Full Reports
          </Link>
        </div>
      </div>

      {/* Recent Records */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-primary text-base">Recent Maintenance Records</h3>
          <Link to="/records" className="text-xs text-secondary hover:underline font-medium">View All →</Link>
        </div>
        <RecordTable
          records={recentRecords}
          loading={loading}
          onView={setSelectedBill}
          isAdmin={false}
        />
      </div>

      {selectedBill && <BillModal record={selectedBill} onClose={() => setSelectedBill(null)} />}
    </div>
  );
};

export default Dashboard;
