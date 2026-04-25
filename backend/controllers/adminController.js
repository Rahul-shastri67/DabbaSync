const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');

exports.getPlatformStats = async (req, res) => {
  try {
    const [totalUsers, totalVendors, totalSubs, pendingVendors] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Vendor.countDocuments({ isApproved: true }),
      Subscription.countDocuments({ status: 'active' }),
      Vendor.countDocuments({ isApproved: false })
    ]);

    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
    const revenue = await Payment.aggregate([
      { $match: { status: 'captured', createdAt: { $gte: monthStart }, type: 'subscription' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({ success: true, data: { totalUsers, totalVendors, totalSubs, pendingVendors, monthlyRevenue: revenue[0]?.total || 0 } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().populate('user','name email phone').sort({ createdAt: -1 });
    res.json({ success: true, data: vendors });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.approveVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { isApproved: true, isActive: true }, { new: true });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.json({ success: true, data: vendor, message: 'Vendor approved' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.rejectVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { isApproved: false, isActive: false }, { new: true });
    res.json({ success: true, data: vendor, message: 'Vendor rejected' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page=1, limit=20 } = req.query;
    const users = await User.find({ role: 'customer' }).sort({ createdAt: -1 }).skip((page-1)*limit).limit(+limit);
    const total = await User.countDocuments({ role: 'customer' });
    res.json({ success: true, data: users, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getRevenueReport = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const from = new Date(); from.setDate(from.getDate() - days);
    const report = await Payment.aggregate([
      { $match: { status: 'captured', createdAt: { $gte: from } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.json({ success: true, data: report });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
