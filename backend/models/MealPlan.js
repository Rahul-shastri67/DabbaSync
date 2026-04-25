const mongoose = require('mongoose');
const MealPlanSchema = new mongoose.Schema({
  vendor:       { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  name:         { type: String, required: true },
  description:  String,
  type:         { type: String, enum: ['breakfast','lunch','dinner','combo'], required: true },
  planDuration: { type: String, enum: ['daily','weekly','monthly'], required: true },
  pricePerMeal: { type: Number, required: true },
  totalPrice:   Number,
  menu:         [{ day: String, items: [String] }],
  images:       [String],
  isVeg:        { type: Boolean, default: true },
  isActive:     { type: Boolean, default: true },
  ratings:      { avg: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  tags:         [String]
}, { timestamps: true });

MealPlanSchema.pre('save', function(next) {
  const d = { daily: 1, weekly: 7, monthly: 30 };
  this.totalPrice = this.pricePerMeal * (d[this.planDuration] || 1);
  next();
});
module.exports = mongoose.model('MealPlan', MealPlanSchema);
