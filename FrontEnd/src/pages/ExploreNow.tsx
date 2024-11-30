'use client';

import React, { useState, useEffect } from 'react';
import { fetchBooksWithAuthors, fetchBooksByGenre } from './api'; // Import both functions
import { BookCard } from './Home';

interface Book {
  id: number;
  title: string;
  authors: string;
  published_date: Date;
  language: string;
  cover: string;
  ratings: number;
}

const genreIds = [1, 10, 21, 22, 23, 50, 82, 87]; // Allowed genre IDs

export default function ExploreNow() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [booksPerPage] = useState<number>(50); // Display 50 books per page
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null); // Track selected genre
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Sorting order (ascending or descending)

  // Fetch and sort books by rating
  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      try {
        let response;
        if (selectedGenre) {
          response = await fetchBooksByGenre();
          console.log(response); // Fetch books by genre
        } else {
          response = await fetchBooksWithAuthors(); // Fetch all books
        }
        const sortedBooks = response.sort((a: Book, b: Book) => {
          return sortOrder === 'desc' ? b.ratings - a.ratings : a.ratings - b.ratings;
        });
        setBooks(sortedBooks); // Store sorted books in state
      } catch (error) {
        console.error('Failed to load books:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, [selectedGenre, sortOrder]); // Re-fetch books when genre or sortOrder changes

  // Get books for the current page
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  // Handle loading more books (pagination)
  const handleLoadMore = () => {
    setCurrentPage(currentPage + 1); // Increase page number
  };

  // Toggle the sort order between 'asc' and 'desc'
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  // Handle genre button click
  const handleGenreClick = (genre: number) => {
    setSelectedGenre(genre); // Set the selected genre
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Explore Books</h1>

      {/* Genre Buttons */}
      <div className="flex space-x-4 mb-6">
        {genreIds.map((genreId) => (
          <button
            key={genreId}
            onClick={() => handleGenreClick(genreId)}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Genre {genreId}
          </button>
        ))}
      </div>

      {/* Sort Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleSortOrder}
          className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600"
        >
          Sort by Rating: {sortOrder === 'desc' ? 'Descending' : 'Ascending'}
        </button>
      </div>

      {/* Books */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {currentBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {/* Load More Button */}
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        currentBooks.length < books.length && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 rounded-full text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Load More
            </button>
          </div>
        )
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(books.length / booksPerPage) }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-1 mx-1 rounded-full text-sm font-semibold ${
              currentPage === index + 1
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
