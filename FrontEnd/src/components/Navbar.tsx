import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Menu, Search, Bell, User, LogOut } from 'lucide-react';
import { getUserByEmail, getNotificationsByUserId, fetchBooksWithAuthors } from '../pages/api';

interface NavbarProps {
  openSidebar: () => void;
  openLoginModal: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ openSidebar, openLoginModal }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = sessionStorage.getItem('userEmail');
    const adminId = sessionStorage.getItem('adminId');
    setIsLoggedIn(!!userEmail || !!adminId);
    setIsAdmin(!!adminId);
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

  useEffect(() => {
    const userId = sessionStorage.getItem('userID');
    if (!userId || !isLoggedIn || isAdmin) return;

    const fetchNotifications = async () => {
      try {
        const data = await getNotificationsByUserId(userId);
        const currentIds = notifications.map((n) => n.notification_id);
        const hasNew = data.some((n: { notification_id: any }) => !currentIds.includes(n.notification_id));
        setNotifications(data);
        if (hasNew) {
          setHasNewNotification(true);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval);
  }, [isLoggedIn, notifications, isAdmin]);

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

  const toggleNotifications = async () => {
    if (!isNotificationOpen && !isAdmin) {
      const userId = sessionStorage.getItem('userID');
      if (!userId) return;
      try {
        const data = await getNotificationsByUserId(userId);
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        alert('Error fetching notifications. Please try again later.');
      }
    }
    setHasNewNotification(false);
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleAdminLogin = async (adminId: string) => {
    try {
      const response = await fetch('https://ebms.up.railway.app/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: adminId }),
      });

      if (!response.ok) throw new Error('Admin login failed');

      const data = await response.json();
      sessionStorage.setItem('adminId', data.admin.id);
      sessionStorage.setItem('adminName', data.admin.name);
      setIsLoggedIn(true);
      setIsAdmin(true);
      navigate('/admin');
    } catch (error) {
      console.error('Admin login error:', error);
      alert('Admin login failed. Please check your ID.');
    }
  };

  const handleLogout = () => {
    if (isAdmin) {
      sessionStorage.removeItem('adminId');
      sessionStorage.removeItem('adminName');
      setIsAdmin(false);
    } else {
      sessionStorage.removeItem('userEmail');
      sessionStorage.removeItem('userID');
    }
    setIsLoggedIn(false);
    setNotifications([]);
    setHasNewNotification(false);
    window.location.reload();
    alert('You have successfully logged out.');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <button onClick={openSidebar} className="lg:hidden text-gray-500 hover:text-gray-700">
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end relative">
          <div className="max-w-lg w-full lg:max-w-xs">
            <label htmlFor="search" className="sr-only">Search books</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
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
                      className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                      onClick={() => handleSuggestionClick(book.book_id)}
                    >
                      {book.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn && !isAdmin && (
            <button onClick={toggleNotifications} className="relative text-gray-500 hover:text-gray-700">
              <Bell className="h-6 w-6" />
              {hasNewNotification && (
                <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
              )}
            </button>
          )}
          {isAdmin && (
            <span className="mr-4 text-sm text-gray-600 flex items-center">
              <User className="h-4 w-4 mr-1" /> Admin
            </span>
          )}
          {isLoggedIn ? (
            <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700">
              <LogOut className="h-6 w-6" />
            </button>
          ) : (
            <button onClick={openLoginModal} className="text-sm font-medium text-teal-600 hover:text-teal-800">
              Log In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
