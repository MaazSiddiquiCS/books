import React, { useState, useEffect } from 'react';

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

const Admin: React.FC = () => {
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
    book_id: '',
    published_date: '',
    language: '',
    id: '',
    title: '',
    author_id: '',
    genre_id: '',
    publisher_id: '',
    link: '',
    link_id: '',
    type_id: '',
  });

  // Data state
  const [numUsers, setNumUsers] = useState<number>(0);
  const [downloads, setDownloads] = useState<DownloadData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to generate admin ID
  function generateSecureId(prefix: string = 'admin-'): string {
    const array = new Uint32Array(5);
    window.crypto.getRandomValues(array);
    return prefix + array.join('').slice(0, 16);
  }

  // Auto-generate ID when component mounts
  useEffect(() => {
    setRegisterForm(prev => ({
      ...prev,
      id: generateSecureId()
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
  const handleBookFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Register admin
// In your Admin component, update the handleRegister function:
const handleRegister = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://ebms.up.railway.app/admin/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' // Explicitly request JSON
        },
        body: JSON.stringify(registerForm),
      });
  
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
      }
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || `Registration failed with status ${response.status}`);
      }
  
      alert(`Registered successfully with ID: ${data.id}`);
      setLoginId(registerForm.id);
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
          id: loginId.trim()  // Make sure this matches what your backend expects
        }),
      });
  
      // First check if the response is JSON
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
  
      // Make sure this matches your actual backend response structure
      if (data.admin) {
        setIsLoggedIn(true);
        setAdminId(data.admin.id);
        setAdminName(data.admin.name || 'Admin'); // Fallback name if not provided
        console.log('Admin logged in:', data.admin);
      } else if (data.id) { // Alternative check if backend returns differently
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
        book_id: '',
        published_date: '',
        language: '',
        id: '',
        title: '',
        author_id: '',
        genre_id: '',
        publisher_id: '',
        link: '',
        link_id: '',
        type_id: '',
      });
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

        {!isLoggedIn ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Register Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Register Admin</h2>
              
              <div className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    placeholder="Your name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input
                    type="text"
                    name="role"
                    value={registerForm.role}
                    onChange={handleRegisterChange}
                    placeholder="Admin role"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
          <div className="space-y-8">
            {/* Admin Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Welcome, <span className="text-blue-600">{adminName}</span>
                </h2>
                <p className="text-gray-600">Admin ID: {adminId}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
              >
                Logout
              </button>
            </div>

            {/* Add Book Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Add New Book</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {Object.keys(bookForm).map((key) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {key.replace('_', ' ').toUpperCase()}
                    </label>
                    <input
                      name={key}
                      value={bookForm[key as keyof BookForm]}
                      onChange={handleBookFormChange}
                      placeholder={key.replace('_', ' ')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
              
              <button
                onClick={handleAddBook}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
              >
                Add Book
              </button>
            </div>

            {/* Admin Actions */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Admin Actions</h3>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <button
                  onClick={fetchNumUsers}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
                >
                  Show Number of Users
                </button>
                
                <button
                  onClick={fetchDownloads}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
                >
                  Show Books Downloaded
                </button>
              </div>

              {/* Users Count Display */}
              {numUsers > 0 && (
                <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-800 mb-2">
                    Total Registered Users: <span className="text-blue-600">{numUsers}</span>
                  </h4>
                </div>
              )}

              {/* Downloads Display */}
              {downloads.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Download Statistics</h4>
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
