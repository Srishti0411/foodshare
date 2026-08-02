const express = require('express');
const {
  confirmPickup,
  cancelClaim,
  getMyClaims,
  getClaimByListing,
} = require('../controllers/claimController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/mine', getMyClaims);
router.get('/listing/:listingId', getClaimByListing);
router.patch('/:id/confirm', confirmPickup);
router.patch('/:id/cancel', cancelClaim);

module.exports = router;