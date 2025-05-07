const express = require('express');
const router = express.Router();
const booklinksController = require('../controllers/booklinksController');
// GET all books
router.get('/', async (req, res) => {
    try {
        const booklinks = await booklinksController.getAllBooklinks();
        res.json(booklinks);
    } catch (error) {
        console.error('Error fetching links:', error);
        res.status(500).json({ error: 'Failed to fetch links' });
    }
});
router.get('/', async (req, res) => {
    try {
        const links = await booklinksController.getBookContent();
        res.json(links);
    } catch (error) {
        console.error('Error fetching links:', error);
        res.status(500).json({ error: 'Failed to fetch links' });
    }
});
router.get('/', async (req, res) => {
    try {
        const cover = await booklinksController.getbookcover();
        res.json(cover);
    } catch (error) {
        console.error('Error fetching cover:', error);
        res.status(500).json({ error: 'Failed to fetch cover' });
    }
});