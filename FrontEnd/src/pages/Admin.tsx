import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, BookOpen, PlusCircle } from 'lucide-react';

interface Book {
  book_id: string;
  title: string;
  published_date: string;
  language: string;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  // Check admin authentication on mount
  useEffect(() => {
    const adminId = sessionStorage.getItem('adminId');
    if (!adminId) {
      navigate('/');
    } else {
      fetchAllBooks();
    }
  }, [navigate]);

  const fetchAllBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://ebms.up.railway.app/books');
      if (!response.ok) throw new Error('Failed to fetch books');
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async () => {
    if (!newBook.book_id || !newBook.title) {
      setError('Book ID and Title are required');
      return;
    }

    setLoading(true);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://ebms.up.railway.app/books/${bookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete book');
      
      fetchAllBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={() => {
              sessionStorage.removeItem('adminId');
              navigate('/');
            }}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        {/* Book Management Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BookOpen className="mr-2" /> Book Management
          </h2>
          
          {/* Add Book Form */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <PlusCircle className="mr-1" /> Add New Book
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Book ID</label>
                <input
                  type="text"
                  value={newBook.book_id}
                  onChange={(e) => setNewBook({...newBook, book_id: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="Enter book ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="Enter book title"
                />
              </div>
              {/* Add other fields similarly */}
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
          <div>
            <h3 className="text-lg font-medium mb-3">Book List</h3>
            {loading ? (
              <div>Loading books...</div>
            ) : books.length === 0 ? (
              <div className="text-gray-500">No books found</div>
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
    </div>
  );
};

export default Admin;
