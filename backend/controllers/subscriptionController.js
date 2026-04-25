const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const MealPlan = require('../models/MealPlan');
const Vendor = require('../models/Vendor');

exports.createSubscription = async (req, res) => {
  try {
    const { mealPlanId, startDate, deliveryAddress, deliveryInstructions } = req.body;
    const plan = await MealPlan.findById(mealPlanId).populate('vendor');
    if (!plan) return res.status(404).json({ success: false, message: 'Meal plan not found' });

    const days = { daily: 1, weekly: 7, monthly: 30 }[plan.planDuration] || 30;
    const start = new Date(startDate);
    const end = new Date(start); end.setDate(end.getDate() + days - 1);

    const sub = await Subscription.create({
      customer: req.user.id, vendor: plan.vendor._id, mealPlan: plan._id,
      startDate: start, endDate: end,
      pricePerMeal: plan.pricePerMeal, totalDays: days,
      baseBill: plan.pricePerMeal * days, adjustedBill: plan.pricePerMeal * days,
      deliveryAddress, deliveryInstructions,
      status: 'pending_payment'
    });
    res.status(201).json({ success: true, data: sub });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMySubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ customer: req.user.id })
      .populate('vendor', 'businessName logo').populate('mealPlan', 'name type pricePerMeal images').sort({ createdAt: -1 });
    res.json({ success: true, data: subs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.skipMeals = async (req, res) => {
  try {
    const { subscriptionId, dates } = req.body;
    const sub = await Subscription.findOne({ _id: subscriptionId, customer: req.user.id });
    if (!sub) return res.status(404).json({ success: false, message: 'Not found' });
    const skipDates = dates.map(d => new Date(d));
    const existing = sub.skippedDays.map(d => d.toISOString().slice(0,10));
    sub.skippedDays.push(...skipDates.filter(d => !existing.includes(d.toISOString().slice(0,10))));
    sub.adjustedBill = sub.pricePerMeal * (sub.totalDays - sub.skippedDays.length);
    await sub.save();
    await Order.updateMany({ subscription: sub._id, orderDate: { $in: skipDates }, status: 'scheduled' }, { status: 'skipped' });
    const io = req.app.get('io');
    io.to(`vendor-${sub.vendor}`).emit('skip_update', { customerId: req.user.id, skippedDates: skipDates, newCount: sub.totalDays - sub.skippedDays.length });
    res.json({ success: true, adjustedBill: sub.adjustedBill, skippedDays: sub.skippedDays });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.unskipMeal = async (req, res) => {
  try {
    const { subscriptionId, date } = req.body;
    const sub = await Subscription.findOne({ _id: subscriptionId, customer: req.user.id });
    if (!sub) return res.status(404).json({ success: false, message: 'Not found' });
    const dt = new Date(date).toISOString().slice(0,10);
    sub.skippedDays = sub.skippedDays.filter(d => d.toISOString().slice(0,10) !== dt);
    sub.adjustedBill = sub.pricePerMeal * (sub.totalDays - sub.skippedDays.length);
    await sub.save();
    res.json({ success: true, adjustedBill: sub.adjustedBill, skippedDays: sub.skippedDays });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.pauseSubscription = async (req, res) => {
  try {
    const { pausedFrom, pausedUntil } = req.body;
    const sub = await Subscription.findOneAndUpdate(
      { _id: req.params.id, customer: req.user.id },
      { status: 'paused', pausedFrom: new Date(pausedFrom), pausedUntil: new Date(pausedUntil) },
      { new: true }
    );
    if (!sub) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: sub });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.resumeSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOneAndUpdate(
      { _id: req.params.id, customer: req.user.id },
      { status: 'active', $unset: { pausedFrom: '', pausedUntil: '' } },
      { new: true }
    );
    if (!sub) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: sub });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
