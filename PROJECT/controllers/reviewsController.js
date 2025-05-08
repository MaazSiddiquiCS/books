const db = require('../db/connection');

// Fetch all reviews
exports.getAllReviews = (req, res) => {
    const { book_id } = req.query; // Fetch book_id from query
    if (!book_id) {
        return res.status(400).json({ error: 'Book ID is required' });
    }

    db.query(
        `SELECT 
            r.review_id,
            ROUND(AVG(r.rating), 1) AS ratings,
            r.comment,
            r.created_at,
            br.book_id,
            u.username
         FROM reviews r 
         JOIN book_reviews br ON r.review_id = br.review_id
         JOIN user_reviews ur ON r.review_id = ur.review_id
         JOIN users u ON ur.user_id = u.user_id
         WHERE br.book_id = ?
         GROUP BY r.review_id, r.comment, r.created_at, br.book_id,u.username`,
        [book_id],
        (err, results) => {
            if (err) {
                console.error('Error fetching reviews:', err.message);
                return res.status(500).json({ error: 'Failed to fetch reviews' });
            }
            res.json(results);
        });
};


// Fetch average ratings for books
exports.getBookRatings = (req, res) => {
    db.query(
        `SELECT b.book_id, ROUND(AVG(r.rating), 1) AS ratings
         FROM reviews r
         JOIN Book_reviews br ON r.review_id = br.review_id
         JOIN Books b ON br.book_id = b.book_id
         GROUP BY b.book_id`,
        (err, results) => {
            if (err) {
                console.error('Error fetching ratings:', err.message);
                return res.status(500).json({ error: 'Failed to fetch book ratings' });
            }
            res.json(results);
        }
    );
};

// Add a new review
exports.addReview = (req, res) => {
    const { rating, comment, user_id, book_id } = req.body;

    // Validate input
    if (!rating || typeof rating !== 'number' || !comment || !user_id || !book_id) {
        return res.status(400).json({ error: 'Rating, comment, user ID, and book ID are required' });
    }

    // Start a transaction
    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to start transaction' });
        }

        // Insert into Reviews table
        db.query(
            `INSERT INTO reviews (rating, comment, created_at) VALUES (?, ?, NOW())`,
            [rating, comment],
            (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Error adding review:', err.message);
                        return res.status(500).json({ error: 'Failed to add review' });
                    });
                }

                const review_id = result.insertId; // Get the inserted review ID

                // Insert into user_reviews table
                db.query(
                    `INSERT INTO user_reviews (user_id, review_id) VALUES (?, ?)`,
                    [user_id, review_id],
                    (err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error('Error adding user review association:', err.message);
                                return res.status(500).json({ error: 'Failed to associate user with review' });
                            });
                        }

                        // Insert into book_reviews table
                        db.query(
                            `INSERT INTO book_reviews (book_id, review_id) VALUES (?, ?)`,
                            [book_id, review_id],
                            (err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        console.error('Error adding book review association:', err.message);
                                        return res.status(500).json({ error: 'Failed to associate book with review' });
                                    });
                                }

                                // Commit the transaction
                                db.commit((err) => {
                                    if (err) {
                                        return db.rollback(() => {
                                            console.error('Error committing transaction:', err.message);
                                            return res.status(500).json({ error: 'Failed to commit transaction' });
                                        });
                                    }

                                    res.status(201).json({ message: 'Review added successfully', reviewId: review_id });
                                });
                            }
                        );
                    }
                );
            }
        );
    });
};

// Delete a review by ID
// Delete a review by ID
exports.deleteReview = (req, res) => {
    const { review_id } = req.params;

    if (!review_id) {
        return res.status(400).json({ error: 'Review ID is required' });
    }

    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to start transaction' });
        }

        db.query(`DELETE FROM user_reviews WHERE review_id = ?`, [review_id], (err) => {
            if (err) {
                console.error('Error deleting user review:', err.message);
                return db.rollback(() => res.status(500).json({ error: 'Failed to delete user review' }));
            }

            db.query(`DELETE FROM book_reviews WHERE review_id = ?`, [review_id], (err) => {
                if (err) {
                    console.error('Error deleting book review:', err.message);
                    return db.rollback(() => res.status(500).json({ error: 'Failed to delete book review' }));
                }

                db.query(`DELETE FROM reviews WHERE review_id = ?`, [review_id], (err, result) => {
                    if (err || result.affectedRows === 0) {
                        console.error('Error deleting review:', err ? err.message : 'Review not found');
                        return db.rollback(() => res.status(500).json({ error: err ? 'Failed to delete review' : 'Review not found' }));
                    }

                    db.commit((err) => {
                        if (err) {
                            console.error('Error committing transaction:', err.message);
                            return db.rollback(() => res.status(500).json({ error: 'Failed to commit transaction' }));
                        }

                        res.status(200).json({ message: 'Review deleted successfully' });
                    });
                });
            });
        });
    });
};
