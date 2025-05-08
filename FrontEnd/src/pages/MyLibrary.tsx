import React, { useState, useEffect } from "react";
import { BookOpen, Search, Trash2, Bookmark, ChevronDown, ChevronUp } from "lucide-react";
import { fetchBookmarks, deleteBookmark, fetchBookDetails } from "./api";
import { useParams } from 'react-router-dom';

const BASE_URL = 'https://ebms.up.railway.app';

interface BookmarkData {
  book_id: number;
  read_last_page: number;
  total_pages: number;
  bookmark_date: string;
}

interface BookDetails {
  book_id: number;
  title: string;
  authors: string;
  cover: string;
  description?: string;
}

interface BookWithProgress extends BookDetails,BookmarkData {
  progress: number;
  lastRead: string;
  formattedDate: string;

}

const MyLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [bookmarks, setBookmarks] = useState<BookWithProgress[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedBookId, setExpandedBookId] = useState<number | null>(null);
  const { id } = useParams<{ id: string }>();

  const getUserId = () => sessionStorage.getItem("userID");

  useEffect(() => {
    const userEmail = sessionStorage.getItem('userEmail');
    setIsLoggedIn(!!userEmail);
    console.log('User login status:', !!userEmail);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const userId = getUserId();
      if (!userId) {
        console.log('No user ID found');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching bookmarks for user:', userId);
        // First fetch all bookmarks and their details
        const enrichedBooks = await fetchBookmarks(userId);
        console.log('Enriched books data:', enrichedBooks);

        if (!Array.isArray(enrichedBooks)) {
          console.error('Invalid bookmarks data format:', enrichedBooks);
          throw new Error("Invalid bookmarks data format");
        }

        // Then fetch progress data for each book
        const booksWithProgress = await Promise.all(
          enrichedBooks.map(async (book) => {
            try {
              console.log('Fetching progress for book:', book.book_id);
              const progressResponse = await fetch(
                `${BASE_URL}/bookmarks/progress?user_id=${userId}&book_id=${book.book_id}`
              );
              const progressData: BookmarkData = await progressResponse.json();
              console.log('Progress data:', progressData);

              return {
                ...book,
                total_pages:progressData.total_pages,
                read_last_page:progressData.read_last_page,
                progress: progressData ? Math.round((progressData.read_last_page / progressData.total_pages) * 100) : 0,
                lastRead: progressData?.bookmark_date || new Date().toISOString(),
                formattedDate: progressData ? formatBookmarkDate(progressData.bookmark_date) : 'Just now'
              };
            } catch (error) {
              console.error(`Error fetching progress for book ${book.book_id}:`, error);
              return {
                ...book,
                progress: 0,
                lastRead: new Date().toISOString(),
                formattedDate: 'Just now'
              };
            }
          })
        );

        console.log('Books with progress:', booksWithProgress);
        setBookmarks(booksWithProgress);
      } catch (error) {
        console.error("Error in fetchData:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const formatBookmarkDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      if (diffInDays === 0) return "Today";
      if (diffInDays === 1) return "Yesterday";
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const filterBooks = (books: BookWithProgress[]) =>
    books.filter((book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.authors.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteBookmark = async (bookId: number) => {
      const userId = getUserId();
      if (!userId) {
        alert("User is not authenticated.");
        return;
      }
      try {
        console.log('Deleting bookmark for book:', bookId);
        await fetch(`${BASE_URL}/bookmarks/delete?user_id=${userId}&book_id=${bookId}`, {
          method: 'DELETE',
        });
        setBookmarks((prev) => prev.filter((book) => book.book_id !== bookId));
        console.log('Bookmark deleted successfully');
      } catch (error) {
        console.error("Error deleting bookmark:", error);
      }
    };

  const toggleExpand = (bookId: number) => {
    setExpandedBookId(expandedBookId === bookId ? null : bookId);
  };

  const BookCard: React.FC<{ book: BookWithProgress }> = ({ book }) => (
    <div className="relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="flex flex-col h-full">
        <div className="flex p-4">
          <div className="flex-shrink-0 w-24 h-32 overflow-hidden rounded-lg shadow-sm">
            <img 
              src={book.cover} 
              alt={book.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log('Error loading cover image for book:', book.book_id);
                (e.target as HTMLImageElement).src = '/default-book-cover.jpg';
              }}
            />
          </div>
          
          <div className="ml-4 flex-1 flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900 line-clamp-2">{book.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{book.authors}</p>
              </div>
              <button
                onClick={() => handleDeleteBookmark(book.book_id)}
                className="text-red-500 hover:text-red-700 p-1"
                title="Remove from Bookmarks"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{book.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-teal-500 h-2 rounded-full" 
                  style={{ width: `${book.progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mt-auto pt-2 flex justify-between items-center">
              <span className="text-xs text-gray-500 flex items-center">
                <Bookmark className="h-3 w-3 mr-1" />
                {book.formattedDate}
              </span>
              <button 
                onClick={() => toggleExpand(book.book_id)}
                className="text-teal-600 hover:text-teal-800 text-sm flex items-center"
              >
                {expandedBookId === book.book_id ? (
                  <>
                    Less <ChevronUp className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  <>
                    More <ChevronDown className="ml-1 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {expandedBookId === book.book_id && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-2">{book.description || "No description available"}</p>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Last read: {new Date(book.lastRead).toLocaleDateString()}</span>
              <span>Page {book.read_last_page} of {book.total_pages}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const filteredBookmarks = filterBooks(bookmarks);
  console.log('Filtered bookmarks:', filteredBookmarks);

  if (!isLoggedIn) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Please log in to access your library.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">My Library</h1>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search your books..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <section className="mb-12">
        <div className="flex items-center mb-6">
          <div className="p-2 rounded-lg bg-teal-100 text-teal-800">
            <BookOpen className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 ml-3">Reading Progress</h2>
          <span className="ml-auto text-sm text-gray-500">
            {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'book' : 'books'}
          </span>
        </div>
        
        {filteredBookmarks.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredBookmarks.map((book) => (
              <BookCard key={book.book_id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <Bookmark className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Your library is empty</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Books you bookmark will appear here. Start exploring to find your next read!
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default MyLibrary;
