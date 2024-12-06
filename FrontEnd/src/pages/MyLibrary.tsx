import React, { useState, useEffect } from "react";
import { BookOpen, BookmarkPlus, Clock, Check, Search, Trash2 } from "lucide-react";
import { fetchBookmarks, addBookmark, deleteBookmark } from "./api"; // Import your API functions

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  progress: number;
  addedDate: string;
}

const MyLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [bookmarks, setBookmarks] = useState<Book[]>([]);

  // Retrieve user ID from session storage
  const getUserId = () => sessionStorage.getItem("userID");

  useEffect(() => {
    const fetchData = async () => {
      const userId = getUserId();
      if (!userId) {
        alert("User is not authenticated.");
        return;
      }
      try {
        const bookmarksData = await fetchBookmarks(userId);
        setBookmarks(bookmarksData);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      }
    };

    fetchData();
  }, []);

  const filterBooks = (books: Book[]) =>
    books.filter((book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleAddBookmark = async (book: Book) => {
    const userId = getUserId();
    if (!userId) {
      alert("User is not authenticated.");
      return;
    }
    const bookmarkData = {
      user_id: userId,
      book_id: book.id,
      added_at: new Date().toISOString(),
    };

    try {
      await addBookmark(bookmarkData);
      setBookmarks((prev) => [...prev, book]);
    } catch (error) {
      console.error("Error adding bookmark:", error);
    }
  };

  const handleDeleteBookmark = async (bookId: number) => {
    const userId = getUserId();
    if (!userId) {
      alert("User is not authenticated.");
      return;
    }
    try {
      await deleteBookmark(userId, bookId);
      setBookmarks((prev) => prev.filter((book) => book.id !== bookId));
    } catch (error) {
      console.error("Error deleting bookmark:", error);
    }
  };

  const BookCard: React.FC<{ book: Book; onRemove?: (bookId: number) => void }> = ({ book, onRemove }) => (
    <div className="relative group bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 ease-in-out transform hover:scale-105">
      <img src={book.cover} alt={book.title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">{book.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{book.author}</p>
        {book.progress > 0 && (
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
              <div
                style={{ width: `${book.progress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
              ></div>
            </div>
            <span className="text-xs text-gray-600">{book.progress}% completed</span>
          </div>
        )}
      </div>
      {onRemove && (
        <button
          onClick={() => onRemove(book.id)}
          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
          title="Remove from Bookmarks"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  const filteredBookmarks = filterBooks(bookmarks);

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
          <Clock className="h-6 w-6 text-teal-600" />
          <h2 className="text-2xl font-semibold text-gray-900 ml-2">Bookmarks</h2>
        </div>
        {filteredBookmarks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBookmarks.map((book) => (
              <BookCard key={book.id} book={book} onRemove={handleDeleteBookmark} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">Your bookmarks list is empty.</p>
            <p className="text-sm text-gray-500 mt-2">Start adding books you want to bookmark!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default MyLibrary;
