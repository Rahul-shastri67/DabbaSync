const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const MealPlan = require('../models/MealPlan');

exports.getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    res.json({ success: true, data: vendor });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createVendorProfile = async (req, res) => {
  try {
    const exists = await Vendor.findOne({ user: req.user.id });
    if (exists) return res.status(400).json({ success: false, message: 'Vendor profile already exists' });
    const vendor = await Vendor.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, data: vendor });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndUpdate({ user: req.user.id }, req.body, { new: true, runValidators: true });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.json({ success: true, data: vendor });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getDashboard = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
    const weekAgo = new Date(today); weekAgo.setDate(today.getDate()-7);

    const [todayOrders, activeSubs, weeklyOrders] = await Promise.all([
      Order.find({ vendor: vendor._id, orderDate: { $gte: today, $lt: tomorrow } })
        .populate('customer','name phone').populate('mealPlan','name type'),
      Subscription.countDocuments({ vendor: vendor._id, status: 'active' }),
      Order.find({ vendor: vendor._id, orderDate: { $gte: weekAgo }, status: 'delivered' })
    ]);

    const skippedToday = todayOrders.filter(o => o.status === 'skipped').length;
    const activeMeals  = todayOrders.filter(o => !['skipped','cancelled'].includes(o.status)).length;
    const weeklyRevenue = weeklyOrders.reduce((s, o) => s + o.amount, 0);

    const statusBreakdown = {
      scheduled: 0, preparing: 0, out_for_delivery: 0, delivered: 0, skipped: 0, cancelled: 0
    };
    todayOrders.forEach(o => { if (statusBreakdown[o.status] !== undefined) statusBreakdown[o.status]++; });

    res.json({ success: true, data: { activeMeals, activeSubs, skippedToday, weeklyRevenue, statusBreakdown, todayOrders } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getVendorOrders = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    const { date, status, page=1, limit=20 } = req.query;
    const filter = { vendor: vendor._id };
    if (date) { const d = new Date(date); filter.orderDate = { $gte: d, $lt: new Date(d.getTime()+86400000) }; }
    if (status) filter.status = status;
    const [orders, total] = await Promise.all([
      Order.find(filter).populate('customer','name phone address').populate('mealPlan','name type')
        .sort({ scheduledAt: 1 }).skip((page-1)*limit).limit(+limit),
      Order.countDocuments(filter)
    ]);
    res.json({ success: true, data: orders, total, page: +page, pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAnalytics = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    const days = parseInt(req.query.days) || 7;
    const from = new Date(); from.setDate(from.getDate()-days);
    const orders = await Order.find({ vendor: vendor._id, orderDate: { $gte: from } });

    const revenueMap = {};
    const mealBreakdown = { breakfast: 0, lunch: 0, dinner: 0 };
    let totalRevenue = 0;

    orders.forEach(o => {
      const day = o.orderDate.toISOString().slice(0,10);
      if (o.status === 'delivered') { revenueMap[day] = (revenueMap[day]||0) + o.amount; totalRevenue += o.amount; }
      if (mealBreakdown[o.mealType] !== undefined) mealBreakdown[o.mealType]++;
    });

    const skipped = orders.filter(o => o.status === 'skipped').length;
    const skipRate = orders.length ? ((skipped/orders.length)*100).toFixed(1) : 0;

    res.json({ success: true, data: { revenueMap, mealBreakdown, totalRevenue, totalOrders: orders.length, skipped, skipRate } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getVendorSubscriptions = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    const subs = await Subscription.find({ vendor: vendor._id, status: 'active' })
      .populate('customer','name phone address').populate('mealPlan','name type pricePerMeal');
    res.json({ success: true, data: subs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createMealPlan = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) return res.status(404).json({ success: false, message: 'Create vendor profile first' });
    const plan = await MealPlan.create({ ...req.body, vendor: vendor._id });
    res.status(201).json({ success: true, data: plan });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateMealPlan = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    const plan = await MealPlan.findOneAndUpdate({ _id: req.params.id, vendor: vendor._id }, req.body, { new: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Meal plan not found' });
    res.json({ success: true, data: plan });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteMealPlan = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    await MealPlan.findOneAndDelete({ _id: req.params.id, vendor: vendor._id });
    res.json({ success: true, message: 'Meal plan deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
