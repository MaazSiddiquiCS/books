const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');

// POST /download
router.post('/', downloadController.downloadBook);
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
// GET /content/:bookId/:format - for testing
router.get('/content/:bookId/:format', downloadController.getBookContentRoute);

// POST /record-download
router.post('/record-download', downloadController.recordDownload);
router.get('/numdownloads', downloadController.getnumdownloads);
module.exports = router;