const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const User = require('../models/User');

let razorpay;
try {
  razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
} catch { console.warn('Razorpay not configured'); }

const generateOrders = async (sub) => {
  const populated = await Subscription.findById(sub._id).populate('mealPlan').populate('vendor');
  const { startDate, endDate, mealPlan, vendor, customer, pricePerMeal, deliveryAddress } = populated;
  const slots = vendor.deliverySlots?.length
    ? vendor.deliverySlots.filter(s => mealPlan.type === 'combo' || s.type === mealPlan.type)
    : [{ type: mealPlan.type || 'lunch', time: '13:00' }];

  const orders = [];
  let d = new Date(startDate);
  while (d <= endDate) {
    for (const slot of slots) {
      const [h, m] = slot.time.split(':').map(Number);
      const scheduled = new Date(d); scheduled.setHours(h, m, 0, 0);
      orders.push({
        subscription: sub._id, customer, vendor: vendor._id, mealPlan: mealPlan._id,
        orderDate: new Date(d), mealType: slot.type, scheduledAt: scheduled,
        status: 'scheduled', deliveryAddress, amount: pricePerMeal, isCancelable: true,
        statusHistory: [{ status: 'scheduled', timestamp: new Date() }]
      });
    }
    d.setDate(d.getDate()+1);
  }
  await Order.insertMany(orders);
};

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { subscriptionId, walletUse = 0 } = req.body;
    const sub = await Subscription.findOne({ _id: subscriptionId, customer: req.user.id });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    const user = await User.findById(req.user.id);
    const walletDeduct = Math.min(walletUse, user.wallet, sub.adjustedBill);
    const amount = Math.max(0, sub.adjustedBill - walletDeduct);

    const options = { amount: Math.round(amount * 100), currency: 'INR', receipt: `rcpt_${Date.now()}` };
    const order = razorpay ? await razorpay.orders.create(options) : { id: 'test_' + Date.now(), amount: options.amount };

    const payment = await Payment.create({
      user: req.user.id, subscription: subscriptionId, type: 'subscription',
      amount, status: 'created', gateway: 'razorpay', gatewayOrderId: order.id
    });

    res.json({ success: true, order, paymentId: payment._id, walletDeduct, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, subscriptionId, walletDeduct = 0 } = req.body;

    if (razorpay && razorpay_signature) {
      const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
      if (expected !== razorpay_signature)
        return res.status(400).json({ success: false, message: 'Payment signature invalid' });
    }

    const payment = await Payment.findOneAndUpdate(
      { gatewayOrderId: razorpay_order_id },
      { status: 'captured', gatewayPaymentId: razorpay_payment_id, gatewaySignature: razorpay_signature },
      { new: true }
    );

    const sub = await Subscription.findByIdAndUpdate(subscriptionId, { status: 'active', paidAmount: payment.amount }, { new: true });
    await generateOrders(sub);

    if (walletDeduct > 0) await User.findByIdAndUpdate(req.user.id, { $inc: { wallet: -walletDeduct } });

    res.json({ success: true, message: 'Payment verified, subscription activated!' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: payments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.walletTopup = async (req, res) => {
  try {
    const { amount } = req.body;
    await User.findByIdAndUpdate(req.user.id, { $inc: { wallet: amount } });
    await Payment.create({ user: req.user.id, type: 'wallet_topup', amount, status: 'captured', gateway: 'razorpay' });
    res.json({ success: true, message: `Rs.${amount} added to wallet` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
