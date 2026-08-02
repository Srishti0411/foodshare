const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 400 },
  },
  { timestamps: true }
);

// one rating per person per listing
ratingSchema.index({ fromUser: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
