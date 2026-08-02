const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 800 },
    category: {
      type: String,
      enum: ['cooked', 'produce', 'bakery', 'packaged', 'dairy', 'other'],
      default: 'other',
    },
    quantity: { type: String, required: true, trim: true }, // e.g. "12 servings", "5 kg"
    photo: { type: String, default: '' },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: { type: [Number], required: true }, // [lng, lat]
      label: { type: String, default: '' },
    },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['available', 'claimed', 'expired', 'completed'],
      default: 'available',
    },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    ticketNumber: { type: String, unique: true },
  },
  { timestamps: true }
);

foodListingSchema.index({ location: '2dsphere' });
foodListingSchema.index({ status: 1, expiresAt: 1 });

foodListingSchema.pre('validate', function assignTicketNumber(next) {
  if (!this.ticketNumber) {
    const stamp = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    this.ticketNumber = `FS-${stamp}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('FoodListing', foodListingSchema);
