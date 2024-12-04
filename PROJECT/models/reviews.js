const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');
// GET all books
router.get('/', async (req, res) => {
    try {
        const reviews = await reviewsController.getAllReviews();
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});
router.get('/', async (req, res) => {
    try {
        const ratings = await reviewsController.getBookratings();
        res.json(ratings);
    } catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({ error: 'Failed to fetch ratings' });
    }
});