const mongoose = require('mongoose');
const PaymentSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  type:         { type: String, enum: ['subscription','refund','wallet_topup'], required: true },
  amount:       { type: Number, required: true },
  currency:     { type: String, default: 'INR' },
  status:       { type: String, enum: ['created','pending','captured','failed','refunded'], default: 'created' },
  gateway:      { type: String, enum: ['razorpay','wallet'], default: 'razorpay' },
  gatewayOrderId:   String,
  gatewayPaymentId: String,
  gatewaySignature: String,
  description:  String
}, { timestamps: true });
module.exports = mongoose.model('Payment', PaymentSchema);
