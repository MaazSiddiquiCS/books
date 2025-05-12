import React, { useState, useEffect } from 'react';
import { Trash2, Edit, BookOpen, Users, Download, PlusCircle } from 'lucide-react';

interface Book {
  book_id: string;
  title: string;
  published_date: string;
  language: string;
}

const Admin: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newBook, setNewBook] = useState({
    book_id: '',
    title: '',
    published_date: new Date().toISOString().split('T')[0],
    language: 'English',
    author_id: '1',
    genre_id: '1',
    publisher_id: '1',
    link: 'https://example.com/book.pdf',
    type_id: '1'
  });

  useEffect(() => {
    fetchAllBooks();
  }, []);

  const fetchAllBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://ebms.up.railway.app/books');
      if (!response.ok) throw new Error('Failed to fetch books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://ebms.up.railway.app/books/addBook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBook,
          id: newBook.book_id,
          link_id: newBook.book_id
        }),
      });

      if (!response.ok) throw new Error('Failed to add book');
      
      setNewBook({
        book_id: '',
        title: '',
        published_date: new Date().toISOString().split('T')[0],
        language: 'English',
        author_id: '1',
        genre_id: '1',
        publisher_id: '1',
        link: 'https://example.com/book.pdf',
        type_id: '1'
      });
      fetchAllBooks();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://ebms.up.railway.app/books/${bookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete book');
      
      fetchAllBooks();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Book Management</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        {/* Add Book Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <PlusCircle className="mr-2" /> Add New Book
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Book ID</label>
              <input
                type="text"
                value={newBook.book_id}
                onChange={(e) => setNewBook({...newBook, book_id: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Enter book ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newBook.title}
                onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Enter book title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Published Date</label>
              <input
                type="date"
                value={newBook.published_date}
                onChange={(e) => setNewBook({...newBook, published_date: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                value={newBook.language}
                onChange={(e) => setNewBook({...newBook, language: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleAddBook}
            disabled={loading}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            {loading ? 'Adding...' : 'Add Book'}
          </button>
        </div>

        {/* Book List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <BookOpen className="mr-2" /> Book List
            </h2>
            <button
              onClick={fetchAllBooks}
              className="bg-gray-200 py-2 px-4 rounded hover:bg-gray-300"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading books...</div>
          ) : books.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No books found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Published</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Language</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {books.map((book) => (
                    <tr key={book.book_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.book_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(book.published_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.language}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDeleteBook(book.book_id)}
                          className="text-red-600 hover:text-red-900 mr-3"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
