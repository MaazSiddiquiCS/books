const express = require('express');
const router = express.Router();
const read= require('../controllers/readLaterController');
const readLaterController = require('../controllers/readLaterController');
// Routes for signup and login
router.post('/', read.pushReadLater);
router.get('/:user_id', async (req, res) => {
    const { user_id } = req.params; // Get user_id from the request parameters
    if (!user_id) {
        return res.status(400).json({ error: 'User  ID is required' });
    }
    try {
        await readLaterController.getReadLater(user_id, res); // Pass user_id to the controller
    } catch (error) {
        console.error('Error fetching read later books:', error);
        return res.status(500).json({ error: 'Failed to fetch books.' });
    }
});
router.delete('/:userId/:bookId', readLaterController.deleteReadLaterBook);
module.exports = router;
