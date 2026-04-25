const cron = require('node-cron');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');

const initCronJobs = () => {
  // Lock cancellations 1hr before delivery — runs every minute
  cron.schedule('* * * * *', async () => {
    try {
      const oneHourFromNow = new Date(Date.now() + 60*60*1000);
      await Order.updateMany(
        { scheduledAt: { $lte: oneHourFromNow }, isCancelable: true, status: { $in: ['scheduled','preparing'] } },
        { isCancelable: false }
      );
    } catch (err) { console.error('[cron:lock-cancel]', err.message); }
  });

  // 7:30 AM — breakfast reminder
  cron.schedule('30 7 * * *', () => sendMealReminders('breakfast', '8:00 AM'));
  // 1:00 PM — lunch reminder
  cron.schedule('0 13 * * *', () => sendMealReminders('lunch', '1:30 PM'));
  // 7:30 PM — dinner reminder
  cron.schedule('30 19 * * *', () => sendMealReminders('dinner', '8:00 PM'));

  // 10 PM daily — expire ended subscriptions
  cron.schedule('0 22 * * *', async () => {
    try {
      await Subscription.updateMany({ endDate: { $lt: new Date() }, status: 'active' }, { status: 'expired' });
      console.log('[cron:expire-subs] done');
    } catch (err) { console.error('[cron:expire-subs]', err.message); }
  });

  // 11 PM — auto-mark out_for_delivery orders as delivered
  cron.schedule('0 23 * * *', async () => {
    try {
      const today = new Date(); today.setHours(0,0,0,0);
      await Order.updateMany(
        { orderDate: { $gte: today }, status: 'out_for_delivery' },
        { status: 'delivered', $push: { statusHistory: { status: 'delivered', note: 'Auto-marked by system' } } }
      );
    } catch (err) { console.error('[cron:auto-deliver]', err.message); }
  });

  console.log('⏰ Cron jobs initialized');
};

const sendMealReminders = async (mealType, time) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
    const orders = await Order.find({
      orderDate: { $gte: today, $lt: tomorrow },
      mealType, status: { $nin: ['skipped','cancelled'] }
    }).select('customer');

    const notifications = orders.map(o => ({
      user: o.customer,
      title: `${mealType.charAt(0).toUpperCase()+mealType.slice(1)} arriving soon!`,
      message: `Your ${mealType} tiffin arrives at ${time}. Get ready! 🍱`,
      type: 'meal_reminder'
    }));
    if (notifications.length) await Notification.insertMany(notifications);
    console.log(`[cron:${mealType}-reminder] Notified ${orders.length} customers`);
  } catch (err) { console.error(`[cron:${mealType}-reminder]`, err.message); }
};

module.exports = { initCronJobs };
