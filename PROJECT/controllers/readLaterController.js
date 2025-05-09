const db = require('../db/connection');


// Get all books
exports.getReadLater = (user_id, res) => {
    db.query(`SELECT book_id FROM readlater WHERE user_id = ?`, [user_id], (err, results) => {
        if (err) {
            console.error('Error fetching authors:', err.message);
            return res.status(500).json({ error: 'Failed to fetch authors' });
        }
        // Send response only once
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

  // Convert ISO date to MySQL datetime format
  const mysqlDate = addedAt ? new Date(addedAt).toISOString().slice(0, 19).replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' ');

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
      [userId, bookId, mysqlDate],  // Use the converted date
      (insertError, insertResult) => {
        if (insertError) {
          console.error('Error inserting into read later list:', insertError);
          return res.status(500).json({ error: 'Error adding book to read later list', details: insertError.message });
        }

        res.status(201).json({
          message: 'Book added to read later list successfully',
          readlater_id: insertResult.insertId,
        });
      }
    );
  });
};
exports.deleteReadLaterBook = (req, res) => {
  const { userId, bookId } = req.params;

  // Validate input
  if (!userId || !bookId) {
      return res.status(400).json({ message: 'User  ID and Book ID are required.' });
  }

  // Perform the delete operation
  db.query('DELETE FROM readlater WHERE user_id = ? AND book_id = ?', [userId, bookId], (err, results) => {
      if (err) {
          console.error('Error deleting book from Read Later:', err);
          return res.status(500).json({ message: 'Internal server error.' });
      }

      if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'Book not found in Read Later list.' });
      }

      return res.status(200).json({ message: 'Book removed from Read Later list.' });
  });
};
