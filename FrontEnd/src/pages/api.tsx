const BASE_URL = 'http://localhost:5001'; // Replace with your backend's base URL

// Helper function to handle API responses
const handleResponse = async (response: any) => {
    if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.message || 'Something went wrong!');
    }
    return response.json();
};

// Fetch all books
export const fetchAllBooks = async () => {
    try {
        const response = await fetch(`${BASE_URL}/books`);
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching books:', error);
        throw error;
    }
};

// Fetch all authors
export const fetchAllAuthors = async () => {
    try {
        const response = await fetch(`${BASE_URL}/authors`);
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching authors:', error);
        throw error;
    }
};
export const fetchAllBooklinks = async () => {
  try {
      const response = await fetch(`${BASE_URL}/booklinks`);
      return await handleResponse(response);
  } catch (error) {
      console.error('Error fetching authors:', error);
      throw error;
  }
};
// Fetch books with authors (optional)
export const fetchBooksWithAuthors = async () => {
  try {
      const booksResponse = await fetch(`${BASE_URL}/books`);
      const authorsResponse = await fetch(`${BASE_URL}/books/bookauthors`);
      const coversResponse = await fetch(`${BASE_URL}/booklinks/bookcover`);
      const ratingResponse= await fetch(`${BASE_URL}/reviews/ratings`);

      const books = await booksResponse.json();
      const authors = await authorsResponse.json();
      const covers = await coversResponse.json();
      const ratings = await ratingResponse.json();

      // Log responses to verify structure
      console.log('Books:', books);
      console.log('Authors:', authors);
      console.log('Covers:', covers);
      console.log('Ratings:', ratings);
      // Combine books, authors, and covers based on book_id
      return books.map((book: any) => {
          // Find the corresponding author(s) based on book_id
          const bookAuthors = authors.find((author: any) => author.book_id === book.book_id)?.name || null; // Fallback if no authors found

          // Find the corresponding cover based on book_id
          const bookCover = covers.find((cover: any) => cover.book_id === book.book_id)?.link || null; // Find first cover link or null
          const bookrating = ratings.find((rating: any) => rating.book_id === book.book_id)?.ratings || null;

          return {
              ...book,
              authors: bookAuthors,
              cover: bookCover,
              ratings:bookrating // Single cover link
          };
      });
  } catch (error) {
      console.error('Error fetching books, authors, or covers,or ratings:', error);
      return [];
  }
};

export const fetchGenres = async ()=> {
    const response = await fetch('http://localhost:5001/genre'); // Adjust endpoint
    if (!response.ok) {
      throw new Error('Failed to fetch genres');
    }
    return response.json();
  };
  
  export const fetchBooksByGenre = async () => {
    const genreresponse = await fetch(`${BASE_URL}/genre/bookgenre`); 
    if (!genreresponse.ok) {
        throw new Error(`Failed to fetch books for genre: ${genreresponse.statusText}`);
    }
    
    const genre = await genreresponse.json(); // Store the JSON data in `genre`
    console.log('Genre:', genre); // This will now log the genre data correctly
    
    return genre; // Return the genre data
};

  