import React, { useState, useEffect } from 'react';
import { fetchBooksWithAuthors, fetchBooksByGenre, fetchGenres } from './api';
import { BookCard } from './Home';
import { Link } from 'react-router-dom';
import {Book} from './Home'
// Define the Book interface

export interface Genre {
  genre_id: number;
  genre_name: string;
}

export default function ExploreNow() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [booksPerPage] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [genres, setGenres] = useState<Genre[]>([]);

  // Fetch genres when the component mounts
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const genresData = await fetchGenres();
        console.log('Fetched genres:', genresData);
        setGenres(genresData);
      } catch (error) {
        console.error('Failed to load genres:', error);
      }
    };
    loadGenres();
  }, []);

  const handleGenreClick = (genreId: number) => {
    console.log('Selected genre:', genreId);
    setSelectedGenre(genreId === selectedGenre ? null : genreId);
    setCurrentPage(1);
  };

  // Fetch books based on the selected genre or fetch all books
  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      try {
        let response: Book[] = [];
        if (selectedGenre !== null) {
          const genreBooks = await fetchBooksByGenre(selectedGenre);
          response = genreBooks.map((book: any) => ({
            ...book,
            id: book.book_id || book.id,
          }));
        } else {
          const allBooks = await fetchBooksWithAuthors();
          response = allBooks.map((book: any) => ({
            ...book,
            id: book.book_id || book.id,
          }));
        }
        console.log('Books fetched for ExploreNow:', response);
        const sortedBooks = response.sort((a, b) =>
          sortOrder === 'desc' ? b.ratings - a.ratings : a.ratings - b.ratings
        );

        setBooks(sortedBooks);

      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };
  
    loadBooks();
  }, [selectedGenre,sortOrder]);
  

  // Paginate books
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  console.log('Current books:', currentBooks);

  const handleLoadMore = () => {
    setCurrentPage(currentPage + 1);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Explore Books</h1>

      {/* Genre Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {genres.map((genre) => (
          <button
            key={genre.genre_id}
            onClick={() => handleGenreClick(genre.genre_id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
              selectedGenre === genre.genre_id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {genre.genre_name}
          </button>
        ))}
      </div>

      {/* Sort Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleSortOrder}
          className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors duration-200"
        >
          Sort by Rating: {sortOrder === 'desc' ? 'Highest First' : 'Lowest First'}
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Book Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {currentBooks.length > 0 ? (
              currentBooks.map((book: Book) => (
                <BookCard key={book.id} book={book} />
              ))
            ) : (
              <div className="col-span-full text-center text-lg text-gray-500">
                No books found for this genre.
              </div>
            )}
          </div>

          {/* Load More Button */}
          {currentBooks.length < books.length && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 rounded-full text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
