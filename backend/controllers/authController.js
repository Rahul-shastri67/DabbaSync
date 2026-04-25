const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
const sendToken = (user, code, res) => {
  const token = signToken(user._id);
  const u = user.toObject(); delete u.password;
  res.status(code).json({ success: true, token, user: u });
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, referralCode } = req.body;
    if (await User.findOne({ $or: [{ email }, { phone }] }))
      return res.status(400).json({ success: false, message: 'Email or phone already exists' });
    const data = { name, email, phone, password, role: role || 'customer' };
    if (referralCode) {
      const ref = await User.findOne({ referralCode });
      if (ref) { data.referredBy = ref._id; await User.findByIdAndUpdate(ref._id, { $inc: { wallet: 200 } }); }
    }
    const user = await User.create(data);
    sendToken(user, 201, res);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Provide email and password' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    sendToken(user, 200, res);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user });
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
