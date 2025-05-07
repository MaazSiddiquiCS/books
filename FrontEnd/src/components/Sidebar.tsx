import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Home, ShoppingCart, Heart, Settings, HelpCircle, LogOut, BookmarkPlus } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Book, label: 'My Library', path: '/my-library' },
    { icon: BookmarkPlus, label: 'Read Later', path: '/read-later' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help', path: '/help' },
  ];

  return (
    <aside className={`bg-blue-600 text-white w-64 min-h-screen p-4 fixed left-0 top-0 z-40 transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">EBMS</h2>
        <button onClick={() => setIsOpen(false)} className="lg:hidden">
          <LogOut className="h-6 w-6" />
        </button>
      </div>
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link to={item.path} className="flex items-center space-x-2 p-2 rounded-lg font-medium hover:bg-blue-500 transition duration-150 ease-in-out">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;