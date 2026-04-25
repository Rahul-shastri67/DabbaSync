const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
  customer:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',         required: true },
  vendor:       { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor',       required: true },
  mealPlan:     { type: mongoose.Schema.Types.ObjectId, ref: 'MealPlan',     required: true },
  orderDate:   { type: Date, required: true },
  mealType:    { type: String, enum: ['breakfast','lunch','dinner'], required: true },
  scheduledAt: { type: Date, required: true },
  status: { type: String, enum: ['scheduled','preparing','out_for_delivery','delivered','skipped','cancelled'], default: 'scheduled' },
  statusHistory: [{ status: String, timestamp: { type: Date, default: Date.now }, note: String }],
  deliveryAddress: { street: String, city: String, pincode: String, coords: { lat: Number, lng: Number } },
  cancellation: {
    cancelledAt: Date, reason: String,
    cancelledBy: { type: String, enum: ['customer','vendor','system'] },
    refundAmount: Number,
    refundStatus: { type: String, enum: ['pending','processed','failed'], default: 'pending' }
  },
  rating: { stars: { type: Number, min: 1, max: 5 }, review: String, ratedAt: Date },
  amount:       { type: Number, required: true },
  isCancelable: { type: Boolean, default: true }
}, { timestamps: true });

OrderSchema.index({ vendor: 1, orderDate: 1, status: 1 });
OrderSchema.index({ customer: 1, orderDate: -1 });
module.exports = mongoose.model('Order', OrderSchema);
