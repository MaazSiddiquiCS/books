const express = require('express');
const router = express.Router();
const authorsController = require('../controllers/authorsController');
Author.belongsToMany(Book, { through: 'BookAuthors' });
// GET all books
router.get('/', async (req, res) => {
    try {
        const authors = await authorsController.getAllAuthors();
        res.json(authors);
    } catch (error) {
        console.error('Error fetching authors:', error);
        res.status(500).json({ error: 'Failed to fetch authors' });
    }
});