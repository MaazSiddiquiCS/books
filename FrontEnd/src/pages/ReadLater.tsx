import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Clock, Trash2, Calendar } from 'lucide-react';
import { fetchReadLaterBooks } from './api'; // Import the necessary API functions
import { Link } from 'react-router-dom';

interface Book {
  book_id: number; // Ensure this matches your data structure
  title: string;
  authors: string;
  cover: string;
  addedDate: string;
}

const ReadLaterItem: React.FC<{ book: Book; onRemove: (book_id: number) => void }> = ({ book, onRemove }) => (
  <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-md transition duration-300 hover:shadow-lg">
    <img src={book.cover} alt={book.title} className="w-16 h-24 object-cover rounded-md" />
    <div className="flex-grow">
      <h3 className="font-semibold text-lg text-gray-900">{book.title}</h3>
      <p className="text-sm text-gray-600">{book.authors}</p>
      <div className="flex items-center mt-2 text-sm text-gray-500">
        <Calendar className="h-4 w-4 mr-1" />
        <span>Added: {book.addedDate}</span>
      </div>
    </div>
    <div className="flex space-x-2">
      <Link to={`/BookDetail/${book.book_id}`} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300" title="View Details">
        <BookOpen className="h-5 w-5" />
      </Link>
      <button onClick={() => onRemove(book.book_id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300" title="Remove from Read Later">
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  </div>
);

const ReadLater: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const fetchBooks = async () => {
      const userId = sessionStorage.getItem("userID");
      console.log("User  ID:", userId);
      if (!userId) {
        alert("User  is not authenticated.");
        return;
      }

      try {
        const enrichedBooks = await fetchReadLaterBooks(userId);
        setBooks(enrichedBooks);
        
      } catch (error) {
        console.error("Error fetching books:", error);
        alert("Failed to load your 'Read Later' list.");
      }
    };

    fetchBooks();
  }, []);

  const removeBook = async (book_id: number) => { // Accept book_id as a parameter
    const userId = sessionStorage.getItem("userID");
    console.log("User  ID:", userId);
    console.log("Book ID:", book_id); // Log the book_id

    if (!userId) {
      alert("User  is not authenticated.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/readLater/${userId}/${book_id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete the book from Read Later');
      }
      setBooks(books.filter(book => book.book_id !== book_id)); // Use book.book_id
    } catch (error) {
      console.error("Error removing book:", error);
      alert("Failed to remove the book from 'Read Later'.");
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.authors.toLowerCase().includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    const userEmail = sessionStorage.getItem('userEmail');
    console.log(userEmail);
    setIsLoggedIn(!!userEmail); // Set logged-in status
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Please log in to access your read later list.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Clock className="h-8 w-8 text-teal-500" />
          <h1 className="text-3xl font-bold text-gray-900 ml-2">Read Later</h1>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search read later list..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="space-y-4">
        {filteredBooks.map(book => (
          <ReadLaterItem key={book.book_id} book={book} onRemove={removeBook} />
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Your read later list is empty.</p>
          <p className="text-sm text-gray-500 mt-2">Start adding books you want to read!</p>
        </div>
      )}
    </div>
  );
};

export default ReadLater;