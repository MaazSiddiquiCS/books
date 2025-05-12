import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, BookOpen, PlusCircle, Users, Download, Bookmark } from 'lucide-react';

interface Book {
  book_id: string;
  title: string;
  published_date: string;
  language: string;
}

interface DownloadData {
  book_id: string;
  numdownloads: number;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [downloads, setDownloads] = useState<DownloadData[]>([]);
  const [numUsers, setNumUsers] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'books' | 'users' | 'downloads'>('books');
  const [adminName, setAdminName] = useState('Admin');

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
    const adminId = sessionStorage.getItem('adminId');
    const storedAdminName = sessionStorage.getItem('adminName');
    
    if (!adminId) {
      navigate('/');
    } else {
      if (storedAdminName) setAdminName(storedAdminName);
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

  const fetchNumUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://ebms.up.railway.app/user/all');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setNumUsers(data.length);
      setActiveTab('users');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchDownloads = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://ebms.up.railway.app/download/numdownloads');
      if (!response.ok) throw new Error('Failed to fetch downloads');
      const data = await response.json();
      setDownloads(data);
      setActiveTab('downloads');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch downloads');
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

  const handleLogout = () => {
    sessionStorage.removeItem('adminId');
    sessionStorage.removeItem('adminName');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">EBMS Admin Portal</h1>
            <p className="text-gray-600">Welcome back, {adminName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('books')}
            className={`py-2 px-4 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'books' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen className="h-4 w-4" /> Books
          </button>
          <button
            onClick={fetchNumUsers}
            className={`py-2 px-4 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="h-4 w-4" /> Users
          </button>
          <button
            onClick={fetchDownloads}
            className={`py-2 px-4 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'downloads' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Download className="h-4 w-4" /> Downloads
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'books' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Bookmark className="h-5 w-5" /> Book Management
            </h2>
            
            {/* Add Book Form */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <PlusCircle className="h-5 w-5" /> Add New Book
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
                <div>
                  <label className="block text-sm font-medium mb-1">Published Date</label>
                  <input
                    type="date"
                    value={newBook.published_date}
                    onChange={(e) => setNewBook({...newBook, published_date: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Language</label>
                  <select
                    value={newBook.language}
                    onChange={(e) => setNewBook({...newBook, language: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleAddBook}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded flex items-center gap-2"
              >
                {loading ? 'Adding...' : 'Add Book'}
              </button>
            </div>

            {/* Book List */}
            <div>
              <h3 className="text-lg font-medium mb-4">Book List</h3>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : books.length === 0 ? (
                <div className="text-gray-500 py-4 text-center">No books found</div>
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{book.book_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(book.published_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.language}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleDeleteBook(book.book_id)}
                                className="text-red-600 hover:text-red-900"
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
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Users className="h-5 w-5" /> User Management
            </h2>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Total Registered Users</h3>
              <p className="text-4xl font-bold text-blue-600">{numUsers}</p>
            </div>
          </div>
        )}

        {activeTab === 'downloads' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Download className="h-5 w-5" /> Download Statistics
            </h2>
            
            {downloads.length === 0 ? (
              <div className="text-gray-500 py-8 text-center">No download data available</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Downloads</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {downloads.map((d, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {d.book_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {d.numdownloads}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
