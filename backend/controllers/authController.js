const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { name, email, password, role, phone, organization, lat, lng, label } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('An account with that email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role === 'admin' ? 'donor' : role, // no self-service admin accounts
    phone,
    organization,
    location: {
      type: 'Point',
      coordinates: [lng ?? 0, lat ?? 0],
      label: label || '',
    },
  });

  res.status(201).json({
    token: generateToken(user._id),
    user: user.toPublicJSON(),
  });
});

// @desc    Log in
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    token: generateToken(user._id),
    user: user.toPublicJSON(),
  });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});

// @desc    Update own profile / location
// @route   PATCH /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, organization, lat, lng, label, avatar } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (organization !== undefined) user.organization = organization;
  if (avatar !== undefined) user.avatar = avatar;
  if (lat !== undefined && lng !== undefined) {
    user.location.coordinates = [lng, lat];
    user.location.label = label || user.location.label;
  }

  await user.save();
  res.json({ user: user.toPublicJSON() });
});

module.exports = { register, login, getMe, updateMe };
