const db = require('../db/connection');

// Get all books
exports.getAllBooklinks = (req, res) => {
    db.query(` select bl.link, b.book_id FROM booklinks bl 
        JOIN bookformat bf ON bl.type_id = bf.id 
        JOIN books b ON bl.book_id = b.book_id 
        WHERE bf.id = 4 AND bl.link LIKE '%.txt.utf-8'`, (err, results) => {
        if (err) {
            console.error('Error fetching links:', err.message);
            return res.status(500).json({ error: 'Failed to fetch links' });
        }
        res.json(results);
    });
};
exports.getbookcover = (req, res) => {
    db.query(` select bl.link, b.book_id FROM booklinks bl 
        JOIN bookformat bf ON bl.type_id = bf.id 
        JOIN books b ON bl.book_id = b.book_id 
        WHERE bf.id = 6 AND bl.link LIKE '%cover.medium.jpg'`, (err, results) => {
        if (err) {
            console.error('Error fetching cover:', err.message);
            return res.status(500).json({ error: 'Failed to fetch covers' });
        }
        res.json(results);
    });
};