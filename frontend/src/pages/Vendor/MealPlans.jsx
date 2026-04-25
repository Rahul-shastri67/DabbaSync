import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const BLANK = { name:'', description:'', type:'lunch', planDuration:'monthly', pricePerMeal:'', isVeg:true, tags:'' };

export default function VendorPlans() {
  const [plans, setPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    const { data } = await api.get('/meal-plans'); // shows all; vendor can filter later
    setPlans(data.data);
  };
  useEffect(() => { fetchPlans(); }, []);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.post('/vendor/meal-plans', { ...form, pricePerMeal: +form.pricePerMeal, tags: form.tags.split(',').map(t=>t.trim()) });
      toast.success('Meal plan created!');
      setShowForm(false); setForm(BLANK); fetchPlans();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id, isActive) => {
    try {
      await api.put(`/vendor/meal-plans/${id}`, { isActive: !isActive });
      toast.success('Updated'); fetchPlans();
    } catch { toast.error('Failed'); }
  };

  const f = (field) => ({ value: form[field], onChange: e => setForm({ ...form, [field]: e.target.value }) });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Meal Plans</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">+ New Plan</button>
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-semibold">Create New Meal Plan</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label><input className="input" placeholder="Ghar ka Khana" {...f('name')} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Price per Meal (₹)</label><input className="input" type="number" placeholder="100" {...f('pricePerMeal')} /></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="input" {...f('type')}>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="combo">Combo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select className="input" {...f('planDuration')}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea className="input resize-none" rows={2} placeholder="Describe your tiffin..." {...f('description')} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label><input className="input" placeholder="Home-cooked, No preservatives" {...f('tags')} /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="veg" checked={form.isVeg} onChange={e => setForm({ ...form, isVeg: e.target.checked })} className="rounded" />
            <label htmlFor="veg" className="text-sm text-gray-700">Vegetarian only</label>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={saving} className="btn-primary text-sm">{saving ? 'Creating...' : 'Create Plan'}</button>
            <button onClick={() => setShowForm(false)} className="btn-outline text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {plans.map(plan => (
          <div key={plan._id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-xs text-gray-400 capitalize">{plan.type} · {plan.planDuration}</p>
              </div>
              <div className="flex items-center gap-2">
                {plan.isVeg && <span className="text-xs text-forest-600">🟢</span>}
                <button onClick={() => toggleActive(plan._id, plan.isActive)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${plan.isActive ? 'bg-forest-100 text-forest-600' : 'bg-gray-100 text-gray-500'}`}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{plan.description}</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-600">{formatCurrency(plan.pricePerMeal)}<span className="text-xs font-normal text-gray-400">/meal</span></span>
              <span className="text-xs text-gray-400">⭐ {plan.ratings?.avg || 'New'} ({plan.ratings?.count || 0})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
