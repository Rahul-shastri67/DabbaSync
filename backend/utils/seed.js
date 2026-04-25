/**
 * DabbaSync — Database Seed Script
 * Run: node utils/seed.js
 * Creates demo admin, vendor, customer + a meal plan
 */
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const Vendor   = require('../models/Vendor');
const MealPlan = require('../models/MealPlan');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dabbsync';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Wipe existing seed data
  await Promise.all([
    User.deleteMany({ email: { $in: ['admin@dabbsync.in','vendor@dabbsync.in','customer@dabbsync.in'] } }),
    Vendor.deleteMany({}),
    MealPlan.deleteMany({})
  ]);

  const password = await bcrypt.hash('password123', 12);

  // Admin
  const admin = await User.create({
    name: 'Super Admin', email: 'admin@dabbsync.in',
    phone: '9000000001', password, role: 'admin', isActive: true
  });

  // Vendor user
  const vendorUser = await User.create({
    name: 'Rajesh Sharma', email: 'vendor@dabbsync.in',
    phone: '9000000002', password, role: 'vendor', isActive: true
  });

  // Vendor profile
  const vendor = await Vendor.create({
    user: vendorUser._id,
    businessName: 'Ghar ka Swad Tiffin Service',
    description: 'Authentic home-cooked meals delivered daily. No preservatives, pure ghee.',
    address: { street: 'Shop 12, Kailash Colony', city: 'Delhi', pincode: '110048', coords: { lat: 28.5665, lng: 77.2431 } },
    serviceArea: { pincodes: ['110048','110049','110050'], radiusKm: 5 },
    deliverySlots: [
      { type: 'breakfast', time: '08:00', cutoffMins: 60 },
      { type: 'lunch',     time: '13:00', cutoffMins: 60 },
      { type: 'dinner',    time: '20:00', cutoffMins: 60 }
    ],
    isApproved: true, isActive: true, commissionPct: 10
  });

  // Meal plans
  await MealPlan.create([
    {
      vendor: vendor._id,
      name: 'Ghar ka Swad — Monthly Lunch',
      description: 'Traditional North Indian lunch delivered hot every day. Dal, sabzi, roti, rice & pickle included.',
      type: 'lunch', planDuration: 'monthly',
      pricePerMeal: 100, isVeg: true, isActive: true,
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
    {
      vendor: vendor._id,
      name: 'Morning Fuel — Monthly Breakfast',
      description: 'Wholesome breakfast to kickstart your day. Rotating menu with poha, idli, paratha and more.',
      type: 'breakfast', planDuration: 'monthly',
      pricePerMeal: 60, isVeg: true, isActive: true,
      tags: ['Breakfast','Light','Healthy'],
      menu: [
        { day: 'Monday',    items: ['Poha','Chai','Banana'] },
        { day: 'Tuesday',   items: ['Idli Sambar','Coconut Chutney'] },
        { day: 'Wednesday', items: ['Aloo Paratha','Dahi','Pickle'] },
        { day: 'Thursday',  items: ['Upma','Chai'] },
        { day: 'Friday',    items: ['Bread Omelette','Chai'] },
        { day: 'Saturday',  items: ['Poori Bhaji','Chai'] },
        { day: 'Sunday',    items: ['Special Breakfast Thali'] }
      ]
    },
    {
      vendor: vendor._id,
      name: 'Full Day Combo — Monthly',
      description: 'All 3 meals covered. Best value plan for working professionals & students.',
      type: 'combo', planDuration: 'monthly',
      pricePerMeal: 220, isVeg: true, isActive: true,
      tags: ['All Meals','Best Value','Working Professional']
    },
    {
      vendor: vendor._id,
      name: 'Weekly Trial Pack',
      description: 'Try our lunch for a week before committing monthly.',
      type: 'lunch', planDuration: 'weekly',
      pricePerMeal: 110, isVeg: true, isActive: true,
      tags: ['Trial','Weekly','No commitment']
    }
  ]);

  // Customer
  await User.create({
    name: 'Priya Mehta', email: 'customer@dabbsync.in',
    phone: '9000000003', password, role: 'customer', isActive: true,
    wallet: 500, loyaltyPoints: 120
  });

  console.log('\n🌱 Seed complete!\n');
  console.log('  Admin    → admin@dabbsync.in    / password123');
  console.log('  Vendor   → vendor@dabbsync.in   / password123');
  console.log('  Customer → customer@dabbsync.in / password123\n');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
