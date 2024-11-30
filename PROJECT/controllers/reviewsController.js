const db = require('../db/connection');

// Get all books
exports.getAllReviews = (req, res) => {
    db.query('SELECT * FROM Reviews', (err, results) => {
        if (err) {
            console.error('Error fetching reviews:', err.message);
            return res.status(500).json({ error: 'Failed to fetch reviews' });
        }
        res.json(results);
    });
};
exports.getBookratings = (req, res) => {
    db.query(`SELECT b.book_id,round(avg(r.rating),1) as ratings FROM Reviews r
              join Book_reviews br on r.review_id=br.review_id
              join books b on br.book_id=b.book_id
              group by b.book_id`, (err, results) => {
        if (err) {
            console.error('Error fetching ratings:', err.message);
            return res.status(500).json({ error: 'Failed to fetch ratings' });
        }
        res.json(results);
    });
};
