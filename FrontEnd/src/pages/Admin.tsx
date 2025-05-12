import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, User, Bell, Menu, LogOut, Users, BookOpen, BarChart2 } from 'lucide-react';

interface AdminData {
  id: string;
  name: string;
  role: string;
  logged_in: string;
}

interface BookForm {
  book_id: string;
  published_date: string;
  language: string;
  id: string;
  title: string;
  author_id: string;
  genre_id: string;
  publisher_id: string;
  link: string;
  link_id: string;
  type_id: string;
}

interface DownloadData {
  book_id: string;
  numdownloads: number;
}

interface LookupData {
  authors: Array<{ id: string; name: string }>;
  genres: Array<{ id: string; name: string }>;
  publishers: Array<{ id: string; name: string }>;
  types: Array<{ id: string; name: string }>;
}

interface BookItem {
  book_id: string;
  title: string;
  published_date: string;
  language: string;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  registered_date: string;
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
  const [bookForm, setBookForm] = useState<BookForm>({
    book_id: generateSecureId('book-'),
    published_date: new Date().toISOString().split('T')[0],
    language: 'English',
    id: generateSecureId('item-'),
    title: '',
    author_id: '',
    genre_id: '',
    publisher_id: '',
    link: '',
    link_id: generateSecureId('link-'),
    type_id: '',
  });

