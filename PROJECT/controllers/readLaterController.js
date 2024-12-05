const db = require('../db/connection');

// Get all books
exports.getReadLater = (req, res) => {
    db.query('SELECT* from readlater ', (err, results) => {
        if (err) {
            console.error('Error fetching authors:', err.message);
            return res.status(500).json({ error: 'Failed to fetch authors' });
        }
        res.json(results);
    });
};


// Push to Read Later function
exports.pushReadLater = (req, res) => {
  const { userId, bookId, addedAt } = req.body;

  // Validate input data
  if (!userId || !bookId) {
    return res.status(400).json({ error: 'User ID and Book ID are required' });
  }

  // First, check if the book is already in the user's read later list
  db.execute('SELECT * FROM readlater WHERE user_id = ? AND book_id = ?', [userId, bookId], (error, rows) => {
    if (error) {
      console.error('Error during query:', error);
      return res.status(500).json({ error: 'Error checking read later list', details: error.message });
    }

    // If the book is already in the read later list, return an error
    if (rows.length > 0) {
      return res.status(400).json({ error: 'Book is already in your read later list' });
    }

    // Now, insert the book into the read later list
    db.execute(
      `INSERT INTO readlater (user_id, book_id, added_at) VALUES (?, ?, ?)`,
      [userId, bookId, addedAt],  // Insert with the added_at field
      (insertError, insertResult) => {
        if (insertError) {
          console.error('Error inserting into read later list:', insertError);
          return res.status(500).json({ error: 'Error adding book to read later list', details: insertError.message });
        }

        // Return success message and the newly inserted readlater_id
        res.status(201).json({
          message: 'Book added to read later list successfully',
          readlater_id: insertResult.insertId,  // Return the auto-generated readlater_id
        });
      }
    );
  });
};
