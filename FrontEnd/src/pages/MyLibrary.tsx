import React, { useState } from 'react';
import { BookOpen, BookmarkPlus, Clock, Check, Search } from 'lucide-react';

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  progress: number;
}

const myBooks: Book[] = [
  { id: 1, title: "To Kill a Mockingbird", author: "Harper Lee", cover: "/placeholder.svg?height=200&width=150", progress: 75 },
  { id: 2, title: "1984", author: "George Orwell", cover: "/placeholder.svg?height=200&width=150", progress: 30 },
  { id: 3, title: "Pride and Prejudice", author: "Jane Austen", cover: "/placeholder.svg?height=200&width=150", progress: 100 },
  { id: 4, title: "The Great Gatsby", author: "F. Scott Fitzgerald", cover: "/placeholder.svg?height=200&width=150", progress: 50 },
  { id: 5, title: "Moby Dick", author: "Herman Melville", cover: "/placeholder.svg?height=200&width=150", progress: 10 },
  { id: 6, title: "The Catcher in the Rye", author: "J.D. Salinger", cover: "/placeholder.svg?height=200&width=150", progress: 90 },
  { id: 7, title: "Jane Eyre", author: "Charlotte Brontë", cover: "/placeholder.svg?height=200&width=150", progress: 60 },
  { id: 8, title: "The Hobbit", author: "J.R.R. Tolkien", cover: "/placeholder.svg?height=200&width=150", progress: 40 },
];

const readLaterBooks: Book[] = [
  { id: 9, title: "Dune", author: "Frank Herbert", cover: "/placeholder.svg?height=200&width=150", progress: 0 },
  { id: 10, title: "The Alchemist", author: "Paulo Coelho", cover: "/placeholder.svg?height=200&width=150", progress: 0 },
  { id: 11, title: "Brave New World", author: "Aldous Huxley", cover: "/placeholder.svg?height=200&width=150", progress: 0 },
  { id: 12, title: "The Odyssey", author: "Homer", cover: "/placeholder.svg?height=200&width=150", progress: 0 },
];

const BookCard: React.FC<{ book: Book }> = ({ book }) => (
  <div className="relative group bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 ease-in-out transform hover:scale-105">
    <img src={book.cover} alt={book.title} className="w-full h-48 object-cover" />
    <div className="p-4">
      <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">{book.title}</h3>
      <p className="text-sm text-gray-600 mb-2">{book.author}</p>
      {book.progress > 0 && (
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
            <div style={{ width: `${book.progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
          </div>
          <span className="text-xs text-gray-600">{book.progress}% completed</span>
        </div>
      )}
    </div>
    {book.progress === 0 && (
      <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
        <BookOpen className="h-5 w-5 text-teal-600" />
      </button>
    )}
  </div>
);

const MyLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filterBooks = (books: Book[]) => {
    return books.filter(book => 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">My Library</h1>
      
      <div className="mb-8 relative">
        <input
          type="text"
          placeholder="Search your books..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      <section className="mb-12">
        <div className="flex items-center mb-6">
          <BookOpen className="h-6 w-6 text-teal-600" />
          <h2 className="text-2xl font-semibold text-gray-900 ml-2">My Books</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filterBooks(myBooks).map(book => <BookCard key={book.id} book={book} />)}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center mb-6">
          <Clock className="h-6 w-6 text-teal-600" />
          <h2 className="text-2xl font-semibold text-gray-900 ml-2">Read Later</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filterBooks(readLaterBooks).map(book => <BookCard key={book.id} book={book} />)}
        </div>
      </section>
    </div>
  );
}

export default MyLibrary;