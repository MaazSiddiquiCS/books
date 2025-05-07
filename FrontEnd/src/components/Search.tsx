import React, { useEffect, useState } from 'react';
import { fetchBooksWithAuthors } from '../pages/api';
import { Star, BookmarkPlus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {Book} from '../pages/Home';
const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const location = useLocation();

  // Helper to get query param
  const getQueryParam = (key: string) => {
    return new URLSearchParams(location.search).get(key) || '';
  };

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const books = await fetchBooksWithAuthors();
        setAllBooks(books);

        const query = getQueryParam('query').toLowerCase();
        setSearchTerm(query);

        const filtered = books.filter((book:Book) => {
          return (
            book.title?.toLowerCase().includes(query) ||
            book.authors?.toLowerCase().includes(query)
          );
        });

        setFilteredBooks(filtered);
      } catch (error) {
        console.error('Failed to load books:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, [location.search]); // re-run when query string changes

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchTerm(query);

    const filtered = allBooks.filter((book) => {
      return (
        book.title?.toLowerCase().includes(query) ||
        book.authors?.toLowerCase().includes(query) ||
        book.genre?.toLowerCase().includes(query)
      );
    });

    setFilteredBooks(filtered);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search by title, author, or genre"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {loading ? (
        <p className="text-center text-gray-500">Loading books...</p>
      ) : filteredBooks.length === 0 ? (
        <p className="text-center text-gray-600">No books found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredBooks.map((book) => (
            <div
              key={book.book_id}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg"
            >
              <Link to={`/BookDetail/${book.book_id}`}>
                <img
                  src={book.cover || '/default-cover.jpg'}
                  alt={book.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 truncate">
                    {book.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{book.authors}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-xs text-gray-700">{book.ratings || 'N/A'}</span>
                    </div>
                    <BookmarkPlus className="h-4 w-4 text-blue-600 hover:text-blue-800 transition-colors" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
