const mongoose = require('mongoose');
const VendorSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, required: true },
  description:  String,
  logo:         String,
  address: {
    street: String, city: String, pincode: String,
    coords: { lat: Number, lng: Number }
  },
  serviceArea:   { pincodes: [String], radiusKm: { type: Number, default: 5 } },
  deliverySlots: [{
    type:       { type: String, enum: ['breakfast','lunch','dinner'] },
    time:       String,
    cutoffMins: { type: Number, default: 60 }
  }],
  ratings:    { avg: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  isApproved: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },
  commissionPct: { type: Number, default: 10 },
  stats: {
    totalRevenue:   { type: Number, default: 0 },
    mealsDelivered: { type: Number, default: 0 }
  }
}, { timestamps: true });
module.exports = mongoose.model('Vendor', VendorSchema);
