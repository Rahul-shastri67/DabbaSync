import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/meal-plans/${id}`).then(({ data }) => setPlan(data.data)).catch(() => navigate('/customer/browse'));
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
    setStartDate(tomorrow.toISOString().slice(0,10));
  }, [id, navigate]);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/subscriptions', { mealPlanId: id, startDate });
      toast.success('Subscription created! Proceed to payment.');
      navigate(`/customer/subscriptions`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  if (!plan) return <div className="p-6 card animate-pulse h-64" />;

  const totalDays = { daily:1, weekly:7, monthly:30 }[plan.planDuration] || 30;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 flex items-center gap-1">← Back</button>

      <div className="card">
        <div className="text-4xl mb-3">{plan.type === 'breakfast' ? '🌅' : plan.type === 'dinner' ? '🌙' : '🍱'}</div>
        <h1 className="text-xl font-bold text-gray-900">{plan.name}</h1>
        <p className="text-gray-500 text-sm mt-1">{plan.vendor?.businessName} · {plan.vendor?.address?.city}</p>
        <p className="text-gray-600 text-sm mt-2">{plan.description}</p>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-brand-600">{formatCurrency(plan.pricePerMeal)}</p>
            <p className="text-xs text-gray-400">per meal</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-gray-900">{totalDays}</p>
            <p className="text-xs text-gray-400">days</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-forest-600">{formatCurrency(plan.totalPrice)}</p>
            <p className="text-xs text-gray-400">total</p>
          </div>
        </div>
      </div>

      {plan.menu?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-3">Weekly Menu</h3>
          <div className="space-y-2">
            {plan.menu.map((m, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="font-medium text-gray-500 w-16 capitalize">{m.day}</span>
                <span className="text-gray-700">{m.items?.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold mb-3">Choose Start Date</h3>
        <input type="date" className="input" value={startDate}
          min={new Date(Date.now()+86400000).toISOString().slice(0,10)}
          onChange={e => setStartDate(e.target.value)} />
        <div className="mt-4 bg-brand-50 rounded-xl p-3 text-sm text-brand-700">
          📅 Subscription: {new Date(startDate).toLocaleDateString('en-IN')} → {new Date(new Date(startDate).getTime()+(totalDays-1)*86400000).toLocaleDateString('en-IN')}
        </div>
        <button onClick={handleSubscribe} disabled={loading} className="btn-primary w-full mt-4">
          {loading ? 'Setting up...' : `Subscribe for ${formatCurrency(plan.totalPrice)}`}
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">Skip meals anytime · Bill auto-adjusts</p>
      </div>
    </div>
  );
}
