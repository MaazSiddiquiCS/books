const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');

// GET all books
router.get('/', genreController.getAllGenre);
module.exports = router;
router.get('/bookgenre', genreController.getAllBookGenre);
module.exports = router;
