const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  phone:    { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role:     { type: String, enum: ['customer','vendor','admin'], default: 'customer' },
  avatar:   { type: String, default: '' },
  address: {
    street: String, city: String, pincode: String,
    coords: { lat: Number, lng: Number }
  },
  wallet:        { type: Number, default: 0 },
  loyaltyPoints: { type: Number, default: 0 },
  referralCode:  { type: String, unique: true, sparse: true },
  referredBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive:      { type: Boolean, default: true },
  notifPrefs: {
    whatsapp: { type: Boolean, default: true },
    sms:      { type: Boolean, default: true },
    push:     { type: Boolean, default: true }
  }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.referralCode) {
    this.referralCode = this.name.slice(0,4).toUpperCase() + Math.random().toString(36).slice(-4).toUpperCase();
  }
  next();
});

UserSchema.methods.matchPassword = async function(entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);
