const express = require('express');
const router = express.Router();
const booksController = require('../controllers/bookscontroller');

// GET all books
router.get('/', booksController.getAllBooks);
router.get('/bookauthors', booksController.getbookauthors);
// POST a new book
router.post('/addBook', booksController.addBook);
router.post('/addBookmark',booksController.addBookmark);
router.get('/addBookmark/:user_id', async (req, res) => {
    const { user_id } = req.params; // Get user_id from the request parameters
    if (!user_id) {
        return res.status(400).json({ error: 'User  ID is required' });
    }
    try {
        await booksController.getBookmarks(user_id, res); // Pass user_id to the controller
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        return res.status(500).json({ error: 'Failed to fetch bookmarks.' });
    }
});

// Delete a bookmark
router.delete('addBookmark/:userId/:bookId', booksController.deleteBookmark);
router.delete('/:bookId', booksController.deleteBook);
module.exports = router;
