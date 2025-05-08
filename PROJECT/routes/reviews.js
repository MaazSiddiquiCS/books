const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');

// Get all reviews
router.get('/', reviewsController.getAllReviews);

// Get average ratings for books
router.get('/ratings', reviewsController.getbookRatings);

// Add a new review
router.post('/', reviewsController.addReview);

// Delete a review by ID
router.delete('/:review_id', reviewsController.deleteReview);

module.exports = router;
