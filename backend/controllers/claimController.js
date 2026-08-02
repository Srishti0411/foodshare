const asyncHandler = require('express-async-handler');
const FoodListing = require('../models/FoodListing');
const Claim = require('../models/Claim');
const { notifyUser } = require('../socket');
const Rating = require('../models/Rating');

// @desc    Claim an available listing
// @route   POST /api/listings/:id/claim
// @access  Private (receiver)
// The atomic findOneAndUpdate below is the key piece: the filter checks
// status === 'available' AND performs the update in one server-side
// operation, so if two receivers hit this endpoint at the same instant only
// one of them can ever match and flip the status to 'claimed'.
const claimListing = asyncHandler(async (req, res) => {
  const listing = await FoodListing.findOneAndUpdate(
    { _id: req.params.id, status: 'available' },
    { status: 'claimed', claimedBy: req.user._id },
    { new: true }
  ).populate('donor', 'name organization phone');

  if (!listing) {
    res.status(409);
    throw new Error('This listing was just claimed by someone else, or is no longer available');
  }

  const claim = await Claim.create({
    listing: listing._id,
    receiver: req.user._id,
    donor: listing.donor._id,
  });

  notifyUser(listing.donor._id, 'listing:claimed', {
    listingId: listing._id,
    title: listing.title,
    receiverName: req.user.name,
  });

  res.status(201).json({ listing, claim });
});

// @desc    Donor or receiver confirms the handoff happened
// @route   PATCH /api/claims/:id/confirm
// @access  Private
const confirmPickup = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id).populate('listing');
  if (!claim) {
    res.status(404);
    throw new Error('Claim not found');
  }

  const isParty =
    claim.receiver.toString() === req.user._id.toString() ||
    claim.donor.toString() === req.user._id.toString();
  if (!isParty) {
    res.status(403);
    throw new Error('Only the donor or receiver on this claim can confirm pickup');
  }

  claim.pickupConfirmed = true;
  claim.pickupConfirmedAt = new Date();
  await claim.save();

  await FoodListing.findByIdAndUpdate(claim.listing._id, { status: 'completed' });

  res.json({ claim });
});

// @desc    Receiver cancels their claim, listing reopens
// @route   PATCH /api/claims/:id/cancel
// @access  Private (receiver on the claim)
const cancelClaim = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id);
  if (!claim) {
    res.status(404);
    throw new Error('Claim not found');
  }
  if (claim.receiver.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the receiver who made this claim can cancel it');
  }

  claim.cancelled = true;
  await claim.save();

  const listing = await FoodListing.findOneAndUpdate(
    { _id: claim.listing, status: 'claimed' },
    { status: 'available', claimedBy: null },
    { new: true }
  );

  if (listing) {
    notifyUser(listing.donor, 'listing:reopened', {
      listingId: listing._id,
      title: listing.title,
    });
  }

  res.json({ message: 'Claim cancelled, listing reopened for others' });
});

// @desc    Get claims made by the logged-in receiver
// @route   GET /api/claims/mine
// @access  Private (receiver)
const getMyClaims = asyncHandler(async (req, res) => {
  const claims = await Claim.find({ receiver: req.user._id, cancelled: false })
    .populate({
      path: 'listing',
      populate: { path: 'donor', select: 'name organization phone' },
    })
    .sort('-createdAt');

  const myRatings = await Rating.find({ fromUser: req.user._id }).select('listing');
  const ratedListingIds = new Set(myRatings.map((r) => r.listing.toString()));

  const withRatedFlag = claims.map((claim) => ({
    ...claim.toObject(),
    alreadyRatedByMe: claim.listing ? ratedListingIds.has(claim.listing._id.toString()) : false,
  }));

  res.json({ claims: withRatedFlag });
});
const getClaimByListing = asyncHandler(async (req, res) => {
  const claim = await Claim.findOne({
    listing: req.params.listingId,
    cancelled: false,
  })
    .populate('receiver', 'name organization')
    .sort('-createdAt');

  if (!claim) {
    res.status(404);
    throw new Error('No claim found for this listing');
  }

  const isParty =
    claim.receiver._id.toString() === req.user._id.toString() ||
    claim.donor.toString() === req.user._id.toString();
  if (!isParty) {
    res.status(403);
    throw new Error('Only the donor or receiver on this claim can view it');
  }

  const existingRating = await Rating.findOne({ fromUser: req.user._id, listing: req.params.listingId });

  res.json({ claim: { ...claim.toObject(), alreadyRatedByMe: !!existingRating } });
});
module.exports = { claimListing, confirmPickup, cancelClaim, getMyClaims, getClaimByListing };
