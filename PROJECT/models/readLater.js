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
router.get('/', async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  try {
    const [rows] = await readLaterController.getReadLater();
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching read later books:', error);
    res.status(500).json({ error: 'Failed to fetch books.' });
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
