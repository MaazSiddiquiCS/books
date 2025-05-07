const express = require('express');
const router = express.Router();
const booksController = require('../controllers/bookscontroller');
Book.belongsToMany(Author, { through: 'BookAuthors' });
// GET all books
router.get('/', async (req, res) => {
    try {
        const books = await booksController.getAllBooks();
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

router.get('/', async (req, res) => {
    try {
        const authorbooks = await booksController.getbookauthors();
        res.json(authorbooks);
    } catch (error) {
        console.error('Error fetching auhtors:', error);
        res.status(500).json({ error: 'Failed to fetch authors' });
    }
});
// POST a new book
router.post('/', async (req, res) => {
    const { book_id, published_date, language } = req.body;

    // Check if all required fields are provided
    if (!book_id|| !published_date || !language) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const bookId = await booksController.addBook( book_id, published_date, language);
        res.status(201).json({ message: 'Book added successfully', bookId });
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ error: 'Failed to add book' });
    }
});

router.post('/addBookmark', async (req, res) => {
    try {
        const { user_id, book_id, bookmark_date } = req.body;

        if (!user_id || !book_id || !bookmark_date) {
            return res.status(400).json({ error: 'User ID, Book ID, and Bookmark Date are required.' });
        }

        // Call the addBookmark controller
        const response = await bookmarksController.addBookmark(req.body);
        res.status(201).json(response);
    } catch (error) {
        console.error('Error adding bookmark:', error);
        res.status(500).json({ error: error.message || 'Failed to add bookmark' });
    }
});

module.exports = router;
