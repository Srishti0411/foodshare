const asyncHandler = require('express-async-handler');
const Rating = require('../models/Rating');
const User = require('../models/User');
const Claim = require('../models/Claim');

// Recomputes and stores the rolling average for a user via aggregation.
const recomputeAverage = async (userId) => {
  const [result] = await Rating.aggregate([
    { $match: { toUser: userId } },
    {
      $group: {
        _id: '$toUser',
        average: { $avg: '$stars' },
        count: { $sum: 1 },
      },
    },
  ]);

  await User.findByIdAndUpdate(userId, {
    ratingAverage: result ? Math.round(result.average * 10) / 10 : 0,
    ratingCount: result ? result.count : 0,
  });
};

// @desc    Rate the other party after a completed claim
// @route   POST /api/ratings
// @access  Private
const createRating = asyncHandler(async (req, res) => {
  const { claimId, stars, comment } = req.body;

  const claim = await Claim.findById(claimId);
  if (!claim) {
    res.status(404);
    throw new Error('Claim not found');
  }
  if (!claim.pickupConfirmed) {
    res.status(400);
    throw new Error('Pickup must be confirmed before leaving a rating');
  }

  const isReceiver = claim.receiver.toString() === req.user._id.toString();
  const isDonor = claim.donor.toString() === req.user._id.toString();
  if (!isReceiver && !isDonor) {
    res.status(403);
    throw new Error('Only the donor or receiver on this claim can leave a rating');
  }

  const toUser = isReceiver ? claim.donor : claim.receiver;

  const rating = await Rating.create({
    fromUser: req.user._id,
    toUser,
    listing: claim.listing,
    stars,
    comment,
  });

  await recomputeAverage(toUser);

  res.status(201).json({ rating });
});

// @desc    Get ratings received by a user
// @route   GET /api/ratings/user/:userId
// @access  Private
const getRatingsForUser = asyncHandler(async (req, res) => {
  const ratings = await Rating.find({ toUser: req.params.userId })
    .populate('fromUser', 'name organization')
    .sort('-createdAt');
  res.json({ ratings });
});

module.exports = { createRating, getRatingsForUser };
