const express = require('express');
const { body } = require('express-validator');
const {
  createListing,
  getListings,
  getListing,
  getMyListings,
  deleteListing,
} = require('../controllers/listingController');
const { claimListing } = require('../controllers/claimController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.get('/mine', getMyListings);

router.get('/', getListings);

router.post(
  '/',
  authorize('donor', 'admin'),
  upload.single('photo'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('quantity').trim().notEmpty().withMessage('Quantity is required'),
    body('expiresAt').notEmpty().withMessage('An expiry time is required'),
    body('lat').isFloat().withMessage('Latitude is required'),
    body('lng').isFloat().withMessage('Longitude is required'),
  ],
  createListing
);

router.get('/:id', getListing);
router.delete('/:id', deleteListing);

router.post('/:id/claim', authorize('receiver', 'admin'), claimListing);

module.exports = router;
