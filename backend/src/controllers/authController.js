const User   = require('../models/User');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const u = user.toObject();
  delete u.password;
  res.status(statusCode).json({ success: true, token, user: u });
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, referralCode } = req.body;
    if (!name || !email || !phone || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email or phone already registered' });

    const data = { name, email: email.toLowerCase(), phone, password, role: role || 'customer' };

    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        data.referredBy = referrer._id;
        await User.findByIdAndUpdate(referrer._id, { $inc: { wallet: 200 } });
      }
    }

    const user = await User.create(data);
    sendToken(user, 201, res);
  } catch (err) {
    console.error('[register]', err.message);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    // IMPORTANT: must select('+password') — field is hidden by default in schema
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user)
      return res.status(401).json({ success: false, message: 'No account found with this email' });
    if (!user.isActive)
      return res.status(401).json({ success: false, message: 'Account deactivated. Contact support.' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Incorrect password' });

    sendToken(user, 200, res);
  } catch (err) {
    console.error('[login]', err.message);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'address', 'notifPrefs', 'avatar'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'No account with that email' });
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken  = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Reset link sent', resetToken: token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Token invalid or expired' });
    user.password = req.body.password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();
    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};