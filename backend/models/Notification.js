const mongoose = require('mongoose');
const NotificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  type:    { type: String, enum: ['meal_reminder','skip_confirm','delivery_update','payment','promo','system'], default: 'system' },
  isRead:  { type: Boolean, default: false },
  data:    mongoose.Schema.Types.Mixed
}, { timestamps: true });
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
module.exports = mongoose.model('Notification', NotificationSchema);
