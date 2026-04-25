const router = require('express').Router();
const MealPlan = require('../models/MealPlan');
const Vendor = require('../models/Vendor');
// Public: browse meal plans
router.get('/', async (req, res) => {
  try {
    const { type, city, veg } = req.query;
    const filter = { isActive: true };
    if (type) filter.type = type;
    if (veg !== undefined) filter.isVeg = veg === 'true';
    const plans = await MealPlan.find(filter).populate('vendor','businessName logo address ratings').sort({ 'ratings.avg': -1 });
    res.json({ success: true, data: plans });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const plan = await MealPlan.findById(req.params.id).populate('vendor');
    if (!plan) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: plan });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
module.exports = router;
