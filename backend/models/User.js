const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['donor', 'receiver', 'admin'],
      default: 'donor',
    },
    phone: { type: String, trim: true },
    organization: { type: String, trim: true }, // NGO / shelter / restaurant name, optional
    verified: { type: Boolean, default: false }, // admin-approved NGO badge
    avatar: { type: String, default: '' },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        // [longitude, latitude]
        type: [Number],
        default: [0, 0],
      },
      label: { type: String, default: '' }, // human readable address
    },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    name: this.name,
    role: this.role,
    organization: this.organization,
    verified: this.verified,
    avatar: this.avatar,
    ratingAverage: this.ratingAverage,
    ratingCount: this.ratingCount,
    location: this.location,
  };
};

module.exports = mongoose.model('User', userSchema);
