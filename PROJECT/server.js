require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 5001;
const cors = require('cors');
app.use(cors());  // Enable CORS for all routes
// Middleware to parse JSON
app.use(express.json());

// Root Route
app.get('/', (req, res) => {
    res.send('Welcome to the E-Book Management System!');
});

// Import and use books route
const booksRoute = require('./routes/books');
app.use('/books', booksRoute);
const  AuthorsRoute = require('./routes/authors');
app.use('/authors', AuthorsRoute);
const LinksRoute = require('./routes/booklinks');
app.use('/booklinks', LinksRoute);
const GenreRoute = require('./routes/genre');
app.use('/genre', GenreRoute);
const ReviewsRoute = require('./routes/reviews');
app.use('/reviews', ReviewsRoute);
const userRoute = require('./routes/user');
app.use('/user', userRoute);
const readLaterRoute = require('./routes/readLater');
app.use('/readLater', readLaterRoute);
// Default 404 Handler
app.use((req, res) => {
    res.status(404).send('Route not found');
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);

});
