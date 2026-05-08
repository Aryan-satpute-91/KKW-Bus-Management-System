import { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#000666', '#005faf', '#1a237e', '#3949ab', '#5c6bc0', '#8690ee', '#bdc2ff', '#e8eaf6', '#c5cae9'];

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-surface-highest rounded-lg p-3 shadow-card text-xs">
        <p className="font-semibold text-primary mb-1">{label}</p>
        <p className="text-secondary">₹{Number(payload[0].value).toLocaleString('en-IN')}</p>
        <p className="text-gray-400">{payload[0].payload?.count} entries</p>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-surface-highest rounded-lg p-3 shadow-card text-xs">
        <p className="font-semibold text-primary">{payload[0].name}</p>
        <p className="text-secondary">₹{Number(payload[0].value).toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return percent > 0.05 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

const Reports = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [monthly, setMonthly] = useState([]);
  const [busWise, setBusWise] = useState([]);
  const [workType, setWorkType] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [mRes, bRes, wRes] = await Promise.all([
          reportAPI.getMonthly(selectedYear),
          reportAPI.getBusWise(),
          reportAPI.getWorkType(),
        ]);
        setMonthly(mRes.data.data);
        setBusWise(bRes.data.data.map((d) => ({ name: d._id, value: d.totalAmount, count: d.count })));
        setWorkType(wRes.data.data.map((d) => ({ name: d._id, value: d.totalAmount, count: d.count })));
      } catch (err) {
        console.error('Reports error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [selectedYear]);

  const totalMonthly = monthly.reduce((sum, d) => sum + d.totalAmount, 0);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary">Expense Reports</h1>
          <p className="text-sm text-gray-500">Analytics and summaries for bus maintenance</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium">Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="input-field py-2 w-28"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card border-l-4 border-l-primary">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total ({selectedYear})</p>
          <p className="text-2xl font-bold text-primary mt-1">₹{totalMonthly.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400 mt-1">Annual maintenance spend</p>
        </div>
        <div className="card border-l-4 border-l-secondary">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Highest Bus Expense</p>
          <p className="text-2xl font-bold text-secondary mt-1">
            {busWise[0] ? busWise[0].name : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {busWise[0] ? `₹${busWise[0].value.toLocaleString('en-IN')}` : 'No data'}
          </p>
        </div>
        <div className="card border-l-4 border-l-accent">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top Work Type</p>
          <p className="text-2xl font-bold text-accent mt-1">
            {workType[0] ? workType[0].name : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {workType[0] ? `₹${workType[0].value.toLocaleString('en-IN')}` : 'No data'}
          </p>
        </div>
      </div>

      {/* Monthly Bar Chart */}
      <div className="card">
        <h3 className="font-semibold text-primary mb-4">Monthly Expense Breakdown — {selectedYear}</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthly} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar dataKey="totalAmount" fill="#005faf" radius={[4, 4, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bus-wise + Work Type Pie Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bus-wise */}
        <div className="card">
          <h3 className="font-semibold text-primary mb-4">Bus-wise Expenses</h3>
          {busWise.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={busWise}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {busWise.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Table */}
              <div className="mt-4 space-y-2">
                {busWise.map((bus, i) => (
                  <div key={bus.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="font-medium text-gray-700">{bus.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500">
                      <span>{bus.count} entries</span>
                      <span className="font-semibold text-primary w-24 text-right">
                        ₹{Number(bus.value).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-400 flex-col gap-2">
              <span className="material-symbols-outlined text-4xl">bar_chart</span>
              <p className="text-sm">No bus data yet</p>
            </div>
          )}
        </div>

        {/* Work Type */}
        <div className="card">
          <h3 className="font-semibold text-primary mb-4">Expense by Work Type</h3>
          {workType.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={workType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {workType.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {workType.map((wt, i) => (
                  <div key={wt.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="font-medium text-gray-700">{wt.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500">
                      <span>{wt.count} entries</span>
                      <span className="font-semibold text-primary w-24 text-right">
                        ₹{Number(wt.value).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-400 flex-col gap-2">
              <span className="material-symbols-outlined text-4xl">donut_large</span>
              <p className="text-sm">No work type data yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