  // Data state
  const [numUsers, setNumUsers] = useState<number>(0);
  const [downloads, setDownloads] = useState<DownloadData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookupData, setLookupData] = useState<LookupData>({
    authors: [],
    genres: [],
    publishers: [],
    types: []
  });
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState<BookItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [newAdminId, setNewAdminId] = useState('');

  // Helper function to generate secure IDs
  function generateSecureId(prefix: string = 'admin-'): string {
    const array = new Uint32Array(5);
    window.crypto.getRandomValues(array);
    return prefix + array.join('').slice(0, 16);
  }

  // Auto-generate IDs when component mounts
  useEffect(() => {
    setRegisterForm(prev => ({
      ...prev,
      id: generateSecureId()
    }));
    fetchLookupData();
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    if (isLoggedIn) {
      if (activeTab === 'books') {
        fetchBooks();
      } else if (activeTab === 'users') {
        fetchUsers();
      } else if (activeTab === 'stats') {
        fetchNumUsers();
        fetchDownloads();
      }
    }
  }, [activeTab, isLoggedIn]);

  // Fetch lookup data for dropdowns
  const fetchLookupData = async () => {
    setLoading(true);
    try {
      // In a real app, you'd fetch these from your API
      // These are mock data for demonstration
      const mockData: LookupData = {
        authors: [
          { id: 'auth-001', name: 'J.K. Rowling' },
          { id: 'auth-002', name: 'George R.R. Martin' },
          { id: 'auth-003', name: 'Stephen King' }
        ],
        genres: [
          { id: 'gen-001', name: 'Fantasy' },
          { id: 'gen-002', name: 'Science Fiction' },
          { id: 'gen-003', name: 'Horror' }
        ],
        publishers: [
          { id: 'pub-001', name: 'Penguin Random House' },
          { id: 'pub-002', name: 'HarperCollins' },
          { id: 'pub-003', name: 'Simon & Schuster' }
        ],
        types: [
          { id: 'type-001', name: 'PDF' },
          { id: 'type-002', name: 'EPUB' },
          { id: 'type-003', name: 'Audiobook' }
        ]
      };
      setLookupData(mockData);
    } catch (err) {
      console.error('Error fetching lookup data:', err);
      setError('Failed to load reference data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all books
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://ebms.up.railway.app/books');
      if (!response.ok) {
        throw new Error(`Failed to fetch books with status ${response.status}`);
      }
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://ebms.up.railway.app/user/all');
      if (!response.ok) {
        throw new Error(`Failed to fetch users with status ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
      setNumUsers(data.length);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Delete a book
  const handleDeleteBook = async (bookId: string) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://ebms.up.railway.app/books/${bookId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete book with status ${response.status}`);
      }

      alert('Book deleted successfully');
      fetchBooks(); // Refresh the book list
    } catch (err) {
      console.error('Error deleting book:', err);
      setError('Failed to delete book');
    } finally {
      setLoading(false);
    }
  };

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

  // Auto-generate a new book ID
  const generateNewBookId = () => {
    setBookForm(prev => ({
      ...prev,
      book_id: generateSecureId('book-')
    }));
  };

  // Register admin
  const handleRegister = async () => {
    if (!registerForm.name) {
      setError('Please enter your name');
      return;
    }

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

      setNewAdminId(registerForm.id);
      setShowRegistrationSuccess(true);
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
        console.log('Admin logged in:', data.admin);
      } else if (data.id) {
        setIsLoggedIn(true);
        setAdminId(data.id);
        setAdminName(data.name || 'Admin');
        console.log('Admin logged in:', data);
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
    if (!bookForm.title) {
      setError('Book title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://ebms.up.railway.app/books/addBooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookForm),
      });

      if (!response.ok) {
        throw new Error(`Failed to add book with status ${response.status}`);
      }

      alert('Book added successfully');
      console.log('Book added:', bookForm);
      // Reset form after successful submission
      setBookForm({
        book_id: generateSecureId('book-'),
        published_date: new Date().toISOString().split('T')[0],
        language: 'English',
        id: generateSecureId('item-'),
        title: '',
        author_id: '',
        genre_id: '',
        publisher_id: '',
        link: '',
        link_id: generateSecureId('link-'),
        type_id: '',
      });
      fetchBooks(); // Refresh the book list
    } catch (error) {
      console.error('Error adding book:', error);
      setError('Failed to add book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch number of users
  const fetchNumUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://ebms.up.railway.app/user/all');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users with status ${response.status}`);
      }

      const data = await response.json();
      setNumUsers(data.length);
      console.log('Total users:', data.length);
    } catch (error) {
      console.error('Error fetching user count:', error);
      setError('Failed to fetch user count.');
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
      console.log('Downloads data:', data);
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
    console.log('Admin logged out');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navbar */}
      {isLoggedIn && (
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-800">EBMS Admin Panel</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('books')}
                className={`flex items-center space-x-1 ${activeTab === 'books' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <Book className="h-5 w-5" />
                <span>Books</span>
              </button>
              
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center space-x-1 ${activeTab === 'users' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <Users className="h-5 w-5" />
                <span>Users</span>
              </button>
              
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex items-center space-x-1 ${activeTab === 'stats' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <BarChart2 className="h-5 w-5" />
                <span>Stats</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {adminName}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-red-600 hover:text-red-800"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error and Loading Indicators */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-center">Processing...</p>
            </div>
          </div>
        )}

        {/* Registration Success Modal */}
        {showRegistrationSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Registration Successful</h3>
              <p className="mb-4">Your admin ID is: <span className="font-mono bg-gray-100 p-1 rounded">{newAdminId}</span></p>
              <p className="mb-4">Please save this ID as you'll need it to log in.</p>
              <button
                onClick={() => {
                  setShowRegistrationSuccess(false);
                  setLoginId(newAdminId);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
              >
                Continue to Login
              </button>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID (auto-generated)</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      name="id"
                      value={registerForm.id}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm bg-gray-100"
                    />
                    <button
                      onClick={() => setRegisterForm(prev => ({ ...prev, id: generateSecureId() }))}
                      className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-r-md border border-l-0 border-gray-300"
                      title="Generate new ID"
                    >
                      🔄
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    placeholder="Your full name"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
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
                  />
                </div>
                
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </div>

            {/* Login Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Login Admin</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID *</label>
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
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Tab Content */}
            {activeTab === 'books' && (
              <div className="space-y-8">
                {/* Add Book Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Add New Book</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Book ID</label>
                        <div className="flex items-center">
                          <input
                            name="book_id"
                            value={bookForm.book_id}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm bg-gray-100"
                          />
                          <button
                            onClick={generateNewBookId}
                            className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-r-md border border-l-0 border-gray-300"
                            title="Generate new ID"
                          >
                            🔄
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
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
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                        <input
                          name="language"
                          value={bookForm.language}
                          onChange={handleBookFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                        <select
                          name="author_id"
                          value={bookForm.author_id}
                          onChange={handleBookFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select an author</option>
                          {lookupData.authors.map(author => (
                            <option key={author.id} value={author.id}>{author.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                        <select
                          name="genre_id"
                          value={bookForm.genre_id}
                          onChange={handleBookFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a genre</option>
                          {lookupData.genres.map(genre => (
                            <option key={genre.id} value={genre.id}>{genre.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                        <select
                          name="publisher_id"
                          value={bookForm.publisher_id}
                          onChange={handleBookFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a publisher</option>
                          {lookupData.publishers.map(publisher => (
                            <option key={publisher.id} value={publisher.id}>{publisher.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                        <input
                          name="link"
                          value={bookForm.link}
                          onChange={handleBookFormChange}
                          placeholder="Book URL"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleAddBook}
                      disabled={loading || !bookForm.title}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50"
                    >
                      {loading ? 'Adding Book...' : 'Add Book'}
                    </button>
                  </div>
                </div>

                {/* Book List Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Book Management</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {books.length > 0 ? (
                          books.map((book) => (
                            <tr key={book.book_id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {book.book_id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {book.title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {book.published_date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {book.language}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleDeleteBook(book.book_id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                              No books found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-6">User Management</h3>
                
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-800 mb-2">
                    Total Registered Users: <span className="text-blue-600">{numUsers}</span>
                  </h4>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.length > 0 ? (
                        users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {user.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.registered_date}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Statistics Dashboard</h3>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-blue-800 mb-2">User Statistics</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Registered Users:</span>
                      <span className="text-2xl font-bold text-blue-600">{numUsers}</span>
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-green-800 mb-2">Download Statistics</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Downloads Tracked:</span>
                      <span className="text-2xl font-bold text-green-600">{downloads.length}</span>
                    </div>
                  </div>
                </div>

                {downloads.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Download Details</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
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
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
