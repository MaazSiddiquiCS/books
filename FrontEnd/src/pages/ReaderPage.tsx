import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBookDetails } from './api';
import { Bookmark } from 'lucide-react';

import { ArrowLeft, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
const BASE_URL = 'https://ebms.up.railway.app';
interface BookDetails {
  bookdetail: {
    book_id: number;
    title: string;
  };
  links: { link: string };
}

const ReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const bookId = id ? Number(id) : null;
  const navigate = useNavigate();

  const [book, setBook] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [filteredPages, setFilteredPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [tocItems, setTocItems] = useState<string[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null); // for scrolling

  useEffect(() => {
    const loadBook = async () => {
      if (bookId === null) {
        setError('Invalid book ID.');
        setLoading(false);
        return;
      }

      try {
        const bookData = await fetchBookDetails(bookId);
        setBook(bookData);

        if (bookData?.links?.link) {
          const response = await fetch(bookData.links.link);
          const htmlContent = await response.text();

          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlContent;

          const allImages = Array.from(tempDiv.querySelectorAll('img'));
          const imageMap = new Map<string, string>();

          allImages.forEach(img => {
            const src = img.getAttribute('src') || '';
            if (!imageMap.has(src)) imageMap.set(src, img.outerHTML);
            img.remove();
          });

          const elements = Array.from(tempDiv.querySelectorAll('h1, h2, h3, h4, p, li, blockquote')).map(el => el.outerHTML);
          const processedElements: string[] = [];
          let currentIndex = 0;

          const checkAndInsertImages = () => {
            const result: string[] = [];
            allImages.forEach(img => {
              const src = img.getAttribute('src') || '';
              const originalIndex = parseInt(img.getAttribute('data-original-index') || '0');
              if (originalIndex === currentIndex && imageMap.has(src)) {
                result.push(imageMap.get(src)!);
                imageMap.delete(src);
              }
            });
            return result.join('');
          };

          for (let i = 0; i < elements.length; i++) {
            processedElements.push(checkAndInsertImages());
            processedElements.push(elements[i]);
            currentIndex++;
          }
          processedElements.push(checkAndInsertImages());

          const maxCharsPerPage = 3000;
          const paginated: string[] = [];
          let buffer = '';

          processedElements.forEach(block => {
            if ((buffer + block).length > maxCharsPerPage) {
              paginated.push(buffer);
              buffer = '';
            }
            buffer += block;
          });

          if (buffer.trim()) paginated.push(buffer);

          const headings = elements.filter(el => el.includes('<h1') || el.includes('<h2') || el.includes('<h3'));
          const toc = headings.map((heading) => heading.replace(/<[^>]*>/g, '').trim());

          const tocPage = `<div><h1>Table of Contents</h1>${toc.map((t, i) => `<p data-page="${i + 1}" class="cursor-pointer hover:underline">${i + 1}. ${t}</p>`).join('')}</div>`;
          setTocItems(toc);
          setPages([tocPage, ...paginated]);
          setFilteredPages([tocPage, ...paginated]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading book:', err);
        setError('Failed to load the book.');
        setLoading(false);
      }
    };

    loadBook();
  }, [bookId]);
  ;
  useEffect(() => {
    const checkBookmark = async () => {
      const userId = sessionStorage.getItem('userID');
      if (!userId || !bookId) return;
  
      try {
        const res = await fetch(`${BASE_URL}/bookmarks/progress?user_id=${userId}&book_id=${bookId}`);
        const data = await res.json();
  
        if (data && data.read_last_page != null) {
          setIsBookmarked(data.read_last_page === currentPage + 1); // match page
        } else {
          setIsBookmarked(false); // no bookmark found, default to false
        }
      } catch (error) {
        console.error('Failed to fetch bookmark:', error);
        setIsBookmarked(false); // in case of error, default to not bookmarked
      }
    };
  
    checkBookmark();
  }, [currentPage, bookId]);
  

  useEffect(() => {
    if (bookId && currentPage >= 0) {
      const userId = sessionStorage.getItem('userID');
      if (userId) {
        fetch(`${BASE_URL}/bookmarks/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            book_id: bookId,
            read_last_page: currentPage,
            total_pages: filteredPages.length,
          })
        }).catch((error) => console.error("Failed to update progress:", error));
      }
    }
  }, [currentPage, bookId]);

  useEffect(() => {
    const fetchProgress = async () => {
      const userId = sessionStorage.getItem('userID');
      if (userId && bookId) {
        try {
          const response = await fetch(`${BASE_URL}/bookmarks/progress?user_id=${userId}&book_id=${bookId}`);
          const data = await response.json();
          if (data?.read_last_page != null) {
            setCurrentPage(data.read_last_page - 1);
          }
        } catch (err) {
          console.error("Failed to load bookmark progress:", err);
        }
      }
    };
    fetchProgress();
  }, [bookId]);
  // Scroll to top of internal container on page change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPages(pages);
      return;
    }

    const query = searchQuery.toLowerCase();
    const newPages = pages.map(page => {
      if (!page.toLowerCase().includes(query)) return null;
      const regex = new RegExp(`(${searchQuery})`, 'gi');
      return page.replace(regex, '<mark class="bg-yellow-300 dark:bg-yellow-600">$1</mark>');
    }).filter(Boolean) as string[];

    setFilteredPages(newPages.length > 0 ? newPages : ['<p>No results found.</p>']);
    setCurrentPage(0);
  }, [searchQuery, pages]);

  const goPrevious = () => {
    setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
  };

  const goNext = () => {
    setCurrentPage(prev => (prev < filteredPages.length - 1 ? prev + 1 : prev));
  };

  const goToPage = (page: number) => {
    if (page >= 0 && page < filteredPages.length) setCurrentPage(page);
  };

  const toggleTheme = () => setDarkMode(!darkMode);
  const zoomIn = () => setZoomLevel(z => Math.min(z + 0.1, 2));
  const zoomOut = () => setZoomLevel(z => Math.max(z - 0.1, 0.5));

  if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50"><p>Loading...</p></div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500"><p>{error}</p></div>;

  return (
    <div className={`fixed inset-0 z-50 ${darkMode ? 'dark' : ''}`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center bg-white dark:bg-gray-800 shadow-md px-4 py-3">
          <button onClick={() => navigate(-1)} className="text-blue-600 dark:text-blue-300 hover:underline flex items-center">
            <ArrowLeft className="mr-2" />Back
          </button>
          <h1 className="flex-1 text-center font-bold text-xl truncate">{book?.bookdetail.title}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                const userId = sessionStorage.getItem('userID');
                if (!userId || bookId === null) return;

                try {
                  if (isBookmarked) {
                    // Delete bookmark
                    await fetch(`${BASE_URL}/bookmarks/delete?user_id=${userId}&book_id=${bookId}`, {
                      method: 'DELETE',
                    });
                    
                    setIsBookmarked(false);
                  } else {
                    // Save bookmark
                    await fetch(`${BASE_URL}/bookmarks/progress`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        user_id: userId,
                        book_id: bookId,
                        read_last_page: currentPage + 1,
                        total_pages:filteredPages.length,
                      })
                    });
                    setIsBookmarked(true);
                  }
                } catch (error) {
                  console.error('Bookmark action failed:', error);
                  alert('Failed to update bookmark.');
                }
              }}
              title={isBookmarked ? "Remove bookmark" : "Bookmark this page"}
              className={`ml-2 p-2 rounded-full ${isBookmarked ? 'bg-blue-600' : 'bg-gray-300'} hover:bg-blue-700 text-white transition-colors`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <input
              type="text"
              placeholder="Search..."
              className="px-2 py-1 rounded-md border dark:bg-gray-700 dark:border-gray-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={zoomOut} title="Zoom Out" className="px-2">-</button>
            <button onClick={zoomIn} title="Zoom In" className="px-2">+</button>
            <button onClick={toggleTheme} title="Toggle Theme" className="px-2">
              {darkMode ? <Sun /> : <Moon />}
            </button>

          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-48 p-2 border-r dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-900 text-sm hidden md:block">
            <h2 className="font-semibold mb-2">Chapters</h2>
            {tocItems.map((item, idx) => (
              <p
                key={idx}
                className={`cursor-pointer hover:underline py-1 ${currentPage === idx + 1 ? 'font-bold text-blue-600 dark:text-blue-400' : ''
                  }`}
                onClick={() => goToPage(idx + 1)}
              >
                {idx + 1}. {item}
              </p>

            ))}
          </aside>

          <main
            ref={contentRef}
            className={`flex-1 overflow-y-auto p-4 transition-all duration-300 ease-in-out ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
              }`}
            style={{ fontSize: `${zoomLevel}em` }}
          >
            <style>
              {`
      .reader-content img {
        display: block !important;
        margin-left: auto !important;
        margin-right: auto !important;
        max-width: 100% !important;
        height: auto !important;
        border-radius: 0.75rem;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }
      .reader-content p {
        text-align: justify;
      }
      .reader-content blockquote {
        font-style: italic;
        color: #555;
        border-left: 4px solid #ccc;
        padding-left: 1rem;
        margin: 1rem 0;
      }
    `}
            </style>

            <div
              className="reader-content prose dark:prose-invert max-w-3xl mx-auto prose-p:text-justify prose-img:mx-auto prose-img:rounded-xl prose-img:shadow-lg"
              dangerouslySetInnerHTML={{ __html: filteredPages[currentPage] }}
            />
          </main>
        </div>

        <div className="bg-white dark:bg-gray-800 py-3 border-t dark:border-gray-700">
          <div className="flex justify-between items-center max-w-4xl mx-auto px-4">
            <button
              onClick={goPrevious}
              disabled={currentPage === 0}
              className={`flex items-center gap-2 px-4 py-1 rounded-full ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              <ChevronLeft /> Previous
            </button>
            <span className="text-sm">
              Page {currentPage + 1} of {filteredPages.length}
            </span>
            <button
              onClick={goNext}
              disabled={currentPage === filteredPages.length - 1}
              className={`flex items-center gap-2 px-4 py-1 rounded-full ${currentPage === filteredPages.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              Next <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReaderPage;
