'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Star, BookOpen, TrendingUp, Clock, BookmarkPlus, Heart, Award, Coffee } from 'lucide-react'
import { fetchBooksWithAuthors } from './api'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
const BASE_URL = 'https://ebms.up.railway.app'

export interface Book {
  id: number
  title: string
  ratings: number
  published_date: Date
  language: string
  authors: string
  cover: string
  numdownloads: number
}

const Carousel: React.FC<{ books: Book[] }> = ({ books }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % books.length);
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [books.length]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % books.length);
    }, 5000);
  };

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden rounded-3xl shadow-xl mb-10 bg-[#f5f1e8]">
      {/* Bookshelf Background */}
      <div className="absolute inset-0 flex">
        {/* Left bookend */}
        <div className="w-16 h-full bg-gradient-to-r from-[#d4a373] to-[#bc8a5f] border-r-2 border-[#a67c52] shadow-lg"></div>
        
        {/* Bookshelf with decorative books */}
        <div className="flex-1 flex items-end h-full pl-2 pr-4 gap-2">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className="h-4/5 w-8 rounded-sm shadow-md"
              style={{
                backgroundColor: ['#8d6e63', '#a1887f', '#bcaaa4', '#d7ccc8', '#efebe9', '#5d4037', '#4e342e', '#3e2723', '#795548', '#6d4c41'][i % 10],
                transform: `translateY(${Math.random() * 10}px)`,
                borderLeft: '1px solid rgba(0,0,0,0.1)'
              }}
            />
          ))}
        </div>
        
        {/* Right bookend */}
        <div className="w-16 h-full bg-gradient-to-l from-[#d4a373] to-[#bc8a5f] border-l-2 border-[#a67c52] shadow-lg"></div>
      </div>

      {/* Wooden Shelf Surface */}
      <div className="absolute bottom-0 w-full h-8 bg-[#bc8a5f] bg-opacity-90">
        <div className="absolute top-0 w-full h-1 bg-[#d4a373]"></div>
        <div className="absolute top-1 w-full h-6 bg-gradient-to-b from-[#a67c52] to-[#bc8a5f]"></div>
        <div className="absolute bottom-0 w-full h-1 bg-[#8b5a2b] shadow-lg"></div>
      </div>

      {/* Featured Book */}
      {books.map((book, index) => (
        <div
          key={book.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Book Display */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 sm:w-56 md:w-64 transform perspective-1000 group">
            <div className="relative h-full transition-all duration-500 group-hover:scale-105">
              {/* Book Cover */}
              <div className="relative h-full bg-white shadow-2xl" style={{
                transform: 'rotateX(10deg) rotateY(-5deg)',
                transformStyle: 'preserve-3d'
              }}>
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover border-2 border-gray-100"
                />
                {/* Book Spine */}
                <div className="absolute top-0 left-0 h-full w-3 bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900" style={{
                  transform: 'translateX(-3px) rotateY(90deg) translateZ(-1px)'
                }} />
                {/* Pages Edge */}
                <div className="absolute top-0 right-0 h-full w-2 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300" style={{
                  transform: 'translateX(2px) rotateY(90deg) translateZ(48px)'
                }} />
              </div>
              {/* Shadow */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-4 bg-black/30 blur-md"></div>
            </div>
          </div>

          {/* Book Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-14 bg-gradient-to-t from-black/70 to-transparent backdrop-blur-sm rounded-t-xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              {book.title}
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mt-1 sm:mt-2">
              {book.authors}
            </p>
            <Link
              to="/ExploreNow"
              className="inline-block mt-4 bg-white text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Explore Now
            </Link>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 transition-all shadow-lg hover:scale-110"
        onClick={() => {
          setCurrentIndex((prevIndex) => (prevIndex - 1 + books.length) % books.length);
          resetTimer();
        }}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 transition-all shadow-lg hover:scale-110"
        onClick={() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % books.length);
          resetTimer();
        }}
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};

export const BookCard: React.FC<{ book: Book }> = ({ book }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
    <Link to={`/BookDetail/${book.id}`} className="block">
      <div className="relative aspect-[2]">
        <img src={book.cover} alt={book.title} className="object-cover w-full h-40" />
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button className="bg-white text-gray-900 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-gray-200 transition-colors duration-300">
            Quick View
          </button>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm sm:text-lg text-gray-900 mb-1 truncate">{book.title}</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-2">{book.authors}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-xs sm:text-sm text-gray-600">{book.ratings}</span>
          </div>
          <button className="text-blue-600 hover:text-blue-800 transition-colors duration-300">
            <BookmarkPlus className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </Link>
  </div>
)

const BookSection: React.FC<{ title: string; icon: React.ReactNode; books: Book[] }> = ({ title, icon, books }) => {
  const [startIndex, setStartIndex] = useState(0)

  const nextBooks = () => {
    setStartIndex((prevIndex) => (prevIndex + 1) % books.length)
  }

  const prevBooks = () => {
    setStartIndex((prevIndex) => (prevIndex - 1 + books.length) % books.length)
  }

  return (
    <section className="mb-8 sm:mb-12">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center">
          {icon}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 ml-2">{title}</h2>
        </div>
        <div className="flex gap-2">
          <button
            className="p-1 sm:p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-300"
            onClick={prevBooks}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="p-1 sm:p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-300"
            onClick={nextBooks}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {[...books, ...books].slice(startIndex, startIndex + 5).map((book, index) => (
          <BookCard key={`${book.id}-${startIndex}-${index}`} book={book} />
        ))}
      </div>
    </section>
  )
}

export default function BookDiscovery() {
  const [books, setBooks] = useState<Book[]>([])

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const response = await fetchBooksWithAuthors()
        setBooks(response.map((book: any) => ({
          ...book,
          id: book.book_id || book.id
        })))
        console.log('Books:', response)
      } catch (error) {
        console.error('Failed to load books:', error)
      }
    }

    loadBooks()
  }, [])
// Helper to shuffle and limit book lists
const getRandomBooks = (arr: Book[], count: number) => {
  return arr.sort(() => 0.5 - Math.random()).slice(0, count)
}

const currentYear = new Date().getFullYear()

const featuredBooks = getRandomBooks(books, 10)


const newReleases = books
  .slice() // avoid mutating the original array
  .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
  .slice(0, 10); // take top 10 recent releases



const TopRated = getRandomBooks(
  books.filter((b) => b.ratings >= 4.8),
  10
)

const bestSellers = getRandomBooks(books, 10) // You could add a `sales` property if available
const staffPicks = getRandomBooks(books, 10)
const Maylike = getRandomBooks(books, 10)
const PopularBooks = books
  .slice()
  .filter(b => b.numdownloads != null) // safety check
  .sort((a, b) => b.numdownloads - a.numdownloads)
  .slice(0, 10); // take top 10 by downloads


  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8">
      <Carousel books={featuredBooks} />
      <BookSection title="New Releases" icon={<Clock className="h-6 w-6 text-gray-600" />} books={newReleases} />
      <BookSection title="Best Sellers" icon={<TrendingUp className="h-6 w-6 text-gray-600" />} books={bestSellers} />
      <BookSection title="Staff Picks" icon={<Award className="h-6 w-6 text-gray-600" />} books={staffPicks} />
      <BookSection title="You May Also Like" icon={<Heart className="h-6 w-6 text-gray-600" />} books={Maylike} />
      <BookSection title="Popular Books" icon={<BookOpen className="h-6 w-6 text-gray-600" />} books={PopularBooks} />
      <BookSection title="Top Rated" icon={<Star className="h-6 w-6 text-gray-600" />} books={TopRated} />
      <BookSection title="Top Picks for You" icon={<Coffee className="h-6 w-6 text-gray-600" />} books={bestSellers} />
      <Footer />
    </div>
  )
}

