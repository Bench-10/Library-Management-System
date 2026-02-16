import React, { useMemo, useState, useEffect } from 'react';
import { FaSearch, FaSortUp, FaSortDown, FaSort, FaExclamationCircle, FaHeart, FaRegHeart } from "react-icons/fa";
import api from '../api/axios';
import BorrowBookModal from '../components/modal forms/BorrowBookModal';
import { sanitizeInput } from '../utils/sanitizeInput';

function BookCatalog({ books = [], setBorrowBook, onBorrowSuccess }) {
  const [searchBooks, setSearchBooks] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [favoriteBookIds, setFavoriteBookIds] = useState([]);

  const genres = useMemo(() => {
    const map = new Map();
    books.filter(b => b && typeof b === 'object').forEach(b => {
      const g = b.genre?.trim();
      if (g) {
        const key = g.toLowerCase();
        if (!map.has(key)) map.set(key, g);
      }
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [books]);

  useEffect(() => {
    fetchFavoriteBookIds();
  }, []);

  const fetchFavoriteBookIds = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const customerId = userData?.user?.customer_id;
      
      if (!customerId) return;

      const response = await api.get(`/favorites/${customerId}/ids`);
      setFavoriteBookIds(response.data);
    } catch (error) {
      console.error('Error fetching favorite IDs:', error);
    }
  };

  const toggleFavorite = async (bookId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const customerId = userData?.user?.customer_id;

      if (!customerId) {
        alert('Please log in to add favorites');
        return;
      }

      await api.post('/favorites/toggle', {
        customerId,
        bookId
      });

      // Update local state
      setFavoriteBookIds(prev => {
        if (prev.includes(bookId)) {
          return prev.filter(id => id !== bookId);
        } else {
          return [...prev, bookId];
        }
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorites');
    }
  };

  const isFavorited = (bookId) => {
    return favoriteBookIds.includes(bookId);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <FaSort className="ml-1 inline text-gray-300" />;
    }
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="ml-1 inline" /> 
      : <FaSortDown className="ml-1 inline" />;
  };

  const filteredBooks = useMemo(() => {
    const q = searchBooks.trim().toLowerCase();
    let filtered = books.filter((book) => {
      if (!book || typeof book !== 'object') return false;
      const matchesSearch = !q || [book.title, book.author, book.genre].some(f => f?.toLowerCase().includes(q));
      const matchesGenre = !selectedGenre || (book.genre?.toLowerCase() === selectedGenre.toLowerCase());
      return matchesSearch && matchesGenre;
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle string comparison for title
        if (sortConfig.key === 'title') {
          aValue = aValue?.toLowerCase() || '';
          bValue = bValue?.toLowerCase() || '';
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle numeric comparison for book_id
        if (sortConfig.key === 'book_id') {
          return sortConfig.direction === 'asc' 
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
    }

    return filtered;
  }, [books, searchBooks, selectedGenre, sortConfig]);

  const handleBorrowClick = (book) => {
    setSelectedBook(book);
    setIsBorrowModalOpen(true);
  };
  return (
    <>
      <BorrowBookModal 
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        book={selectedBook}
        onBorrowSuccess={onBorrowSuccess}
      />
      
      <div className='p-8'>
        <h1 className='text-3xl font-bold mb-8 text-gray-800'>
          Book Catalog
        </h1>

        <div className='flex mb-6 items-center gap-4'>
          <div className='relative flex-1 max-w-md'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FaSearch className='text-gray-400' />
            </div>
            <input
              type="text"
              placeholder="Search Title, Author"
              value={searchBooks}
              onChange={(e) => setSearchBooks(sanitizeInput(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className='px-4 py-2 border border-gray-300 rounded h-10 focus:outline-none focus:ring-2 focus:ring-red-500'
            >
              <option value="">All</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className='overflow-hidden shadow-md rounded-lg border border-gray-200'>
          <div className='overflow-y-auto max-h-160'>           
             <table className='min-w-full bg-white'>           
               <thead className='bg-red-800 text-white sticky top-0 z-10'>
                <tr>
                  <th className='px-3 py-4 text-center text-sm font-semibold uppercase tracking-wider w-12'>
                    {/* Icon column */}
                  </th>
                  <th 
                    className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-red-600 transition-colors'
                    onClick={() => handleSort('book_id')}
                  >
                    Book ID {getSortIcon('book_id')}
                  </th>
                  <th 
                    className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-red-600 transition-colors'
                    onClick={() => handleSort('title')}
                  >
                    Title {getSortIcon('title')}
                  </th>
                  <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>Author</th>
                  <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>Genre</th>
                  <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>Available Copies</th>
                  <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>Rating</th>
                  <th className='px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book, index) => (                    <tr key={book.book_id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-red-50 transition-colors duration-150`}>
                      <td className='px-3 py-4'>
                        <div className='flex justify-center items-center'>
                          {book.available_copies === 0 && (
                            <FaExclamationCircle 
                              className='text-red-600 text-xl' 
                              title='Out of Stock'
                            />
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-900 text-center'>{book.book_id}</td>
                      <td className='px-6 py-4 text-sm text-gray-900 font-medium'>{book.title}</td>
                      <td className='px-6 py-4 text-sm text-gray-700'>{book.author}</td>
                      <td className='px-6 py-4 text-sm text-gray-700'>{book.genre}</td>
                      <td className='px-6 py-4 text-sm text-gray-900 text-center'>
                        <span className={`font-semibold ${book.available_copies === 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {book.available_copies}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-900'>
                        {book.rating ? (
                          <span className='flex items-center gap-1'>
                            <span className='text-yellow-500'>★</span>
                            {book.rating}
                          </span>
                        ) : (
                          "--"
                        )}                      </td>                      <td className='px-6 py-4 text-center'>
                        <div className='flex items-center justify-center gap-14'>
                          <button
                            disabled={book.available_copies === 0}
                            onClick={() => handleBorrowClick(book)}
                            className={`px-4 py-2 rounded font-semibold transition-colors duration-150 w-30 ${
                              book.available_copies === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                          >
                            {book.available_copies === 0 ? 'Unavailable' : 'Borrow'}
                          </button>
                          <button
                            onClick={() => toggleFavorite(book.book_id)}
                            className='text-red-500 hover:scale-110 transition-transform duration-150'
                            title={isFavorited(book.book_id) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            {isFavorited(book.book_id) ? (
                              <FaHeart className='text-2xl' />
                            ) : (
                              <FaRegHeart className='text-2xl' />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))                ) : (
                  <tr>
                    <td colSpan="8" className='px-6 py-8 text-center text-gray-500'>
                      No books found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default BookCatalog;
