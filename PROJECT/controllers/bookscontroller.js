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
    const { book_id, published_date, language, id, title, author_id, genre_id, publisher_id } = req.body;

    // Validate all required fields
    if (!book_id || !published_date || !language || !title || !author_id || !genre_id || !publisher_id) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Insert the book into the 'books' table
    db.query(
        'INSERT INTO books (book_id, published_date, language) VALUES (?, ?, ?)',
        [book_id, published_date, language],
        (err, results) => {
            if (err) {
                console.error('Error adding book:', err.message);
                return res.status(500).json({ error: 'Failed to add book' });
            }

            console.log('Inserted Book ID:', book_id); // This is the book_id provided in the request

            // Insert related data into 'booktitles' using book_id
            db.query(
                'INSERT INTO booktitles (id, Book_id, title) VALUES (?, ?, ?)',
                [id, book_id, title], // Use book_id instead of insertedBookId
                (err, results) => {
                    if (err) {
                        console.error('Error adding book title:', err);
                        return res.status(500).json({ error: 'Failed to add book title', details: err.message });
                    }

                    // Insert book genre into 'book_genre'
                    db.query(
                        'INSERT INTO book_genre (Book_id, genre_id) VALUES (?, ?)',
                        [book_id, genre_id], // Use book_id instead of insertedBookId
                        (err, results) => {
                            if (err) {
                                console.error('Error adding book genre:', err.message);
                                return res.status(500).json({ error: 'Failed to add book genre' });
                            }

                            // Insert book publisher into 'book_publisher'
                            db.query(
                                'INSERT INTO book_publisher (Book_id, publisher_id) VALUES (?, ?)',
                                [book_id, publisher_id], // Use book_id instead of insertedBookId
                                (err, results) => {
                                    if (err) {
                                        console.error('Error adding book publisher:', err.message);
                                        return res.status(500).json({ error: 'Failed to add book publisher' });
                                    }

                                    res.status(201).json({
                                        message: 'Book added successfully',
                                        bookId: book_id // Return the book_id provided in the request
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};
