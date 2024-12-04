import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Book, Calendar, LanguagesIcon as Language, Tag, User, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchBookDetails } from './api';

interface Review {
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
  links: string;  // The link to the book
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

  const [book, setBook] = useState<BookDetails | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.log("detail:", bookdetail);
        setLoading(false);
      } catch (err) {
        setError('Failed to load book details. Please try again later.');
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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sit amet accumsan turpis.
                {isDescriptionExpanded && " Vivamus vitae est et nisi bibendum dignissim."}
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
                  <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-full hover:bg-blue-700 transition duration-300 flex items-center justify-center text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    <ShoppingCart className="w-6 h-6 mr-2" />
                    Add to Cart
                  </button>
                  <button className="w-full bg-red-600 text-white py-3 px-6 rounded-full hover:bg-red-700 transition duration-300 flex items-center justify-center text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    <Heart className="w-6 h-6 mr-2" />
                    Add to Wishlist
                  </button>
                </div>
              </div>
            </div>

            {/* Open the book link */}
            <div className="mt-6">
              <button 
                onClick={() => window.open(book.links, '_blank')} 
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-full hover:bg-lightblue-700 transition duration-300 flex items-center justify-center text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Read Book
              </button>
            </div>
            
            {/* Reviews */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-semibold mb-6 text-blue-900">Customer Reviews</h3>
              {book.reviews && book.reviews.length > 0 ? (
                book.reviews.map((review) => (
                  <div key={review.id} className="mb-8">
                    <StarRating rating={review.rating} />
                    <p className="text-blue-800 mt-2">{review.comment}</p>
                    <p className="text-sm text-gray-500 mt-2">By {review.user} on {review.date}</p>
                  </div>
                ))
              ) : (
                <p>No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsPage;