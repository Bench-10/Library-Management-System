import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { FaHeart, FaSearch, FaExclamationCircle, FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import BorrowBookModal from '../components/modal forms/BorrowBookModal';
import BookDeletedModal from '../components/modal forms/BookDeletedModal';

function Favorites({ onBorrowSuccess }) {
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title'); // 'title', 'book_id', 'added_date'
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isBookDeletedModalOpen, setIsBookDeletedModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isCheckingBook, setIsCheckingBook] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const userData = JSON.parse(localStorage.getItem('userData'));
      const customerId = userData?.user?.customer_id;

      if (!customerId) {
        setError('User not found. Please log in again.');
        return;
      }

      const response = await api.get(`/favorites/${customerId}`);
      setFavorites(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (bookId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const customerId = userData?.user?.customer_id;

      await api.delete('/favorites/remove', {
        data: { customerId, bookId }
      });

      // Remove from local state
      setFavorites(prev => prev.filter(fav => fav.book_id !== bookId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove from favorites');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setSortBy(key);
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <FaSort className="ml-1 inline text-gray-300" />;
    }
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="ml-1 inline" /> 
      : <FaSortDown className="ml-1 inline" />;
  };

  const filteredAndSortedFavorites = useMemo(() => {
    // Filter by search term
    let filtered = favorites.filter((fav) => {
      if (!searchTerm) return true;
      const query = searchTerm.toLowerCase();
      return (
        fav.title?.toLowerCase().includes(query) ||
        fav.author?.toLowerCase().includes(query) ||
        fav.genre?.toLowerCase().includes(query)
      );
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle string comparison
      if (sortConfig.key === 'title' || sortConfig.key === 'author') {
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle numeric comparison
      if (sortConfig.key === 'book_id') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      // Handle date comparison
      if (sortConfig.key === 'added_date') {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        return sortConfig.direction === 'asc'
          ? dateA - dateB
          : dateB - dateA;
      }

      return 0;
    });

    return filtered;
  }, [favorites, searchTerm, sortConfig]);

  const handleBorrowClick = async (book) => {
    setIsCheckingBook(true);
    
    try {
      // Check current book status including deletion status
      const response = await api.get(`/books/${book.book_id}`);
      const bookStatus = response.data;
      
      if (bookStatus.is_deleted) {
        // Book is deleted, show deleted modal
        setSelectedBook(book);
        setIsBookDeletedModalOpen(true);
      } else {
        // Book is available, proceed with borrow modal
        setSelectedBook(book);
        setIsBorrowModalOpen(true);
      }
    } catch (error) {
      console.error('Error checking book status:', error);
      
      if (error.response?.status === 404) {
        // Book not found, likely deleted
        setSelectedBook(book);
        setIsBookDeletedModalOpen(true);
      } else {
        alert('Error checking book status. Please try again.');
      }
    } finally {
      setIsCheckingBook(false);
    }
  };

  return (
    <>
      <BorrowBookModal 
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        book={selectedBook}
        onBorrowSuccess={() => {
          onBorrowSuccess?.();
          fetchFavorites(); // Refresh to update available copies
        }}
      />

      <BookDeletedModal 
        isOpen={isBookDeletedModalOpen}
        onClose={() => setIsBookDeletedModalOpen(false)}
        bookTitle={selectedBook?.title || ''}
      />

      <div className='p-8'>
        <div className='flex items-center justify-between mb-8'>
          <h1 className='text-3xl font-bold text-gray-800 flex items-center gap-3'>
            <FaHeart className='text-red-500' />
            My Favorites
          </h1>
          <div className='text-sm text-gray-600'>
            {favorites.length} {favorites.length === 1 ? 'book' : 'books'} saved
          </div>
        </div>

        {/* Search and Sort Controls */}
        <div className='flex mb-6 items-center gap-4'>
          <div className='relative flex-1 max-w-md'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FaSearch className='text-gray-400' />
            </div>
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className='text-sm text-gray-600 mr-2'>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setSortConfig({ key: e.target.value, direction: 'asc' });
              }}
              className='px-4 py-2 border border-gray-300 rounded h-10 focus:outline-none focus:ring-2 focus:ring-red-500'
            >
              <option value="title">Title</option>
              <option value="book_id">Book ID</option>
              <option value="added_date">Date Added</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className='text-center py-12 text-gray-500'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4'></div>
            Loading favorites...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
            {error}
          </div>
        )}

        {/* Favorites Table */}
        {!isLoading && !error && (
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
                    <th className='px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {filteredAndSortedFavorites.length > 0 ? (
                    filteredAndSortedFavorites.map((fav, index) => (                      <tr key={fav.favorite_id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-red-50 transition-colors duration-150`}>
                        <td className='px-3 py-4'>
                          <div className='flex justify-center items-center'>
                            {fav.available_copies === 0 && (
                              <FaExclamationCircle 
                                className='text-red-600 text-xl' 
                                title='Out of Stock'
                              />
                            )}
                          </div>
                        </td>
                        <td className='px-6 py-4 text-sm text-gray-900 text-center'>{fav.book_id}</td>
                        <td className='px-6 py-4 text-sm text-gray-900 font-medium'>{fav.title}</td>
                        <td className='px-6 py-4 text-sm text-gray-700'>{fav.author}</td>
                        <td className='px-6 py-4 text-sm text-gray-700'>{fav.genre}</td>
                        <td className='px-6 py-4 text-sm text-gray-900 text-center'>
                          <span className={`font-semibold ${fav.available_copies === 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {fav.available_copies}
                          </span>
                        </td>
                        <td className='px-6 py-4 text-sm text-gray-900'>
                          {fav.rating ? (
                            <span className='flex items-center gap-1'>
                              <span className='text-yellow-500'>★</span>
                              {fav.rating}
                            </span>
                          ) : (
                            "--"
                          )}
                        </td>
                        <td className='px-6 py-4 text-center'>
                          <div className='flex items-center justify-center gap-14'>
                            <button
                              disabled={fav.available_copies === 0 || isCheckingBook}
                              onClick={() => handleBorrowClick(fav)}
                              className={`px-4 py-2 rounded font-semibold transition-colors duration-150 text-sm w-30 ${
                                fav.available_copies === 0 || isCheckingBook
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-red-500 text-white hover:bg-red-600'
                              }`}
                            >
                              {isCheckingBook ? 'Checking...' : fav.available_copies === 0 ? 'Unavailable' : 'Borrow'}
                            </button>
                            <button
                              onClick={() => handleRemoveFavorite(fav.book_id)}
                              className='text-red-500 hover:text-red-700 transition-colors'
                              title='Remove from favorites'
                            >
                              <FaHeart className='text-xl' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className='px-6 py-12 text-center text-gray-500'>
                        <FaHeart className='text-6xl text-gray-300 mx-auto mb-4' />
                        <p className='text-lg font-semibold mb-2'>No favorites yet</p>
                        <p className='text-sm'>Start adding books to your favorites from the Book Catalog!</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Favorites;
