import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { getUserByEmail, getNotificationsByUserId, fetchBooksWithAuthors } from '../pages/api';
import { Shield } from 'lucide-react';
interface NavbarProps {
  openSidebar: () => void;
  openLoginModal: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ openSidebar, openLoginModal }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
const [adminModalOpen, setAdminModalOpen] = useState(false);

// Add this useEffect to check admin status
useEffect(() => {
  const adminId = sessionStorage.getItem('adminId');
  setIsAdmin(!!adminId);
}, []);
const handleAdminLogout = () => {
  sessionStorage.removeItem('adminId');
  sessionStorage.removeItem('adminName');
  setIsAdmin(false);
  window.location.reload();
};

  useEffect(() => {
    const userEmail = sessionStorage.getItem('userEmail');
    setIsLoggedIn(!!userEmail);
  }, []);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const books = await fetchBooksWithAuthors();
        setAllBooks(books);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      }
    };
    loadBooks();
  }, []);

  // Poll for notifications every 10 seconds
  useEffect(() => {
    const userId = sessionStorage.getItem('userID');
    if (!userId || !isLoggedIn) return;

    const fetchNotifications = async () => {
      try {
        const data = await getNotificationsByUserId(userId);
        // Compare notification IDs to detect new ones
        const currentIds = notifications.map((n) => n.notification_id);
        const hasNew = data.some((n: { notification_id: any; }) => !currentIds.includes(n.notification_id));
        setNotifications(data);
        if (hasNew) {
          setHasNewNotification(true);
        }
      } catch (error) {
      }
    };

    fetchNotifications(); // Initial fetch
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [isLoggedIn, notifications]);

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSuggestions([]);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setSuggestions([]);
    } else {
      const filtered = allBooks.filter((book) =>
        book.title?.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    }
  };

  const handleSuggestionClick = (bookId: number) => {
    navigate(`/BookDetail/${bookId}`);
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userID');
    setIsLoggedIn(false);
    setNotifications([]);
    setHasNewNotification(false);
    window.location.reload();
    alert('You have successfully logged out.');
  };

  const toggleNotifications = async () => {
    if (!isNotificationOpen) {
      const userId = sessionStorage.getItem('userID');
      if (!userId) return;
      try {
        const data = await getNotificationsByUserId(userId);
        setNotifications(data);
      } catch (error: unknown) {
        console.error('Error fetching notifications:', error);
        alert('Error fetching notifications. Please try again later.');
      }
    }
    setHasNewNotification(false); // Clear red dot when button is clicked
    setIsNotificationOpen(!isNotificationOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <button
          onClick={openSidebar}
          className="lg:hidden text-gray-500 hover:text-gray-700"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end relative">
          <div className="max-w-lg w-full lg:max-w-xs">
            <label htmlFor="search" className="sr-only">
              Search books
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                placeholder="Search books"
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchSubmit}
              />
              {suggestions.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((book) => (
                    <div
                      key={book.book_id}
                      className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSuggestionClick(book.book_id)}
                    >
                      <img
                        src={book.cover || '/default-cover.jpg'}
                        alt={book.title}
                        className="w-10 h-14 object-cover mr-3 rounded-sm"
                      />
                      <span className="text-sm font-medium text-gray-800 truncate">{book.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <button
            onClick={toggleNotifications}
            className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" />
            {hasNewNotification && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            )}
          </button>
          {isAdmin ? (
    <>
      <span className="mr-3 text-sm text-gray-600">Admin</span>
      <button
        onClick={handleAdminLogout}
        className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
      >
        Admin Logout
      </button>
    </>
  ) : (
    <button
      onClick={() => setAdminModalOpen(true)}
      className="mr-3 px-4 py-2 text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 flex items-center"
    >
      <Shield className="h-4 w-4 mr-1" />
      Admin
    </button>
  )}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={openLoginModal}
              className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Login
            </button>
          )}
        </div>
      </div>
      {isNotificationOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-lg z-20 border border-gray-200 max-h-80 overflow-y-auto">
          <div className="p-4 sticky top-0 bg-white z-10 border-b">
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          <div className="px-4 pb-4">
            {notifications.length > 0 ? (
              notifications.map((notif, index) => (
                <div key={index} className="mb-3 border-b pb-2 last:border-b-0">
                  <p className="text-sm text-gray-700">{notif.text}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(notif.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No notifications available.</p>
            )}
          </div>
        </div>
      <AdminLoginModal 
  isOpen={adminModalOpen}
  setIsOpen={setAdminModalOpen}
  onAdminLogin={() => {
    setIsAdmin(true);
    setAdminModalOpen(false);
  }}
/>
      )}
    </header>
  );
};

export default Navbar;
