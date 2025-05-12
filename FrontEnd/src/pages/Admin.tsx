import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, BookOpen, Users, Download, LogOut } from 'lucide-react';

interface AdminData {
  id: string;
  name: string;
  role: string;
  logged_in: string;
}

interface Book {
  book_id: string;
  title: string;
  published_date: string;
  language: string;
}

interface User {
  user_id: string;
  email: string;
  name: string;
  logged_in: string;
}

interface DownloadData {
  book_id: string;
  numdownloads: number;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminId, setAdminId] = useState<string>('');
  const [adminName, setAdminName] = useState<string>('');

  // Forms state
  const [registerForm, setRegisterForm] = useState<AdminData>({
    id: generateSecureId(),
    name: '',
    role: 'admin',
    logged_in: new Date().toISOString().split('T')[0]
  });

  const [loginId, setLoginId] = useState('');
  const [bookForm, setBookForm] = useState({
    book_id: generateBookId(),
    published_date: new Date().toISOString().split('T')[0],
    language: 'English',
    title: '',
    author_id: '1',
    genre_id: '1',
    publisher_id: '1',
    link: 'https://example.com/book.pdf',
    type_id: '1'
  });

  // Data state
  const [numUsers, setNumUsers] = useState<number>(0);
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [downloads, setDownloads] = useState<DownloadData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Helper function to generate admin ID
  function generateSecureId(prefix: string = 'admin-'): string {
    const array = new Uint32Array(5);
    window.crypto.getRandomValues(array);
    return prefix + array.join('').slice(0, 8);
  }

  // Helper function to generate book ID
  function generateBookId(prefix: string = 'book-'): string {
    const array = new Uint32Array(3);
    window.crypto.getRandomValues(array);
    return prefix + array.join('').slice(0, 6);
  }

  // Auto-generate IDs when component mounts
  useEffect(() => {
    setRegisterForm(prev => ({
      ...prev,
      id: generateSecureId()
    }));
    setBookForm(prev => ({
      ...prev,
      book_id: generateBookId()
    }));
  }, []);

  // Handle register form changes
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle book form changes
  const handleBookFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Register admin
  const handleRegister = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://ebms.up.railway.app/admin/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(registerForm),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Registration failed with status ${response.status}`);
      }

      setSuccess(`Registered successfully with ID: ${data.id}`);
      setLoginId(registerForm.id);
      setRegisterForm({
        id: generateSecureId(),
        name: '',
        role: 'admin',
        logged_in: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Registration failed:', error);
      let errorMessage = 'Registration failed. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          errorMessage = 'Registration endpoint not found. Contact support.';
        } else if (error.message.includes('already exists')) {
          errorMessage = 'Admin ID already exists. Generating new one...';
          setRegisterForm(prev => ({ ...prev, id: generateSecureId() }));
        } else {
          errorMessage = error.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Admin login
  const handleLogin = async () => {
    if (!loginId.trim()) {
      setError('Please enter an admin ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://ebms.up.railway.app/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: loginId.trim()
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Login failed with status ${response.status}`);
      }

      if (data.admin) {
        setIsLoggedIn(true);
        setAdminId(data.admin.id);
        setAdminName(data.admin.name || 'Admin');
        setSuccess('Login successful!');
        fetchAllBooks();
        fetchAllUsers();
      } else if (data.id) {
        setIsLoggedIn(true);
        setAdminId(data.id);
        setAdminName(data.name || 'Admin');
        setSuccess('Login successful!');
        fetchAllBooks();
        fetchAllUsers();
      } else {
        throw new Error('Invalid admin data received');
      }
    } catch (err) {
      console.error('Login failed:', err);
      let errorMessage = 'Login failed. Please check your admin ID.';
      if (err instanceof Error) {
        if (err.message.includes('404')) {
          errorMessage = 'Admin not found';
        } else if (err.message.includes('401')) {
          errorMessage = 'Invalid credentials';
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Add book
  const handleAddBook = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://ebms.up.railway.app/books/addBooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookForm,
          id: bookForm.book_id, // Using book_id as id for simplicity
          link_id: bookForm.book_id // Using book_id as link_id
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add book with status ${response.status}`);
      }

      setSuccess('Book added successfully!');
      setBookForm({
        book_id: generateBookId(),
        published_date: new Date().toISOString().split('T')[0],
        language: 'English',
        title: '',
        author_id: '1',
        genre_id: '1',
        publisher_id: '1',
        link: 'https://example.com/book.pdf',
        type_id: '1'
      });
      fetchAllBooks();
    } catch (error) {
      console.error('Error adding book:', error);
      setError('Failed to add book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all books
  const fetchAllBooks = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://ebms.up.railway.app/books');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch books with status ${response.status}`);
      }

      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
      setError('Failed to fetch books.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users
  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://ebms.up.railway.app/user/all');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users with status ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
      setNumUsers(data.length);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  // Delete a book
  const handleDeleteBook = async (bookId: string) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://ebms.up.railway.app/books/${bookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete book with status ${response.status}`);
      }

      setSuccess('Book deleted successfully!');
      fetchAllBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      setError('Failed to delete book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch downloads data
  const fetchDownloads = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://ebms.up.railway.app/download/numdownloads');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch downloads with status ${response.status}`);
      }

      const data = await response.json();
      setDownloads(data);
    } catch (error) {
      console.error('Error fetching downloads:', error);
      setError('Failed to fetch downloads data.');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const handleLogout = () => {
    setIsLoggedIn(false);
    setAdminId('');
    setAdminName('');
    setError(null);
    setSuccess('Logged out successfully!');
    setActiveTab('dashboard');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-800">EBMS Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  <span className="text-gray-600">Welcome, {adminName}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-gray-600 hover:text-red-600"
                  >
                    <LogOut className="h-5 w-5 mr-1" />
                    Logout
                  </button>
                </>
              ) : (
                <span className="text-gray-600">Admin Portal</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
            <p>{success}</p>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-center">Processing...</p>
            </div>
          </div>
        )}

        {!isLoggedIn ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Register Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Register Admin</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID</label>
                  <div className="flex">
                    <input
                      type="text"
                      name="id"
                      value={registerForm.id}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-l-md bg-gray-100"
                    />
                    <button
                      onClick={() => setRegisterForm(prev => ({ ...prev, id: generateSecureId() }))}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    placeholder="Your name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input
                    type="text"
                    name="role"
                    value={registerForm.role}
                    onChange={handleRegisterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                  <input
                    type="date"
                    name="logged_in"
                    value={registerForm.logged_in}
                    onChange={handleRegisterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
                >
                  Register
                </button>
              </div>
            </div>

            {/* Login Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Login Admin</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID</label>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="Enter your admin ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-white p-4 rounded-lg shadow-md h-fit">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Admin Dashboard</h3>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setActiveTab('books');
                    fetchAllBooks();
                  }}
                  className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'books' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Manage Books
                </button>
                <button
                  onClick={() => {
                    setActiveTab('users');
                    fetchAllUsers();
                  }}
                  className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'users' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Manage Users
                </button>
                <button
                  onClick={() => {
                    setActiveTab('stats');
                    fetchDownloads();
                  }}
                  className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'stats' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Statistics
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Welcome back, <span className="text-blue-600">{adminName}</span>
                    </h2>
                    <p className="text-gray-600">Admin ID: {adminId}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">Total Books</h3>
                      </div>
                      <p className="text-3xl font-bold text-blue-600 mt-2">{books.length}</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Users className="h-6 w-6 text-green-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">Total Users</h3>
                      </div>
                      <p className="text-3xl font-bold text-green-600 mt-2">{numUsers}</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Download className="h-6 w-6 text-purple-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">Total Downloads</h3>
                      </div>
                      <p className="text-3xl font-bold text-purple-600 mt-2">
                        {downloads.reduce((sum, item) => sum + item.numdownloads, 0)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                      <div className="flex flex-wrap gap-4">
                        <button
                          onClick={() => setActiveTab('books')}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center"
                        >
                          <BookOpen className="h-5 w-5 mr-2" />
                          Add New Book
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('users');
                            fetchAllUsers();
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center"
                        >
                          <Users className="h-5 w-5 mr-2" />
                          View Users
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('stats');
                            fetchDownloads();
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center"
                        >
                          <Download className="h-5 w-5 mr-2" />
                          View Stats
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Books Tab */}
              {activeTab === 'books' && (
                <div className="space-y-6">
                  {/* Add Book Section */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Add New Book</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Book ID</label>
                        <div className="flex">
                          <input
                            name="book_id"
                            value={bookForm.book_id}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-l-md bg-gray-100"
                          />
                          <button
                            onClick={() => setBookForm(prev => ({ ...prev, book_id: generateBookId() }))}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300"
                          >
                            Refresh
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          name="title"
                          value={bookForm.title}
                          onChange={handleBookFormChange}
                          placeholder="Book title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Published Date</label>
                        <input
                          type="date"
                          name="published_date"
                          value={bookForm.published_date}
                          onChange={handleBookFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                        <select
                          name="language"
                          value={bookForm.language}
                          onChange={handleBookFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                          <option value="German">German</option>
                          <option value="Chinese">Chinese</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Author ID</label>
                        <input
                          name="author_id"
                          value={bookForm.author_id}
                          onChange={handleBookFormChange}
                          placeholder="Author ID"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Genre ID</label>
                        <input
                          name="genre_id"
                          value={bookForm.genre_id}
                          onChange={handleBookFormChange}
                          placeholder="Genre ID"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Publisher ID</label>
                        <input
                          name="publisher_id"
                          value={bookForm.publisher_id}
                          onChange={handleBookFormChange}
                          placeholder="Publisher ID"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                        <input
                          name="link"
                          value={bookForm.link}
                          onChange={handleBookFormChange}
                          placeholder="Book link"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type ID</label>
                        <input
                          name="type_id"
                          value={bookForm.type_id}
                          onChange={handleBookFormChange}
                          placeholder="Type ID"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={handleAddBook}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
                    >
                      Add Book
                    </button>
                  </div>

                  {/* Book List Section */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800">Book List</h3>
                      <button
                        onClick={fetchAllBooks}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
                      >
                        Refresh
                      </button>
                    </div>
                    
                    {books.length === 0 ? (
                      <p className="text-gray-500">No books found.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Book ID
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Published Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Language
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {books.map((book) => (
                              <tr key={book.book_id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {book.book_id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {book.title}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(book.published_date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {book.language}
                                </td>
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
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">User Management</h3>
                    <div className="flex items-center">
                      <span className="mr-4 text-gray-600">Total Users: {numUsers}</span>
                      <button
                        onClick={fetchAllUsers}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>
                  
                  {users.length === 0 ? (
                    <p className="text-gray-500">No users found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Registration Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr key={user.user_id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {user.user_id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.name || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(user.logged_in)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Stats Tab */}
              {activeTab === 'stats' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Download Statistics</h3>
                    <button
                      onClick={fetchDownloads}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
                    >
                      Refresh
                    </button>
                  </div>
                  
                  {downloads.length === 0 ? (
                    <p className="text-gray-500">No download data available.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Book ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Downloads
                            </th>
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
        )}
      </div>
    </div>
  );
};

export default Admin;
