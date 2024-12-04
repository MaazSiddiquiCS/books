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
  
  export const fetchBooksByGenre = async (genreId: number) => {
    try {
        // Fetch genre-specific books
        const genreresponse = await fetch(`${BASE_URL}/genre/bookgenre?genre_id=${genreId}`);
        if (!genreresponse.ok) {
            throw new Error(`Failed to fetch books for genre: ${genreresponse.statusText}`);
        }
        
        const genreBooks = await genreresponse.json(); // Store the JSON data in `genreBooks`
        console.log('Fetched genre books:', genreBooks); // This will log the genre-specific books

        // Fetch additional data for books: authors, covers, and ratings
        const booksResponse = await fetch(`${BASE_URL}/books`);
        const authorsResponse = await fetch(`${BASE_URL}/books/bookauthors`);
        const coversResponse = await fetch(`${BASE_URL}/booklinks/bookcover`);
        const ratingResponse = await fetch(`${BASE_URL}/reviews/ratings`);

        const books = await booksResponse.json();
        const authors = await authorsResponse.json();
        const covers = await coversResponse.json();
        const ratings = await ratingResponse.json();

        // Log responses to verify structure
        console.log('Books:', books);
        console.log('Authors:', authors);
        console.log('Covers:', covers);
        console.log('Ratings:', ratings);

        // Map genre-specific books to include authors, covers, and ratings
        return genreBooks.map((genreBook: any) => {
            // Find the corresponding book details based on book_id
            const bookDetails = books.find((book: any) => book.book_id === genreBook.book_id);
            if (!bookDetails) {
                return null; // Return null if no matching book found
            }

            // Find the corresponding author(s) based on book_id
            const bookAuthors = authors.find((author: any) => author.book_id === bookDetails.book_id)?.name || null;

            // Find the corresponding cover based on book_id
            const bookCover = covers.find((cover: any) => cover.book_id === bookDetails.book_id)?.link || null;

            // Find the corresponding rating based on book_id
            const bookRating = ratings.find((rating: any) => rating.book_id === bookDetails.book_id)?.ratings || null;

            // Return the combined book data
            return {
                ...bookDetails,
                authors: bookAuthors,
                cover: bookCover,
                ratings: bookRating
            };
        }).filter((book: any) => book !== null); // Filter out null values (if any)
    } catch (error) {
        console.error('Error fetching books by genre or related data:', error);
        return [];
    }
};

export const fetchBookDetails = async (bookId: number) => {
  try {
      // Fetch the main book details
      const response = await fetch(`${BASE_URL}/books?book_id=${bookId}`);
      const bookDetailArray = await response.json();
      
      // Assuming the book details are in the first element of the array
      const bookdetail = bookDetailArray[0];
      console.log("Fetched book detail:", bookdetail);
      // Fetch related data: authors, covers, and ratings
      const authorsResponse = await fetch(`${BASE_URL}/books/bookauthors`);
      const coversResponse = await fetch(`${BASE_URL}/booklinks/bookcover`);
      const ratingResponse = await fetch(`${BASE_URL}/reviews/ratings`);
      const linkResponse = await fetch(`${BASE_URL}/booklinks`);

      const authors = await authorsResponse.json();
      const covers = await coversResponse.json();
      const ratings = await ratingResponse.json();
      const links= await linkResponse.json();

      // Enrich the book details
      const bookAuthors = authors.find((author: any) => author.book_id === bookId)?.name || null;
      const bookCover = covers.find((cover: any) => cover.book_id === bookId)?.link || null;
      const bookRating = ratings.find((rating: any) => rating.book_id === bookId)?.ratings || null;
      const bookLinks=links.find((links: any) => links.book_id === bookId)?.link || null;

      return {
          bookdetail,  // Include details like title, published date, language
          authors: bookAuthors,
          cover: bookCover,
          ratings: bookRating,
          links: bookLinks
      };
  } catch (error) {
      console.error('Error fetching book details:', error);
      throw error;
  }
};



  


// Function to handle signup
export const fetchSignup = async (username: string, email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      throw new Error(`Signup failed: ${response.statusText}`);
    }

    const signupResponse = await response.json();
    console.log('Signup Response:', signupResponse);
    return signupResponse;
  } catch (error) {
    console.error('Error during signup:', error);
    throw error;
  }
};

// Function to handle login
export const fetchLogin = async (email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const loginResponse = await response.json();
    console.log('Login Response:', loginResponse);
    return loginResponse;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};



  