const express = require('express');
const { body } = require('express-validator');
const { createRating, getRatingsForUser } = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('claimId').notEmpty().withMessage('claimId is required'),
    body('stars').isInt({ min: 1, max: 5 }).withMessage('Stars must be between 1 and 5'),
  ],
  createRating
);

router.get('/user/:userId', getRatingsForUser);

module.exports = router;
