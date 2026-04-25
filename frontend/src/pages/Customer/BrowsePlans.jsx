import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';

export default function BrowsePlans() {
  const [plans, setPlans] = useState([]);
  const [filter, setFilter] = useState({ type: '', veg: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = {};
        if (filter.type) params.type = filter.type;
        if (filter.veg !== '') params.veg = filter.veg;
        const { data } = await api.get('/meal-plans', { params });
        setPlans(data.data);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, [filter]);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Browse Tiffin Plans</h1>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {['','breakfast','lunch','dinner','combo'].map(t => (
          <button key={t} onClick={() => setFilter(f => ({ ...f, type: t }))}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter.type === t ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {t ? t.charAt(0).toUpperCase()+t.slice(1) : 'All'}
          </button>
        ))}
        <button onClick={() => setFilter(f => ({ ...f, veg: f.veg === 'true' ? '' : 'true' }))}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter.veg === 'true' ? 'bg-forest-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
          🥦 Veg Only
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="card h-40 animate-pulse bg-gray-100" />)}</div>
      ) : plans.length === 0 ? (
        <div className="card text-center py-10"><p className="text-gray-400">No plans found</p></div>
      ) : (
        <div className="space-y-4">
          {plans.map(plan => (
            <Link key={plan._id} to={`/customer/browse/${plan._id}`} className="card block hover:shadow-md transition-shadow border hover:border-brand-200">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-brand-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                  {plan.type === 'breakfast' ? '🌅' : plan.type === 'dinner' ? '🌙' : plan.type === 'combo' ? '🍽️' : '🍱'}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-500">{plan.vendor?.businessName}</p>
                    </div>
                    {plan.isVeg && <span className="text-xs bg-forest-100 text-forest-600 px-2 py-0.5 rounded-full">🟢 Veg</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{plan.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-brand-600">{formatCurrency(plan.pricePerMeal)}<span className="text-xs font-normal text-gray-400">/meal</span></span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      ⭐ {plan.ratings?.avg || 'New'} · {plan.planDuration}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
