const BASE_URL = 'https://ebms.up.railway.app'; // Replace with your backend's base URL

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
      const downloadsResponse= await fetch(`${BASE_URL}/download/numdownloads`);

      const books = await booksResponse.json();
      const authors = await authorsResponse.json();
      const covers = await coversResponse.json();
      const ratings = await ratingResponse.json();
      const downloads = await downloadsResponse.json();
      console.log('Downloads',downloads);
      // Log responses to verify structure
      // Combine books, authors, and covers based on book_id
      return books.map((book: any) => {
          // Find the corresponding author(s) based on book_id
          const bookAuthors = authors.find((author: any) => author.book_id === book.book_id)?.name || null; // Fallback if no authors found

          // Find the corresponding cover based on book_id
          const bookCover = covers.find((cover: any) => cover.book_id === book.book_id)?.link || null; // Find first cover link or null
          const bookrating = ratings.find((rating: any) => rating.book_id === book.book_id)?.ratings || null;
          const downloadnum = downloads.find((download: any) => download.book_id === book.book_id)?.numdownloads || null;
          return {
              ...book,
              authors: bookAuthors,
              cover: bookCover,
              ratings:bookrating,
              numdownloads:downloadnum,// Single cover link
          };
      });
  } catch (error) {
      console.error('Error fetching books, authors, or covers,or ratings:', error);
      return [];
  }
};

export const fetchGenres = async ()=> {
    const response = await fetch('https://ebms.up.railway.app/genre'); // Adjust endpoint
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
      const linkResponse = await fetch(`${BASE_URL}/booklinks/linkonly/${bookId}`);

      const authors = await authorsResponse.json();
      const covers = await coversResponse.json();
      const ratings = await ratingResponse.json();
      const links= await linkResponse.json();

      // Enrich the book details
      const bookAuthors = authors.find((author: any) => author.book_id === bookId)?.name || null;
      const bookCover = covers.find((cover: any) => cover.book_id === bookId)?.link || null;
      const bookRating = ratings.find((rating: any) => rating.book_id === bookId)?.ratings || null;

      return {
          bookdetail,  // Include details like title, published date, language
          authors: bookAuthors,
          cover: bookCover,
          ratings: bookRating,
          links: links
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

// Define the interface for Read Later data
export interface ReadLater {
  //read_later_id: number;
  user_id: string;
  book_id: number;
  added_at: string;
}
export interface Bookmark {
  //read_later_id: number;
  user_id: string;
  book_id: number;
  added_at: string;
}
// Function to add book to "Read Later" list
export const pushReadLater = async (readLaterData: ReadLater) => {
  const response = await fetch('https://ebms.up.railway.app/readLater', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: readLaterData.user_id, // Ensure the field names match what the backend expects
      bookId: readLaterData.book_id,
      addedAt: readLaterData.added_at,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to add to Read Later');
  }

  return response.json();
};
export const addBookmark = async (bookmarkData: Bookmark) => {
  const response = await fetch('https://ebms.up.railway.app/books/addBookmark', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          user_id: bookmarkData.user_id, 
          book_id: bookmarkData.book_id,
          bookmark_date: bookmarkData.added_at, // Correct the key name here
      }),
  });

  if (!response.ok) {
      throw new Error('Failed to add bookmark');
  }

  return response.json();
};
export const fetchBookmarks = async (userId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/books/addBookmark/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch bookmarks: ${response.statusText}`);
    }
    const bookmarks = await response.json();

    // Extract book IDs
    const bookIds = bookmarks.map((item: { book_id: number }) => item.book_id);
    console.log('Book IDs:', bookIds); // Log the extracted book IDs

    // Fetch all books with authors
    const allBooks = await fetchBooksWithAuthors();
    console.log('All Books:', allBooks); // Log all books fetched

    // Ensure that allBooks contains the expected structure
    if (!Array.isArray(allBooks) || allBooks.length === 0) {
      console.warn('No books found in allBooks.');
      return []; // Return an empty array if no books are found
    }

    // Filter books matching the "Read Later" book IDs
    const enrichedBooks = allBooks.filter((book: any) => bookIds.includes(book.book_id)); // Ensure you're using the correct property
    console.log('Enriched Books:', enrichedBooks); // Log the enriched books

    return enrichedBooks;
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    throw error;
  }
};
export const deleteBookmark = async (userId: string, bookId: number) => {
  try {
      const response = await fetch(`${BASE_URL}/addBookmark/${userId}/${bookId}`, {
          method: 'DELETE',
      });
      if (!response.ok) {
          throw new Error('Failed to delete bookmark');
      }
      return await response.json();
  } catch (error) {
      console.error('Error deleting bookmark:', error);
      throw error;
  }
};
export async function getUserByEmail(email:any) {
  try {
    const response = await fetch(`${BASE_URL}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Specify JSON content type
      },
      body: JSON.stringify({ email }), // Pass the email in the request body
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user');
    }

    const data = await response.json(); // Parse the JSON response
    console.log('User data:', data);
    return data; // Return the data for further use
  } catch (error) {
    console.error('Error fetching user:', error);
    alert(error); // Optionally, show an alert for errors
    return null; // Return null in case of an error
  }
}

// api.tsx
export const fetchReadLaterBooks = async (userId: string) => {
  try {
      const response = await fetch(`https://ebms.up.railway.app/readLater/${userId}`);
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const readLaterBooks = await response.json();
      console.log('Read Later Books:', readLaterBooks); // Log the response

      // Check if readLaterBooks is an array and has items
      if (!Array.isArray(readLaterBooks) || readLaterBooks.length === 0) {
          console.warn('No read later books found for user:', userId);
          return []; // Return an empty array if no books are found
      }

      // Extract book IDs
      const bookIds = readLaterBooks.map((item: { book_id: number }) => item.book_id);
      console.log('Book IDs:', bookIds); // Log the extracted book IDs

      // Fetch all books with authors
      const allBooks = await fetchBooksWithAuthors();
      console.log('All Books:', allBooks); // Log all books fetched

      // Ensure that allBooks contains the expected structure
      if (!Array.isArray(allBooks) || allBooks.length === 0) {
          console.warn('No books found in allBooks.');
          return []; // Return an empty array if no books are found
      }

      // Filter books matching the "Read Later" book IDs
      const enrichedBooks = allBooks.filter((book: any) => bookIds.includes(book.book_id)); // Ensure you're using the correct property
      console.log('Enriched Books:', enrichedBooks); // Log the enriched books

      return enrichedBooks;
  } catch (error) {
      console.error("Error fetching 'Read Later' books:", error);
      return [];
  }
};
export async function getNotificationsByUserId(user_id:string) {
  try {
    const response = await fetch(`https://ebms.up.railway.app/user/notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Specify JSON content type
      },
      body: JSON.stringify({ user_id }), // Pass the email in the request body
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user');
    }

    const data = await response.json(); // Parse the JSON response
    return data; // Return the data for further use
  } catch (error) {
    console.error('Error fetching user:', error);
    alert(error); // Optionally, show an alert for errors
    return null; // Return null in case of an error
  }
}
// GET all reviews
export const fetchReviews = async (book_id: number) => {
  try {
    const response = await fetch(`${BASE_URL}/reviews?book_id=${book_id}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

// POST a new review
export const addReview = async (reviewData: { user_id: string|null; book_id: number|null; rating: number; comment: string; username: string|null}) => {
  try {
    const response = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

// DELETE a specific review by review_id
// DELETE a specific review by review_id
export const deleteReview = async (Id: number) => {
  try {
    const response = await fetch(`${BASE_URL}/reviews/${Id}`, {
      method: 'DELETE',
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};


  
