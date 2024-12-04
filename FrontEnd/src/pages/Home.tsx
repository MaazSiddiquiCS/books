'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Star, BookOpen, TrendingUp, Clock, BookmarkPlus, Heart, Award, Coffee } from 'lucide-react'
import { fetchBooksWithAuthors } from './api'
import { Link } from 'react-router-dom'

const BASE_URL = 'http://localhost:5001'

export interface Book {
  id: number
  title: string
  ratings: number
  published_date: Date
  language: string
  authors: string
  cover: string
  
}

const Carousel: React.FC<{ books: Book[] }> = ({ books }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % books.length)
    }, 5000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [books.length])

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % books.length)
    }, 5000)
  }

  return (
    <div className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] overflow-hidden rounded-xl shadow-lg mb-8">
      {books.map((book, index) => (
        <div
          key={book.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          style={{
            backgroundImage: `url(${book.cover})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">{book.title}</h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-2 sm:mb-4">{book.authors}</p>
            <Link
              to="/ExploreNow"
              className="inline-block bg-white text-gray-900 px-4 py-2 sm:px-6 sm:py-2 rounded-full text-sm sm:text-base font-semibold hover:bg-gray-200 transition-colors duration-300"
            >
              Explore Now
            </Link>
          </div>
        </div>
      ))}
      <button
        className="absolute top-1/2 left-2 sm:left-4 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-1 sm:p-2"
        onClick={() => {
          setCurrentIndex((prevIndex) => (prevIndex - 1 + books.length) % books.length)
          resetTimer()
        }}
      >
        <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>
      <button
        className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-1 sm:p-2"
        onClick={() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % books.length)
          resetTimer()
        }}
      >
        <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>
    </div>
  )
}

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

  const featuredBooks = books.slice(0, 5)
  const newReleases = books.slice(-5)
  const bestSellers = books.slice(9, 14)
  const staffPicks = books.slice(15, 20)
  const TopRated=books.slice(125,130)
  const Maylike=books.slice(200,205)
  const PopularBooks=books.slice(205,210)

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
    </div>
  )
}

