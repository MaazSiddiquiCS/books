import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import MyLibrary from './pages/MyLibrary';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import ReadLater from './pages/ReadLater';
import Settings from './pages/Settings';
import Help from './pages/Help';
import LoginModal from './components/LoginModal';
import ExploreNow from './pages/ExploreNow';
import BookDetail from './pages/BookDetails';
import Search from './components/Search';
import ReaderPage from './pages/ReaderPage';
import DownloadPage from './pages/DownloadPage';
import Admin from './pages/Admin';
import AdminLoginModal from './components/AdminLoginModal';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  return (
    <Router>
      <div className="flex h-screen bg-gray-100 font-poppins">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar 
            openSidebar={() => setIsSidebarOpen(true)} 
            openLoginModal={() => setIsLoginModalOpen(true)}
            openAdminModal={() => setIsAdminModalOpen(true)}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="container mx-auto px-6 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/my-library" element={<MyLibrary />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/read-later" element={<ReadLater />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/help" element={<Help />} />
                <Route path="/explore-now" element={<ExploreNow />} />
                <Route path="/book-detail/:id" element={<BookDetail />} />
                <Route path="/search" element={<Search />} />
                <Route path="/reader/:id" element={<ReaderPage />} />
                <Route path="/download/:id" element={<DownloadPage />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </div>
          </main>
          <Footer />
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} setIsOpen={setIsLoginModalOpen} />
      <AdminLoginModal 
        isOpen={isAdminModalOpen} 
        setIsOpen={setIsAdminModalOpen}
        onAdminLogin={() => setIsAdminModalOpen(false)}
      />
    </Router>
  );
}

export default App;
