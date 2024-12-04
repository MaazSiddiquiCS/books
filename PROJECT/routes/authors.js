const express = require('express');
const router = express.Router();
const authorsController = require('../controllers/authorsController');

// GET all books
router.get('/', authorsController.getAllAuthors);
module.exports = router;
