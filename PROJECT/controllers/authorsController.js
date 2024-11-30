const db = require('../db/connection');

// Get all books
exports.getAllAuthors = (req, res) => {
    db.query('SELECT * FROM authors', (err, results) => {
        if (err) {
            console.error('Error fetching authors:', err.message);
            return res.status(500).json({ error: 'Failed to fetch authors' });
        }
        res.json(results);
    });
};
