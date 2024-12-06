import React, { useEffect, useState } from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { getUserByEmail,  getNotificationsByUserId } from '../pages/api';

interface NavbarProps {
  openSidebar: () => void;
  openLoginModal: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ openSidebar, openLoginModal }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is logged in based on sessionStorage
  useEffect(() => {
    const userEmail = sessionStorage.getItem('userEmail');
    console.log(userEmail);
    setIsLoggedIn(!!userEmail); // Set logged-in status
  }, []);

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userId'); // Optional: Clear userId
    setIsLoggedIn(false); // Update state
    alert('You have successfully logged out.');
  };
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    const userEmail = sessionStorage.getItem('userEmail');
    setIsLoggedIn(!!userEmail); // Set logged-in status
  }, []);

  const fetchNotifications = async () => {
    const userId = sessionStorage.getItem('userID');
    console.log(userId);
    if (!userId) return;

    try {
      const data = await getNotificationsByUserId(userId); // Use the imported function
      setNotifications(data); // Store notifications in state
      setIsNotificationOpen(true); // Open the notification window
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching notifications:', error.message);
      } else {
        console.error('Unknown error:', error);
      }
      alert('There was an error fetching your notifications. Please try again later.');
    }
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
        <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
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
              />
            </div>
          </div>
        </div>
        <div className="flex items-center">
        <button
            onClick={fetchNotifications}
            className="flex-shrink-0 relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
          </button>
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
        <div className="absolute top-16 right-4 bg-white shadow-lg p-4 rounded-lg max-w-xs w-full">
          <h3 className="text-lg font-semibold mb-4">Notifications</h3>
          {notifications.length > 0 ? (
            notifications.map((notif, index) => (
              <div key={index} className="mb-3">
                <p>{notif.text}</p>
                <p className="text-sm text-gray-500">{new Date(notif.timestamp).toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p>No notifications available.</p>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
