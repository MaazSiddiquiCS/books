const express = require('express');
const router = express.Router();
const readLaterController = require('../controllers/readLaterController');

router.get('/', async (req, res) => {
    try {
        const books = await readLaterController.getReadLater();
        res.json(books);
    } catch (error) {
        console.error('Error fetching authors:', error);
        res.status(500).json({ error: 'Failed to fetch authors' });
    }
});

// POST new user (signup)
router.post('/', async (req, res) => {
    try {
      const book = await readLaterController.pushReadLater(req.body);
      res.status(201).json(book);  // Send back the response from the controller
    } catch (error) {
      console.error('Error creating book:', error);
      res.status(500).json({ error: error.message || 'Failed to create book' });
    }
  });
