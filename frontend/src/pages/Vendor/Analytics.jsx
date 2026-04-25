import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#EF9F27','#3B6D11','#185FA5'];

export default function VendorAnalytics() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState(7);

  useEffect(() => {
    api.get(`/vendor/analytics?days=${period}`).then(({ data }) => setData(data.data));
  }, [period]);

  if (!data) return <div className="card animate-pulse h-64" />;

  const revenueChartData = Object.entries(data.revenueMap).map(([date, revenue]) => ({
    date: new Date(date).toLocaleDateString('en-IN',{month:'short',day:'numeric'}), revenue
  }));

  const mealPieData = Object.entries(data.mealBreakdown).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="flex gap-2">
          {[7,30,90].map(d => (
            <button key={d} onClick={() => setPeriod(d)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${period===d?'bg-brand-500 text-white':'bg-white border border-gray-200 text-gray-600'}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card bg-brand-50 border-0"><p className="text-sm text-gray-500 mb-1">Total Revenue</p><p className="text-2xl font-bold text-brand-600">{formatCurrency(data.totalRevenue)}</p></div>
        <div className="card bg-forest-100 border-0"><p className="text-sm text-gray-500 mb-1">Total Orders</p><p className="text-2xl font-bold text-forest-600">{data.totalOrders}</p></div>
        <div className="card bg-coral-100 border-0"><p className="text-sm text-gray-500 mb-1">Skipped</p><p className="text-2xl font-bold text-coral-600">{data.skipped}</p></div>
        <div className="card bg-blue-50 border-0"><p className="text-sm text-gray-500 mb-1">Skip Rate</p><p className="text-2xl font-bold text-blue-600">{data.skipRate}%</p></div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueChartData}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${Math.round(v/1000)}k`} />
              <Tooltip formatter={v => [formatCurrency(v), 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#EF9F27" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4">Meal Type Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={mealPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                {mealPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
