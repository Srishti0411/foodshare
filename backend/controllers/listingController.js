const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const FoodListing = require('../models/FoodListing');
const { broadcastNewListing } = require('../socket');

// @desc    Create a food listing
// @route   POST /api/listings
// @access  Private (donor, admin)
const createListing = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { title, description, category, quantity, expiresAt, lat, lng, label } = req.body;

  const listing = await FoodListing.create({
    donor: req.user._id,
    title,
    description,
    category,
    quantity,
    expiresAt,
    photo: req.file ? req.file.path : req.body.photo || '',
    location: {
      type: 'Point',
      coordinates: [Number(lng), Number(lat)],
      label: label || '',
    },
  });

  const populated = await listing.populate('donor', 'name organization verified ratingAverage ratingCount');
  broadcastNewListing(populated);

  res.status(201).json({ listing: populated });
});

// @desc    Browse available listings near a point, nearest first
// @route   GET /api/listings?lat=..&lng=..&radiusKm=..&category=..
// @access  Private
const getListings = asyncHandler(async (req, res) => {
  const { lat, lng, category, status } = req.query;
  const radiusKm = Number(req.query.radiusKm) || Number(process.env.DEFAULT_RADIUS_KM) || 8;

  const filter = {};
  if (status) {
    filter.status = status;
  } else {
    filter.status = 'available';
  }
  if (category) filter.category = category;

  if (lat && lng) {
    filter.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
        $maxDistance: radiusKm * 1000,
      },
    };
  }

  const listings = await FoodListing.find(filter)
    .populate('donor', 'name organization verified ratingAverage ratingCount')
    .limit(100);

  res.json({ listings, count: listings.length });
});

// @desc    Get a single listing
// @route   GET /api/listings/:id
// @access  Private
const getListing = asyncHandler(async (req, res) => {
  const listing = await FoodListing.findById(req.params.id)
    .populate('donor', 'name organization verified ratingAverage ratingCount phone')
    .populate('claimedBy', 'name organization ratingAverage ratingCount');

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }
  res.json({ listing });
});

// @desc    Get listings posted by the logged-in donor
// @route   GET /api/listings/mine
// @access  Private (donor)
const getMyListings = asyncHandler(async (req, res) => {
  const listings = await FoodListing.find({ donor: req.user._id }).sort('-createdAt');
  res.json({ listings });
});

// @desc    Cancel / delete a listing (only if not yet claimed)
// @route   DELETE /api/listings/:id
// @access  Private (owning donor, admin)
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await FoodListing.findById(req.params.id);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }
  if (listing.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You can only remove your own listings');
  }
  if (listing.status === 'claimed') {
    res.status(400);
    throw new Error('This listing has already been claimed and cannot be removed');
  }
  await listing.deleteOne();
  res.json({ message: 'Listing withdrawn' });
});

module.exports = {
  createListing,
  getListings,
  getListing,
  getMyListings,
  deleteListing,
};
