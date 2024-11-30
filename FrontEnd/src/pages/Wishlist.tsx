import React, { useState } from 'react';
import { Heart, Search, ShoppingCart, Trash2, BookOpen, DollarSign } from 'lucide-react';

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  price: number;
}

const wishlistBooks: Book[] = [
  { id: 1, title: "The Midnight Library", author: "Matt Haig", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=300&q=80", price: 14.99 },
  { id: 2, title: "Atomic Habits", author: "James Clear", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80", price: 11.99 },
  { id: 3, title: "The Invisible Life of Addie LaRue", author: "V.E. Schwab", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=300&q=80", price: 13.99 },
  { id: 4, title: "Project Hail Mary", author: "Andy Weir", cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=300&q=80", price: 15.99 },
  { id: 5, title: "The Paris Apartment", author: "Lucy Foley", cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=300&q=80", price: 12.99 },
];

const WishlistItem: React.FC<{ book: Book; onRemove: () => void }> = ({ book, onRemove }) => (
  <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-md transition duration-300 hover:shadow-lg">
    <img src={book.cover} alt={book.title} className="w-16 h-24 object-cover rounded-md" />
    <div className="flex-grow">
      <h3 className="font-semibold text-lg text-gray-900">{book.title}</h3>
      <p className="text-sm text-gray-600">{book.author}</p>
      <div className="flex items-center mt-2">
        <DollarSign className="h-4 w-4 text-green-600" />
        <span className="text-lg font-bold text-green-600">{book.price.toFixed(2)}</span>
      </div>
    </div>
    <div className="flex space-x-2">
      <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-teal-600 transition duration-300" title="Add to Cart">
        <ShoppingCart className="h-5 w-5" />
      </button>
      <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300" title="Preview">
        <BookOpen className="h-5 w-5" />
      </button>
      <button onClick={onRemove} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300" title="Remove from Wishlist">
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  </div>
);

const Wishlist: React.FC = () => {
  const [books, setBooks] = useState(wishlistBooks);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const removeBook = (id: number) => {
    setBooks(books.filter(book => book.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Heart className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900 ml-2">My Wishlist</h1>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search wishlist..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="space-y-4">
        {filteredBooks.map(book => (
          <WishlistItem key={book.id} book={book} onRemove={() => removeBook(book.id)} />
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4"   />
          <p className="text-xl text-gray-600">Your wishlist is empty.</p>
          <p className="text-sm text-gray-500 mt-2">Start adding books you love!</p>
        </div>
      )}
    </div>
  );
}

export default Wishlist;