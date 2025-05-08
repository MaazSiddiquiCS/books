const db = require('../db/connection');
// Get all books
exports.getAllBooks = (req, res) => {
    const { book_id } = req.query;

    // Base query to fetch books
    let query = `
        SELECT 
            b.book_id, 
            MIN(t.title) AS title, 
            b.published_date, 
            b.language
        FROM books b
        JOIN booktitles t ON b.book_id = t.book_id`;

    // Add filtering condition if book_id is provided
    if (book_id) {
        query += ` WHERE b.book_id = ?`;
    }

    query += ` GROUP BY b.book_id, b.published_date, b.language`;

    // Execute the query
    db.query(query, [book_id], (err, results) => {
        if (err) {
            console.error('Error fetching books:', err.message);
            return res.status(500).json({ error: 'Failed to fetch books' });
        }

        // Return the query results as JSON
        res.json(results);
    });
};


exports.getbookauthors = (req, res) => {
    db.query('SELECT a.name,b.book_id from authors a join authorbooks ab on a.author_id=ab.author_id join books b on ab.book_id=b.book_id', (err, results) => {
        if (err) {
            console.error('Error fetching authors:', err.message);
            return res.status(500).json({ error: 'Failed to fetch authors' });
        }
        res.json(results);
    });
    
};
// Add a new book
// Add a new book
exports.addBook = (req, res) => {
    const { book_id, published_date, language, id, title, author_id, genre_id, publisher_id, link, type_id, link_id } = req.body;

    // Validate all required fields
    if (!book_id || !published_date || !language || !title || !author_id || !genre_id || !publisher_id || !link || !type_id) {
        return res.status(400).json({ error: 'All fields are required including link and type_id' });
    }

    db.query(
        'INSERT INTO books (book_id, published_date, language) VALUES (?, ?, ?)',
        [book_id, published_date, language],
        (err, results) => {
            if (err) {
                console.error('Error adding book:', err.message);
                return res.status(500).json({ error: 'Failed to add book' });
            }

            console.log('Inserted Book ID:', book_id);

            db.query(
                'INSERT INTO booktitles (id, book_id, title) VALUES (?, ?, ?)',
                [id, book_id, title],
                (err, results) => {
                    if (err) {
                        console.error('Error adding book title:', err);
                        return res.status(500).json({ error: 'Failed to add book title', details: err.message });
                    }

                    db.query(
                        'INSERT INTO book_genre (book_id, genre_id) VALUES (?, ?)',
                        [book_id, genre_id],
                        (err, results) => {
                            if (err) {
                                console.error('Error adding book genre:', err.message);
                                return res.status(500).json({ error: 'Failed to add book genre' });
                            }

                            db.query(
                                'INSERT INTO book_publisher (book_id, publisher_id) VALUES (?, ?)',
                                [book_id, publisher_id],
                                (err, results) => {
                                    if (err) {
                                        console.error('Error adding book publisher:', err.message);
                                        return res.status(500).json({ error: 'Failed to add book publisher' });
                                    }

                                    // Insert into booklinks
                                    db.query(
                                        'INSERT INTO booklinks (book_id, Link, type_id, Link_id) VALUES (?, ?, ?, ?)',
                                        [book_id, link, type_id, link_id],
                                        (err, results) => {
                                            if (err) {
                                                console.error('Error adding book link:', err.message);
                                                return res.status(500).json({ error: 'Failed to add book link' });
                                            }

                                            res.status(201).json({
                                                message: 'Book added successfully with link',
                                                bookId: book_id
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};


exports.addBookmark = (req, res) => {
    const { user_id, book_id, bookmark_date } = req.body;

    // Validate input data
    if (!user_id || !book_id) {
        return res.status(400).json({ error: 'User ID and Book ID are required' });
    }

    // First, check if the book is already in the user's bookmarks
    db.execute('SELECT * FROM bookmarks WHERE user_id = ? AND book_id = ?', [user_id, book_id], (error, rows) => {
        if (error) {
            console.error('Error during query:', error);
            return res.status(500).json({ error: 'Error checking bookmarks', details: error.message });
        }

        // If the book is already bookmarked, return an error
        if (rows.length > 0) {
            return res.status(400).json({ error: 'Book is already in your bookmarks' });
        }

        // Insert the bookmark
        db.execute(
            'INSERT INTO bookmarks (user_id, book_id, bookmark_date) VALUES (?, ?, ?)',
            [user_id, book_id, bookmark_date],
            (insertError, insertResult) => {
                if (insertError) {
                    console.error('Error inserting bookmark:', insertError);
                    return res.status(500).json({ error: 'Error adding bookmark', details: insertError.message });
                }

                // Return success message and the newly inserted bookmark_id
                res.status(201).json({
                    message: 'Bookmark added successfully',
                    bookmark_id: insertResult.insertId,
                });
            }
        );
    });
};
exports.getBookmarks = (user_id, res) => {
    db.query('SELECT * FROM bookmarks WHERE user_id = ?', [user_id], (err, results) => {
        if (err) {
            console.error('Error fetching bookmarks:', err.message);
            return res.status(500).json({ error: 'Failed to fetch bookmarks' });
        }
        res.json(results);
    });
};

// Delete a bookmark
exports.deleteBookmark = (req, res) => {
    const { userId, bookId } = req.params;

    // Validate input
    if (!userId || !bookId) {
        return res.status(400).json({ message: 'User  ID and Book ID are required.' });
    }

    db.query('DELETE FROM bookmarks WHERE user_id = ? AND book_id = ?', [userId, bookId], (err, results) => {
        if (err) {
            console.error('Error deleting bookmark:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Bookmark not found.' });
        }

        return res.status(200).json({ message: 'Bookmark removed successfully.' });
    });
};
