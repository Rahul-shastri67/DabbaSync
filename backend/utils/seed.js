require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User     = require('../models/User');
const Vendor   = require('../models/Vendor');
const MealPlan = require('../models/MealPlan');

// ROOT CAUSE FIX: Old seed did bcrypt.hash() manually THEN User.create() hashed again via
// pre-save hook → double-hash → matchPassword() always false → login broken.
// Fix: pass plain text, let the model hook hash it exactly once.

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dabbsync';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  await User.deleteMany({
    email: { $in: ['admin@dabbsync.in', 'vendor@dabbsync.in', 'customer@dabbsync.in'] }
  });
  await Vendor.deleteMany({});
  await MealPlan.deleteMany({});
  console.log('🗑️  Cleared existing seed data');

  await User.create({
    name: 'Super Admin', email: 'admin@dabbsync.in',
    phone: '9000000001', password: 'password123', role: 'admin', isActive: true
  });

  const vendorUser = await User.create({
    name: 'Rajesh Sharma', email: 'vendor@dabbsync.in',
    phone: '9000000002', password: 'password123', role: 'vendor', isActive: true
  });

  const vendor = await Vendor.create({
    user: vendorUser._id,
    businessName: 'Ghar ka Swad Tiffin Service',
    description: 'Authentic home-cooked meals. No preservatives, pure ghee.',
    address: { street: 'Shop 12, Kailash Colony', city: 'Delhi', pincode: '110048',
      coords: { lat: 28.5665, lng: 77.2431 } },
    serviceArea: { pincodes: ['110048','110049','110050'], radiusKm: 5 },
    deliverySlots: [
      { type: 'breakfast', time: '08:00', cutoffMins: 60 },
      { type: 'lunch',     time: '13:00', cutoffMins: 60 },
      { type: 'dinner',    time: '20:00', cutoffMins: 60 }
    ],
    isApproved: true, isActive: true, commissionPct: 10
  });

  await MealPlan.create([
    {
      vendor: vendor._id, name: 'Ghar ka Swad — Monthly Lunch',
      description: 'Traditional North Indian lunch daily. Dal, sabzi, roti, rice & pickle.',
      type: 'lunch', planDuration: 'monthly', pricePerMeal: 100, isVeg: true, isActive: true,
      tags: ['Home-cooked','North Indian','No preservatives'],
      menu: [
        { day: 'Monday',    items: ['Dal Tadka','Aloo Gobi','Roti','Rice','Pickle'] },
        { day: 'Tuesday',   items: ['Rajma','Mix Veg','Roti','Rice','Raita'] },
        { day: 'Wednesday', items: ['Chole','Bhindi Masala','Roti','Rice','Salad'] },
        { day: 'Thursday',  items: ['Dal Makhani','Paneer Bhurji','Roti','Rice','Pickle'] },
        { day: 'Friday',    items: ['Arhar Dal','Aloo Jeera','Puri','Kheer'] },
        { day: 'Saturday',  items: ['Kadhi Pakora','Rice','Roti','Papad','Salad'] },
        { day: 'Sunday',    items: ['Special Thali','Halwa','Puri','Raita'] }
      ]
    },
    { vendor: vendor._id, name: 'Morning Fuel — Monthly Breakfast',
      description: 'Wholesome breakfast daily. Poha, idli, paratha and more.',
      type: 'breakfast', planDuration: 'monthly', pricePerMeal: 60, isVeg: true, isActive: true,
      tags: ['Breakfast','Light','Healthy'] },
    { vendor: vendor._id, name: 'Full Day Combo — Monthly',
      description: 'All 3 meals. Best value for working professionals.',
      type: 'combo', planDuration: 'monthly', pricePerMeal: 220, isVeg: true, isActive: true,
      tags: ['All Meals','Best Value'] },
    { vendor: vendor._id, name: 'Weekly Trial Pack',
      description: 'Try lunch for a week before committing monthly.',
      type: 'lunch', planDuration: 'weekly', pricePerMeal: 110, isVeg: true, isActive: true,
      tags: ['Trial','Weekly','No commitment'] }
  ]);

  await User.create({
    name: 'Priya Mehta', email: 'customer@dabbsync.in',
    phone: '9000000003', password: 'password123', role: 'customer',
    isActive: true, wallet: 500, loyaltyPoints: 120
  });

  console.log('\n🌱 Seed complete!\n');
  console.log('  Admin    → admin@dabbsync.in    / password123');
  console.log('  Vendor   → vendor@dabbsync.in   / password123');
  console.log('  Customer → customer@dabbsync.in / password123\n');
  process.exit(0);
};

seed().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });