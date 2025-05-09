import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Book, Calendar, LanguagesIcon as Language, Tag, User, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchBookDetails, pushReadLater,addBookmark,fetchReviews,addReview,deleteReview } from './api';
import{ReadLater} from './api';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import{Bookmark} from './api';
interface Review {
  user_id:string,
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface Books {
  book_id: number;
  title: string;
  published_date: string;
  language: string;
}

interface BookDetails {
  bookdetail: Books;
  authors: string;
  cover: string;
  ratings: number;
  links: string; // The link to the book
  reviews?: Review[];
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-blue-200'}`}
        />
      ))}
    </div>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

const BookDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const bookId = id ? Number(id) : null;
  const navigate = useNavigate();

  const [book, setBook] = useState<BookDetails | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userReview, setUserReview] = useState({ rating: 0, comment: '' });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Check if the user is logged in based on sessionStorage
  useEffect(() => {
    const userEmail = sessionStorage.getItem('userEmail');
    setIsLoggedIn(!!userEmail);
  }, []);

  useEffect(() => {
    const loadBookDetails = async () => {
      if (bookId === null) {
        setError('Invalid book ID.');
        setLoading(false);
        return;
      }
      try {
        const bookdetail = await fetchBookDetails(bookId);
        setBook(bookdetail);
        console.log('detail:', bookdetail);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load book details. Please try again later.');
        setLoading(false);
      }
    };

    loadBookDetails();
  }, [bookId]);

  useEffect(() => {
    const loadReviews = async () => {
        if (bookId) {
            try {
                const fetchedReviews = await fetchReviews(bookId);
                const mappedReviews = fetchedReviews.map((review: any) => ({
                    user_id: sessionStorage.getItem('userID'),
                    id: review.review_id,
                    user: review.username || "Anonymous", // Use the fetched username
                    rating: review.ratings, // Ensure you are using the correct field for ratings
                    comment: review.comment,
                    date: review.created_at,
                }));
                setReviews(mappedReviews);
                console.log(mappedReviews);
                console.log(sessionStorage.getItem('username'));
            } catch (err) {
                console.error('Error loading reviews', err);
            } finally {
                setLoadingReviews(false); // Ensure this is called in the finally block
            }
        }
    };

    loadReviews();
}, [bookId]);
  
  const handleSubmitReview = async () => {
    if (!isLoggedIn) {
      alert('You need to log in to submit a review.');
      return;
    }

    try {
      const reviewData = {
        user_id: sessionStorage.getItem('userID'),
        book_id: bookId,
        rating: userReview.rating,
        comment: userReview.comment,
        date: new Date().toISOString(),
        username:sessionStorage.getItem('username'),
      };
      await addReview(reviewData);
      alert('Review submitted successfully!');
      setUserReview({ rating: 0, comment: '' });
      const updatedReviews = await fetchReviews(bookId as number);
      setReviews(updatedReviews);
    } catch (err) {
      alert('Failed to submit review. Please try again later.');
      console.error('Error:', err);
    }
  };
  const handleDeleteReview = async (Id: number) => {
    if (!isLoggedIn) {
      alert('You need to log in to delete a review.');
      return;
    }
  
    try {
      // Call the deleteReview API function
      await deleteReview(Id); // Ensure reviewId is correct
  
      // Update the state to remove the deleted review
      setReviews((prevReviews) => prevReviews.filter(review => review.id !== Id));
  
      alert('Review deleted successfully!');
    } catch (err) {
      alert('Failed to delete review. Please try again later.');
      console.error('Error:', err);
    }
  };
  const handleAddToReadLater = async () => {
    // Check if bookId is valid (this might be dynamic or passed from props)
    if (!bookId) {
      alert('Book ID is invalid.');
      return;
    }
  
    // Assuming user_id is fetched from authentication (replace with your actual logic)
      const userId = sessionStorage.getItem('userID');  
      console.log("book detail id",userId);
    if (!userId) {
      alert('User is not authenticated.');
      return;
    }
  
    // Structure the data for the request
    const readLaterData: ReadLater = {
      user_id: userId,
      book_id: bookId,  // Make sure this matches the backend's expectation for the field name
      added_at: new Date().toISOString(),
    };
  
    console.log('Sending ReadLater data:', readLaterData); // Log the data being sent
  
    try {
      // Call the API function to add the book to the "Read Later" list
      await pushReadLater(readLaterData);
      alert('Added to Read Later successfully!');
    } catch (err) {
      // Error handling
      console.error('Failed to add to Read Later:', err);
      alert('Failed to add to Read Later. Please try again.');
    }
  };
  const handleAddBookmark = async () => {
  };
  useEffect(() => {
    const loadBookDetails = async () => {
      if (bookId === null) {
        setError('Invalid book ID.');
        setLoading(false);
        return;
      }
      try {
        const bookdetail = await fetchBookDetails(bookId);
        setBook(bookdetail);
        console.log('detail:', bookdetail);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    loadBookDetails();
  }, [bookId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error || !book) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error || 'Book not found'}</div>;
  }

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/3">
            <div className="sticky top-8">
              <img
                src={book.cover}
                alt={book.bookdetail.title}
                className="w-full h-auto rounded-2xl shadow-2xl mb-8 transition-transform duration-300 hover:scale-105"
              />
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-blue-900">About the Author</h3>
                <p className="text-blue-800 leading-relaxed">
                  {book.authors} is the author of this book. More details about the author can be added here.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:w-2/3">
            <h1 className="text-5xl font-bold mb-2 text-blue-900 leading-tight">{book.bookdetail.title}</h1>
            <h2 className="text-3xl text-blue-700 mb-4">by {book.authors}</h2>

            <div className="flex items-center mb-6">
              <StarRating rating={book.ratings} />
              <span className="ml-2 text-blue-600 font-semibold">({book.ratings})</span>
            </div>

            <div className="mb-8 bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-blue-900">Description</h3>
              <p className={`text-blue-800 leading-relaxed ${isDescriptionExpanded ? '' : 'line-clamp-3'}`}>
  The book <strong>{book.bookdetail.title}</strong> written by <strong>{book.authors}</strong> has a rating of <strong>{book.ratings}</strong>.
  {isDescriptionExpanded && ' It is hosted on EBMS and is originally published by Gutenberg.'}
</p>
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center"
              >
                {isDescriptionExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Read more
                  </>
                )}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-semibold mb-6 text-blue-900">Details</h3>
                <ul className="space-y-4">
                  <li className="flex items-center text-blue-800">
                    <Book className="w-6 h-6 mr-3 text-blue-500" />
                    <span className="font-medium w-32">ISBN:</span>
                    <span>{book.bookdetail.book_id}</span>
                  </li>
                  <li className="flex items-center text-blue-800">
                    <User className="w-6 h-6 mr-3 text-blue-500" />
                    <span className="font-medium w-32">Publisher:</span>
                    <span>Project Gutenberg</span>
                  </li>
                  <li className="flex items-center text-blue-800">
                    <Calendar className="w-6 h-6 mr-3 text-blue-500" />
                    <span className="font-medium w-32">Publication:</span>
                    <span>{formatDate(book.bookdetail.published_date)}</span>
                  </li>
                  <li className="flex items-center text-blue-800">
                    <Language className="w-6 h-6 mr-3 text-blue-500" />
                    <span className="font-medium w-32">Language:</span>
                    <span>{book.bookdetail.language}</span>
                  </li>
                  <li className="flex items-center text-blue-800">
                    <Tag className="w-6 h-6 mr-3 text-blue-500" />
                    <span className="font-medium w-32">Genre:</span>
                    <span>Fiction</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col justify-between">
                <div className="space-y-4">
                <button
  onClick={handleAddToReadLater}
  className={`w-full py-3 px-6 rounded-full transition duration-300 flex items-center justify-center text-lg font-semibold shadow-lg transform ${
    isLoggedIn 
      ? 'bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-xl hover:-translate-y-1'
      : 'bg-gray-400 text-gray-300 cursor-not-allowed'
  }`}
  disabled={!isLoggedIn}
>
  {isLoggedIn ? 'Add to Read Later' : 'Login to Add to Read Later'}
</button>
                  <button className="w-full bg-red-600 text-white py-3 px-6 rounded-full hover:bg-red-700 transition duration-300 flex items-center justify-center text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    <Heart className="w-6 h-6 mr-2" />
                    Favorite
                  </button>
                </div>
               <button 
  onClick={() => {
    if (isLoggedIn) {
      navigate(`/download/${book.bookdetail.book_id}`);
    } else {
      alert('Please log in to download books.');
    }
  }}
  className={`w-full py-3 px-6 rounded-full transition duration-300 flex items-center justify-center text-lg font-semibold shadow-lg transform ${
    isLoggedIn 
      ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-xl hover:-translate-y-1'
      : 'bg-gray-400 text-gray-300 cursor-not-allowed'
  }`}
  disabled={!isLoggedIn}
>
  <Download className="w-6 h-6 mr-2" />
  {isLoggedIn ? 'Download' : 'Download'}
</button>
                <div>
                <div className="mt-6">
                <button 
  onClick={() => {
    if (isLoggedIn) {
      // Open the book link in a new tab
      if (book?.links) {
        navigate(`/reader/${book.bookdetail.book_id}`, { state: { link: book.links } });
      } else {
        alert('No book link available.');
      }
    
      // Add the book to bookmarks
      handleAddBookmark();
    }
  }}
  className={`w-full py-3 px-6 rounded-full transition duration-300 flex items-center justify-center text-lg font-semibold shadow-lg transform ${
    isLoggedIn 
      ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1' 
      : 'bg-gray-400 text-gray-300 cursor-not-allowed'
  }`}
  disabled={!isLoggedIn}
