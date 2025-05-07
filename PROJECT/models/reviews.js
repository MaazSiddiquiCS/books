const reviewsModel = require('../controllers/reviewsController');

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await reviewsModel.getAllReviews();
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Get average ratings for books
exports.getBookRatings = async (req, res) => {
  try {
    const ratings = await reviewsModel.getBookRatings();
    res.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error.message);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
};

// Add a new review
exports.addReview = async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and comment are required' });
  }

  try {
    const review_id = await reviewsModel.addReview(rating, comment);
    res.status(201).json({ message: 'Review added successfully', review_id });
  } catch (error) {
    console.error('Error adding review:', error.message);
    res.status(500).json({ error: 'Failed to add review' });
  }
};

// Delete a review by ID
exports.deleteReview = async (req, res) => {
  const { review_id } = req.params;

  if (!review_id) {
    return res.status(400).json({ error: 'Review ID is required' });
  }

  try {
    const affectedRows = await reviewsModel.deleteReview(review_id);

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error.message);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};
