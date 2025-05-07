const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');

// Get bookmark progress
router.get('/progress', bookmarkController.getBookmarkProgress);

// Add a bookmark
router.post('/', bookmarkController.pushBookmark);

// Update progress
router.put('/progress', bookmarkController.updateProgress);

// Delete bookmark
router.delete('/delete', bookmarkController.deleteBookmark);

module.exports = router;