>
  {isLoggedIn ? 'Read Book' : 'Login to Read'}
</button>

            </div>
</div>
              </div>
            </div>

            <div className="mb-12">

            </div>
          </div>
        </div>
      </div>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="lg:w-3/4">

          <div className="mb-8 bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-4 text-blue-900">Submit Your Review</h3>
            <div className="space-y-4">
              <div>
                <label className="text-blue-800">Rating (1 to 5):</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  className="border p-2 rounded"
                  value={userReview.rating}
                  onChange={(e) => setUserReview({ ...userReview, rating: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-blue-800">Comment:</label>
                <textarea
                  className="border p-2 rounded w-full"
                  value={userReview.comment}
                  onChange={(e) => setUserReview({ ...userReview, comment: e.target.value })}
                />
              </div>
              <button
                onClick={handleSubmitReview}
                className={`w-full py-3 px-6 rounded-full text-lg font-semibold shadow-lg ${
                  isLoggedIn ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-gray-400 text-gray-300 cursor-not-allowed'
                }`}
                disabled={!isLoggedIn}
              >
                Submit Review
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-blue-900">Reviews</h3>
    {loadingReviews ? (
        <p>Loading reviews...</p>
    ) : reviews.length > 0 ? (
        reviews.map((review) => (
            <div key={review.id} className="mb-4 bg-white p-4 rounded-lg shadow">
                <div className="flex items-center mb-2">
                    <StarRating rating={review.rating} />
                    <span className="ml-2 text-blue-600 font-medium">{review.user}</span>
                    {isLoggedIn &&sessionStorage.getItem('username') === review.user && (
                        <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="ml-auto text-red-600 hover:text-red-800"
                        >
                            Delete
                        </button>
                    )}
                </div>
                <p className="text-blue-800">{review.comment}</p>
                <div className="text-blue-500 text-sm mt-2">{formatDate(review.date)}</div>
            </div>
        ))
    ) : (
        <p className="text-blue-800">No reviews yet.</p>
      )}
          </div>
        </div>
      </div>
    </div>
    </div>
    
  );
};

export default BookDetailsPage;
