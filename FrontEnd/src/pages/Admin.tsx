import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, BookOpen, PlusCircle, Users, Download, LogOut, X, Lock, User } from 'lucide-react';

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
  const [showUsers, setShowUsers] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
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

  const [loginForm, setLoginForm] = useState({
    id: '',
    password: ''
  });
  const [isRegister, setIsRegister] = useState(false);

  const adminId = sessionStorage.getItem('adminId');
  const adminName = sessionStorage.getItem('adminName');

  useEffect(() => {
    // Only show login modal if not logged in and on /admin route
    if (!adminId && window.location.pathname === '/admin') {
      setShowLoginModal(true);
    } else if (!adminId) {
      navigate('/');
    } else {
      fetchAllBooks();
    }
  }, [adminId, navigate]);

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister 
      ? 'https://ebms.up.railway.app/admin/register'
      : 'https://ebms.up.railway.app/admin/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: loginForm.id,
          ...(isRegister && { 
            name: `Admin-${loginForm.id}`,
            role: 'admin',
            const logged_in = new Date().toISOString().slice(0, 19).replace('T', ' ');
          }),
          ...(!isRegister && { password: loginForm.password })
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isRegister) {
        alert(`Admin registered successfully! ID: ${data.id || data.admin?.id}`);
        setIsRegister(false);
      } else {
        const adminId = data.id || data.admin?.id;
        const adminName = data.name || data.admin?.name || `Admin-${adminId}`;
        
        sessionStorage.setItem('adminId', adminId);
        sessionStorage.setItem('adminName', adminName);
        setShowLoginModal(false);
        navigate('/admin');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

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
      setShowUsers(true);
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
      setShowDownloads(true);
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

  // Admin Login Modal
  const AdminLoginModal = () => {
    if (!showLoginModal) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-md shadow-lg w-96 p-6 relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {isRegister ? 'Register Admin' : 'Admin Login'}
            </h3>
            <button 
              onClick={() => setShowLoginModal(false)} 
              className="text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="id"
                value={loginForm.id}
                onChange={handleLoginInputChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                placeholder="Admin ID"
                required
                disabled={loading}
              />
            </div>

            {!isRegister && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginInputChange}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                  placeholder="Password"
                  required
                  disabled={loading}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? 'Processing...' : isRegister ? 'Register' : 'Login'}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-blue-600 hover:underline"
                disabled={loading}
              >
                {isRegister ? 'Already have an account? Login' : 'Need an admin account? Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (!adminId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to EBMS Admin Portal</h1>
          <p className="text-gray-600 mb-8">Please login to access the admin dashboard</p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition mb-4"
          >
            Admin Login
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition"
          >
            Go to Home Page
          </button>
        </div>
        <AdminLoginModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <AdminLoginModal />
      <div className="max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-md">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">EBMS Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome, <span className="font-semibold text-blue-600">{adminName}</span>
              <span className="ml-4 text-sm">ID: {adminId}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
          >
            <LogOut className="h-5 w-5" /> Logout
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
                <input
                  type="text"
                  value={newBook.language}
                  onChange={(e) => setNewBook({...newBook, language: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="Enter language"
                />
              </div>
            </div>
            <button
              onClick={handleAddBook}
              disabled={loading}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              {loading ? 'Adding...' : 'Add Book'}
            </button>
          </div>

          {/* Book List */}
          <div>
            <h3 className="text-lg font-medium mb-3">Book List</h3>
            {loading ? (
              <div className="text-center py-4">Loading books...</div>
            ) : books.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No books found</div>
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
                            disabled={loading}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                            disabled={loading}
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

        {/* Admin Actions Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Admin Actions</h2>
          
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={fetchNumUsers}
              disabled={loading}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
            >
              <Users className="h-5 w-5" /> {showUsers ? 'Refresh Users' : 'Show Users'}
            </button>
            
            <button
              onClick={fetchDownloads}
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition"
            >
              <Download className="h-5 w-5" /> {showDownloads ? 'Refresh Downloads' : 'Show Downloads'}
            </button>
          </div>

          {/* Users Count Display */}
          {showUsers && (
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                <Users className="mr-2" /> User Statistics
              </h3>
              <p className="text-blue-600 font-medium">
                Total Registered Users: <span className="text-blue-800">{numUsers}</span>
              </p>
            </div>
          )}

          {/* Downloads Display */}
          {showDownloads && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Download className="mr-2" /> Download Statistics
              </h3>
              {downloads.length === 0 ? (
                <div className="text-gray-500 text-center py-4">No download data available</div>
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.book_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{d.numdownloads}</td>
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
    </div>
  );
};

export default Admin;
