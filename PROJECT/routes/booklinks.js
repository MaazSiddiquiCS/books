const express = require('express');
const router = express.Router();
const booklinksController = require('../controllers/booklinksController');

// GET all books
router.get('/', booklinksController.getAllBooklinks);
router.get('/bookcover', booklinksController.getbookcover);
module.exports = router;