const db = require('../db/connection');

exports.getAllGenre = (req, res) => {
    // List of genre names we want to match against
    const genreNames = [
        'Crime', 
        'Romance', 
        'Sci-Fi', 
        'Action', 
        'Thriller',
        'Fantasy', 
        'Mystery', 
        'Horror', 
        'Adventure', 
        'Drama', 
        'Comedy'
    ];
    
    // Build the SQL query with the LIKE operator to match partial strings
    let query = 'SELECT genre_id, genre_name FROM genres WHERE';
    let queryParams = [];

    // Dynamically add each genre name condition using LIKE
    genreNames.forEach((genre, index) => {
        query += ` genre_name LIKE ?`;
        if (index < genreNames.length - 1) {
            query += ' OR'; // Add OR between conditions
        }
        queryParams.push(`%${genre}%`); // Use % for partial matching
    });

    // Run the query to fetch genres from the database
    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error fetching genres:', err.message);
            return res.status(500).json({ error: 'Failed to fetch genres' });
        }

        // Add an "All" option to the result
        const allGenresOption = { genre_id: null, genre_name: "All" };
        results.unshift(allGenresOption); // Add "All" option at the beginning

        res.json(results); // Return the list of genres with the "All" option
    });
};


// genreController.js

// Ensure genre_id is being used in the SQL query
exports.getAllBookGenre = (req, res) => {
    const { genre_id } = req.query;

    let query = `SELECT g.genre_id,b.book_id,g.genre_name FROM genres g
             join book_genre bg on g.genre_id=bg.genre_id
             join books b on bg.book_id=b.book_id`;

    if (genre_id) {
        query += ` WHERE g.genre_id = ?`;  // Ensure this is correctly used in the query
    }

    query += ` GROUP BY b.book_id`;

    db.query(query, [genre_id], (err, results) => {
        if (err) {
            console.error('Error fetching books by genre:', err.message);
            return res.status(500).json({ error: 'Failed to fetch books by genre' });
        }

        res.json(results); // Return books with covers and ratings
    });
};
