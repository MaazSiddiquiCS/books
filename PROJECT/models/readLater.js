// readLater.js
const express = require('express');
const router = express.Router();
const readLaterController = require('../controllers/readLaterController');

// Fetch read later books for a specific user

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
module.exports = (sequelize, DataTypes) => {
    const ReadLater = sequelize.define('ReadLater', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        book_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    });

    return ReadLater;
};
module.exports = router;