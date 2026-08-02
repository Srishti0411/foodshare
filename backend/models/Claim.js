const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    claimedAt: { type: Date, default: Date.now },
    pickupConfirmed: { type: Boolean, default: false },
    pickupConfirmedAt: { type: Date, default: null },
    cancelled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Claim', claimSchema);
