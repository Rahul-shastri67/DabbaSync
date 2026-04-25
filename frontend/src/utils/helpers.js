export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const getMealEmoji = (type) => ({ breakfast: '🌅', lunch: '🍱', dinner: '🌙' }[type] || '🍽️');

export const getStatusColor = (status) => ({
  scheduled:        'badge-gray',
  preparing:        'badge-amber',
  out_for_delivery: 'badge-amber',
  delivered:        'badge-green',
  skipped:          'badge-gray',
  cancelled:        'badge-coral',
  active:           'badge-green',
  paused:           'badge-amber',
  expired:          'badge-gray',
}[status] || 'badge-gray');

export const countdown = (targetDate) => {
  const diff = new Date(targetDate) - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
  const hours   = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { hours, minutes, seconds, expired: false };
};
