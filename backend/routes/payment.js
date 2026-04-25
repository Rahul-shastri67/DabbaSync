const router = require('express').Router();
const c = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);
router.post('/create-order', authorize('customer'), c.createRazorpayOrder);
router.post('/verify', authorize('customer'), c.verifyPayment);
router.post('/wallet-topup', authorize('customer'), c.walletTopup);
router.get('/history', c.getPaymentHistory);
module.exports = router;
