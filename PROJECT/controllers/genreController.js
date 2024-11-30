const db = require('../db/connection');

// Get all books
exports.getAllGenre = (req, res) => {
    db.query('SELECT * FROM genres', (err, results) => {
        if (err) {
            console.error('Error fetching genre:', err.message);
            return res.status(500).json({ error: 'Failed to fetch genre' });
        }
        res.json(results);
    });
};
exports.getAllBookGenre = (req, res) => {
    db.query(`SELECT g.genre_id,b.book_id,g.genre_name FROM genres g
             join book_genre bg on g.genre_id=bg.genre_id
             join books b on bg.book_id=b.book_id`, (err, results) => {
        if (err) {
            console.error('Error fetching genre:', err.message);
            return res.status(500).json({ error: 'Failed to fetch genre' });
        }
        res.json(results);
    });
};
