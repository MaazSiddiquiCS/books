const db = require('../db/connection');

// Get last read page for a specific user and book
exports.getBookmarkProgress = (req, res) => {
    const { user_id, book_id } = req.query;

    if (!user_id || !book_id) {
        return res.status(400).json({ error: 'User ID and Book ID are required' });
    }

    db.query(
        `SELECT read_last_page,total_pages,bookmark_date FROM bookmarks WHERE user_id = ? AND book_id = ?`,
        [user_id, book_id],
        (err, results) => {
            if (err) {
                console.error('Error fetching bookmark progress:', err.message);
                return res.status(500).json({ error: 'Failed to fetch bookmark progress' });
            }
            res.json(results[0] || null);
        }
    );
};

// Create or update a bookmark (with default read_last_page = 0)
exports.pushBookmark = (req, res) => {
    const { user_id, book_id, bookmark_date ,total_pages} = req.body;

    if (!user_id || !book_id) {
        return res.status(400).json({ error: 'User ID and Book ID are required' });
    }

    db.query(
        `INSERT INTO bookmarks (user_id, book_id, bookmark_date, read_last_page,total_pages)
         VALUES (?, ?, ?, 0,0)
         ON DUPLICATE KEY UPDATE 
            bookmark_date = VALUES(bookmark_date), 
            read_last_page = VALUES(read_last_page)`
        [user_id, book_id, bookmark_date || new Date(),total_pages],
        (err, result) => {
            if (err) {
                console.error('Error inserting bookmark:', err.message);
                return res.status(500).json({ error: 'Failed to add bookmark' });
            }
            res.status(201).json({
                message: 'Bookmark added or updated successfully',
                bookmark_id: result.insertId,
            });
        }
    );
};

// Update only read_last_page
exports.updateProgress = (req, res) => {
    const { user_id, book_id, read_last_page,total_pages } = req.body;

    if (!user_id || !book_id || read_last_page === undefined) {
        return res.status(400).json({ error: 'User ID, Book ID, and page number are required' });
    }

    db.query(
        `INSERT INTO bookmarks (user_id, book_id, read_last_page, total_pages, bookmark_date)
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE 
            read_last_page = VALUES(read_last_page),
            total_pages = VALUES(total_pages),
            bookmark_date = IF(VALUES(read_last_page) > read_last_page, VALUES(bookmark_date), bookmark_date)`,
        [user_id, book_id, read_last_page, total_pages],
        (err, result) => {
            if (err) {
                console.error('Error updating progress:', err.message);
                return res.status(500).json({ error: 'Failed to update progress' });
            }
            res.status(200).json({ 
                message: 'Progress updated successfully',
                affectedRows: result.affectedRows
            });
        }
    );
    
};

// Delete a bookmark
exports.deleteBookmark = (req, res) => {
    const { user_id, book_id } = req.query; // <-- use query here

    if (!user_id || !book_id) {
        return res.status(400).json({ message: 'User ID and Book ID are required.' });
    }

    db.query(
        'DELETE FROM bookmarks WHERE user_id = ? AND book_id = ?', 
        [user_id, book_id], 
        (err, results) => {
            if (err) {
                console.error('Error deleting bookmark:', err.message);
                return res.status(500).json({ message: 'Internal server error.' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Bookmark not found.' });
            }

            return res.status(200).json({ 
                message: 'Bookmark removed successfully.',
                affectedRows: results.affectedRows
            });
        }
    );
};

