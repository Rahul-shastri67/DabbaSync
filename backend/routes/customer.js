const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');
router.use(protect, authorize('customer'));
router.get('/wallet', async (req, res) => {
  const user = await User.findById(req.user.id).select('wallet loyaltyPoints referralCode');
  res.json({ success: true, data: user });
});
router.get('/notifications', async (req, res) => {
  const notifs = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, data: notifs });
});
router.put('/notifications/:id/read', async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
});
module.exports = router;
