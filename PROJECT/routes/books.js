const express = require('express');
const router = express.Router();
const booksController = require('../controllers/bookscontroller');

// GET all books
router.get('/', booksController.getAllBooks);
router.get('/bookauthors', booksController.getbookauthors);
// POST a new book
router.post('/', booksController.addBook);

module.exports = router;
