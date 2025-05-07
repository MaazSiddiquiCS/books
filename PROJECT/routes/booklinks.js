const express = require('express');
const axios = require('axios');
const path = require('path');
const router = express.Router();
const booklinksController = require('../controllers/booklinksController');

// GET all books
router.get('/', booklinksController.getAllBooklinks);

// Proxy route for book content (HTML)
router.get('/links/:bookId', booklinksController.getBookContent);

// Proxy route for images and other assets (i.e., handle requests for /booklinks/images/:bookId/*)

router.get('/proxy', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) {
        console.error('Error proxying:', error.message);
        res.status(404).json({ error: 'Resource not found' });
    }
});

// Proxy route for other assets (like CSS, JS)
// router.get('/assets/:bookId/*', async (req, res) => {
//     const { bookId } = req.params;
//     const assetUrl = `https://www.gutenberg.org/files/${bookId.substring(0, 4)}/${bookId}-h/${req.params[0]}`;

//     try {
//         // Fetch the asset from Project Gutenberg
//         const assetResponse = await axios.get(assetUrl);

//         // Set the appropriate content type for the asset
//         const contentType = assetResponse.headers['content-type'];
//         res.set('Content-Type', contentType);

//         // Send the asset content to the client
//         res.send(assetResponse.data);
//     } catch (error) {
//         console.error('Error fetching asset:', error.message);
//         res.status(500).json({ error: 'Failed to fetch asset from external server' });
//     }
// });

// Other routes (e.g., bookcover, linkonly)
router.get('/bookcover', booklinksController.getbookcover);
router.get('/linkonly/:bookId', booklinksController.getBookLinkOnly);

module.exports = router;
