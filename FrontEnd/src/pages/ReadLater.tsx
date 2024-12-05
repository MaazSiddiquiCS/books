import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Clock, Trash2, Calendar, BookMarked } from 'lucide-react';
import { fetchReadLaterBooks } from './api';

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  addedDate: string;
}

const ReadLaterItem: React.FC<{ book: Book; onRemove: (id: number) => void }> = ({ book, onRemove }) => (
  <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-md transition duration-300 hover:shadow-lg">
    <img src={book.cover} alt={book.title} className="w-16 h-24 object-cover rounded-md" />
    <div className="flex-grow">
      <h3 className="font-semibold text-lg text-gray-900">{book.title}</h3>
      <p className="text-sm text-gray-600">{book.author}</p>
      <div className="flex items-center mt-2 text-sm text-gray-500">
        <Calendar className="h-4 w-4 mr-1" />
        <span>Added: {book.addedDate}</span>
      </div>
    </div>
    <div className="flex space-x-2">
      <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300" title="Start Reading">
        <BookOpen className="h-5 w-5" />
      </button>
      <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300" title="Mark as Read">
        <BookMarked className="h-5 w-5" />
      </button>
      <button onClick={() => onRemove(book.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300" title="Remove from Read Later">
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  </div>
);

const ReadLater: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      const userId = sessionStorage.getItem("userID");
      if (!userId) {
        alert("User is not authenticated.");
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

  const removeBook = (id: number) => {
    setBooks(books.filter((book) => book.id !== id));
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {filteredBooks.map((book) => (
          <ReadLaterItem key={book.id} book={book} onRemove={removeBook} />
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Your 'Read Later' list is empty.</p>
          <p className="text-sm text-gray-500 mt-2">Start adding books you want to read!</p>
        </div>
      )}
    </div>
  );
};

export default ReadLater;
