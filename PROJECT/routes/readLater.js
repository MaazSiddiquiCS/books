const express = require('express');
const router = express.Router();
const read= require('../controllers/readLaterController');

// Routes for signup and login
router.post('/', read.pushReadLater);
router.get('/get', read.getReadLater);

module.exports = router;
