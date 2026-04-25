const mongoose = require('mongoose');
const SubscriptionSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
  vendor:   { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor',   required: true },
  mealPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'MealPlan', required: true },
  status: { type: String, enum: ['active','paused','cancelled','expired','pending_payment'], default: 'pending_payment' },
  startDate:    { type: Date, required: true },
  endDate:      { type: Date, required: true },
  pausedFrom:   Date,
  pausedUntil:  Date,
  deliveryAddress: { street: String, city: String, pincode: String, coords: { lat: Number, lng: Number } },
  deliveryInstructions: String,
  pricePerMeal: { type: Number, required: true },
  totalDays:    Number,
  skippedDays:  [{ type: Date }],
  baseBill:     Number,
  adjustedBill: Number,
  paidAmount:   { type: Number, default: 0 },
  walletCredits:{ type: Number, default: 0 },
  autoRenew:    { type: Boolean, default: true }
}, { timestamps: true });

SubscriptionSchema.virtual('activeMeals').get(function() {
  return this.totalDays - this.skippedDays.length;
});
SubscriptionSchema.virtual('computedBill').get(function() {
  return this.pricePerMeal * (this.totalDays - this.skippedDays.length);
});
SubscriptionSchema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('Subscription', SubscriptionSchema);
