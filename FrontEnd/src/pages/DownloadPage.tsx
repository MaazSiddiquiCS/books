import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft } from 'lucide-react';
import { fetchBookDetails } from './api';

const BASE_URL = 'http://localhost:5001';

const DownloadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const bookId = id ? Number(id) : null;
  const navigate = useNavigate();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!bookId) {
        setError('Invalid book ID');
        setLoading(false);
        return;
      }

      try {
        const bookDetails = await fetchBookDetails(bookId);
        setBook(bookDetails);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch book details');
        setLoading(false);
      }
    };

    fetchData();
  }, [bookId]);

  const handleDownload = async (format: 'pdf' | 'epub') => {
    const userId = sessionStorage.getItem('userID');
    if (!userId || !bookId) {
      alert('Please log in to download');
      return;
    }
  
    try {
      setLoading(true);
      setDownloadProgress(0);
      
      // Create a progress callback
      const onDownloadProgress = (progressEvent: ProgressEvent) => {
        if (progressEvent.lengthComputable) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setDownloadProgress(percentCompleted);
        }
      };

      // Create a blob with the response
      const response = await fetch(`${BASE_URL}/download/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId, 
          book_id: bookId, 
          format 
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Get the blob from the response
      const blob = await response.blob();
      setDownloadProgress(100);
      
      // Create download link and trigger click
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${book?.bookdetail?.title || 'book'}.${format}`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setDownloadProgress(0);
      }, 100);
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-xl">{error || 'Book not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="mr-2" />
          Back to Book
        </button>

        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold mb-4 text-blue-900">Download {book.bookdetail?.title}</h1>
          
          <div className="flex items-center mb-8">
            <img 
              src={book.cover} 
              alt={book.bookdetail?.title} 
              className="w-24 h-32 object-cover rounded-lg mr-6"
            />
            <div>
              <h2 className="text-xl font-semibold text-blue-800">by {book.authors}</h2>
              <p className="text-blue-600">{book.bookdetail?.language}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-blue-900">Download Options</h3>
            <div className="space-y-4">
              <button 
                onClick={() => handleDownload('epub')}
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-3 px-6 rounded-full hover:bg-blue-700 transition duration-300 flex items-center justify-center text-lg font-semibold shadow-lg hover:shadow-xl ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Download className="w-6 h-6 mr-2" />
                {loading && downloadProgress > 0 ? `Downloading... ${downloadProgress}%` : 'Download EPUB'}
              </button>
              <button 
                onClick={() => handleDownload('pdf')}
                disabled={loading}
                className={`w-full bg-gray-600 text-white py-3 px-6 rounded-full hover:bg-gray-700 transition duration-300 flex items-center justify-center text-lg font-semibold shadow-lg hover:shadow-xl ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Download className="w-6 h-6 mr-2" />
                {loading && downloadProgress > 0 ? `Downloading... ${downloadProgress}%` : 'Download PDF'}
              </button>
            </div>
          </div>

          {downloadProgress > 0 && (
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-blue-800">Download Progress</span>
                <span className="text-blue-600">{downloadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Note:</h4>
            <p className="text-blue-700">
              These books are provided for personal use only. Please respect copyright laws.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;