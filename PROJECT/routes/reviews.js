const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');

// GET all books
router.get('/', reviewsController.getAllReviews);
router.get('/ratings', reviewsController.getBookratings);
module.exports = router;
