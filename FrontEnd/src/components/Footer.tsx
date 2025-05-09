import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left text-gray-600 text-sm">
            © 2024 <span className="font-semibold text-gray-800">EBMS</span>. All rights reserved.
          </div>

          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-500 hover:text-blue-600 transition duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 rounded">
              About
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 transition duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 rounded">
              Privacy
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 transition duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 rounded">
              Terms
            </a>
          </div>

          <div className="flex space-x-4 text-gray-500">
            <a href="#" className="hover:text-blue-500 transition" aria-label="Facebook">
              {FaFacebookF({})}
            </a>
            <a href="#" className="hover:text-blue-400 transition" aria-label="Twitter">
              {FaTwitter({})}
            </a>
            <a href="#" className="hover:text-pink-500 transition" aria-label="Instagram">
              {FaInstagram({})}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
