import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export default function SkipCalendar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sub, setSub] = useState(null);
  const [skipped, setSkipped] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  useEffect(() => {
    api.get(`/subscriptions/my`).then(({ data }) => {
      const s = data.data.find(s => s._id === id);
      if (!s) return navigate('/customer/subscriptions');
      setSub(s);
      setSkipped(new Set(s.skippedDays?.map(d => new Date(d).toISOString().slice(0,10)) || []));
    });
  }, [id, navigate]);

  if (!sub) return <div className="p-6 card animate-pulse h-64" />;

  const daysInMonth = new Date(year, month+1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const subStart = new Date(sub.startDate);
  const subEnd   = new Date(sub.endDate);

  const inRange = (d) => { const dt = new Date(year, month, d); return dt >= subStart && dt <= subEnd && dt >= new Date(); };
  const key = (d) => new Date(year, month, d).toISOString().slice(0,10);

  const toggle = (d) => {
    if (!inRange(d)) return;
    const k = key(d);
    setSkipped(prev => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const existing = new Set(sub.skippedDays?.map(d => new Date(d).toISOString().slice(0,10)));
      const toSkip   = [...skipped].filter(d => !existing.has(d));
      const toUnskip = [...existing].filter(d => !skipped.has(d));

      if (toSkip.length) await api.post('/subscriptions/skip', { subscriptionId: id, dates: toSkip });
      for (const d of toUnskip) await api.post('/subscriptions/unskip', { subscriptionId: id, date: d });

      toast.success('Skip calendar saved!');
      navigate('/customer/subscriptions');
    } catch (err) { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const activeDays = sub.totalDays - skipped.size;
  const adjustedBill = sub.pricePerMeal * Math.max(0, activeDays);

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500">← Back</button>
      <h1 className="text-xl font-bold">Skip Days</h1>
      <p className="text-sm text-gray-500">{sub.mealPlan?.name} · Tap dates to skip</p>

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }} className="btn-outline px-3 py-1.5 text-sm">←</button>
        <span className="font-semibold">{new Date(year, month).toLocaleString('en-IN',{month:'long',year:'numeric'})}</span>
        <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }} className="btn-outline px-3 py-1.5 text-sm">→</button>
      </div>

      {/* Calendar */}
      <div className="card">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map(d => <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[...Array(firstDay)].map((_, i) => <div key={`e${i}`} />)}
          {[...Array(daysInMonth)].map((_, i) => {
            const d = i+1; const k = key(d);
            const inR = inRange(d);
            const isSkip = skipped.has(k);
            return (
              <button key={d} onClick={() => toggle(d)} disabled={!inR}
                className={`aspect-square rounded-lg text-sm font-medium transition-all flex items-center justify-center
                  ${!inR ? 'text-gray-300 cursor-default' : isSkip ? 'bg-coral-100 text-coral-600 border border-coral-300' : 'hover:bg-brand-50 hover:text-brand-700 text-gray-700'}`}>
                {d}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-coral-100 border border-coral-300 rounded inline-block" /> Skipped</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-white border border-gray-200 rounded inline-block" /> Active</span>
        </div>
      </div>

      {/* Live bill */}
      <div className="card bg-gradient-to-br from-brand-50 to-orange-50 border-brand-200">
        <h3 className="font-semibold mb-3">Updated Bill</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Base ({sub.totalDays} days)</span><span>{formatCurrency(sub.baseBill)}</span></div>
          <div className="flex justify-between"><span className="text-coral-600">{skipped.size} skips</span><span className="text-coral-600">−{formatCurrency(skipped.size * sub.pricePerMeal)}</span></div>
          <div className="flex justify-between font-bold text-base border-t border-brand-200 pt-2 mt-1">
            <span>You Pay</span><span className="text-forest-600">{formatCurrency(adjustedBill)}</span>
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
        {saving ? 'Saving...' : 'Save Skip Calendar'}
      </button>
    </div>
  );
}
