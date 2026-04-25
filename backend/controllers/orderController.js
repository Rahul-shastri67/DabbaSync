const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getTodayOrders = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
    const orders = await Order.find({ customer: req.user.id, orderDate: { $gte: today, $lt: tomorrow } })
      .populate('vendor','businessName logo').populate('mealPlan','name type');
    res.json({ success: true, data: orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getOrderHistory = async (req, res) => {
  try {
    const { page=1, limit=20 } = req.query;
    const orders = await Order.find({ customer: req.user.id })
      .populate('vendor','businessName').populate('mealPlan','name type')
      .sort({ orderDate: -1 }).skip((page-1)*limit).limit(+limit);
    res.json({ success: true, data: orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!order.isCancelable) return res.status(400).json({ success: false, message: 'Cancellation window has closed' });
    if (['delivered','cancelled','skipped'].includes(order.status))
      return res.status(400).json({ success: false, message: 'Cannot cancel at this stage' });

    order.status = 'cancelled';
    order.cancellation = { cancelledAt: new Date(), reason: req.body.reason || 'Customer cancelled', cancelledBy: 'customer', refundAmount: order.amount, refundStatus: 'pending' };
    order.statusHistory.push({ status: 'cancelled' });
    await order.save();

    await User.findByIdAndUpdate(req.user.id, { $inc: { wallet: order.amount } });

    await Notification.create({ user: req.user.id, title: 'Order Cancelled', message: `Rs.${order.amount} credited to your wallet`, type: 'payment' });

    const io = req.app.get('io');
    io.to(`vendor-${order.vendor}`).emit('order_cancelled', { orderId: order._id });

    res.json({ success: true, message: `Order cancelled. Rs.${order.amount} added to wallet` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.rateOrder = async (req, res) => {
  try {
    const { stars, review } = req.body;
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, customer: req.user.id, status: 'delivered' },
      { rating: { stars, review, ratedAt: new Date() } },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Not found or not delivered' });
    res.json({ success: true, message: 'Rating saved' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Vendor: update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, $push: { statusHistory: { status, note: note || '' } } },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Not found' });

    await Notification.create({ user: order.customer, title: 'Order Update', message: `Your meal is now: ${status.replace(/_/g,' ')}`, type: 'delivery_update', data: { orderId: order._id } });

    const io = req.app.get('io');
    io.to(`user-${order.customer}`).emit('order_status', { orderId: order._id, status });

    res.json({ success: true, data: order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
