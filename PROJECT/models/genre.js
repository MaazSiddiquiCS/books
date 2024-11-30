const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');
// GET all books
router.get('/', async (req, res) => {
    try {
        const genres = await genreController.getAllGenre();
        res.json(genres);
    } catch (error) {
        console.error('Error fetching genres:', error);
        res.status(500).json({ error: 'Failed to fetch genres' });
    }
});
router.get('/', async (req, res) => {
    try {
        const bookgenres = await genreController.getAllBookGenre();
        res.json(bookgenres);
    } catch (error) {
        console.error('Error fetching genres:', error);
        res.status(500).json({ error: 'Failed to fetch genres' });
    }
});