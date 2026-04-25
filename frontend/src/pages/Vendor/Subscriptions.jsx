import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function VendorSubs() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vendor/subscriptions').then(({ data }) => setSubs(data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Subscribers</h1>
        <span className="badge-amber">{subs.length} active</span>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Phone</th>
              <th className="pb-3 font-medium">Plan</th>
              <th className="pb-3 font-medium">Start</th>
              <th className="pb-3 font-medium">End</th>
              <th className="pb-3 font-medium">Skips</th>
              <th className="pb-3 font-medium">Bill</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : subs.map(s => (
              <tr key={s._id} className="hover:bg-gray-50">
                <td className="py-3 font-medium">{s.customer?.name}</td>
                <td className="py-3 text-gray-500">{s.customer?.phone}</td>
                <td className="py-3 text-gray-500">{s.mealPlan?.name}</td>
                <td className="py-3 text-gray-500">{formatDate(s.startDate)}</td>
                <td className="py-3 text-gray-500">{formatDate(s.endDate)}</td>
                <td className="py-3"><span className={`badge-${s.skippedDays?.length > 0 ? 'coral' : 'green'}`}>{s.skippedDays?.length || 0}</span></td>
                <td className="py-3 font-semibold text-forest-600">{formatCurrency(s.adjustedBill)}</td>
              </tr>
            ))}
            {!loading && subs.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No active subscribers</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
