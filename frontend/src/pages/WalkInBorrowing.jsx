import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaSortUp, FaSortDown, FaSort, FaExclamationCircle, FaUserPlus, FaBook } from "react-icons/fa";
import api from '../api/axios';
import WalkInBorrowModal from '../components/modal forms/WalkInBorrowModal';
import SuccessModal from '../components/modal forms/SuccessModal';
import { sanitizeInput } from '../utils/sanitizeInput';

function WalkInBorrowing() {
  const [books, setBooks] = useState([]);
  const [searchBooks, setSearchBooks] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/books');
      setBooks(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching books:', error);
      setError('Failed to load books');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <FaSort className="text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="text-white" />
      : <FaSortDown className="text-white" />;
  };

  const handleBorrowClick = (book) => {
    setSelectedBook(book);
    setIsBorrowModalOpen(true);
  };
  const handleBorrowSuccess = (loanId, bookTitle) => {
    fetchBooks(); // Refresh books to update available copies
    setIsBorrowModalOpen(false);
    setSelectedBook(null);
    
    // Show success modal
    setSuccessMessage(`Loan processed successfully for "${bookTitle}"! Loan ID: ${loanId}`);
    setIsSuccessModalOpen(true);
  };

  const filteredBooks = useMemo(() => {
    let filtered = books.filter(book => {
      const matchesSearch = book.title?.toLowerCase().includes(searchBooks.toLowerCase()) ||
                           book.author?.toLowerCase().includes(searchBooks.toLowerCase()) ||
                           book.genre?.toLowerCase().includes(searchBooks.toLowerCase());
      
      const matchesGenre = selectedGenre === '' || 
                          book.genre?.toLowerCase() === selectedGenre.toLowerCase();
      
      return matchesSearch && matchesGenre;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'title' || sortConfig.key === 'author') {
          aValue = aValue?.toLowerCase() || '';
          bValue = bValue?.toLowerCase() || '';
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (sortConfig.key === 'book_id' || sortConfig.key === 'available_copies') {
          return sortConfig.direction === 'asc' 
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
    }

    return filtered;
  }, [books, searchBooks, selectedGenre, sortConfig]);
  return (
    <>
      <WalkInBorrowModal 
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        book={selectedBook}
        onBorrowSuccess={handleBorrowSuccess}
      />

      <SuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Loan Processed Successfully!"
        message={successMessage}
      />

      <div className='p-8'>
        <div className='flex items-center justify-between mb-8'>
          <h1 className='text-3xl font-bold text-gray-800 flex items-center gap-3'>
            Walk-in Borrowing
          </h1>
          <div className='text-sm text-gray-600 flex items-center gap-2'>
            <FaBook className='text-gray-500' />
            {filteredBooks.length} books available
          </div>
        </div>

        {/* Filters */}
        <div className='flex mb-6 justify-between items-center gap-4'>
          <div className='flex items-center gap-4 flex-1'>
            <div>
              <select 
                value={selectedGenre} 
                onChange={(e) => setSelectedGenre(e.target.value)} 
                className='p-2 border border-gray-300 rounded h-10'
              >
                <option value="">All genres</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            <div className='relative flex-1 max-w-2xl'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FaSearch className='text-gray-400' />
              </div>
              <input
                type="text"
                placeholder="Search by title, author, or genre"
                value={searchBooks}
                onChange={(e) => setSearchBooks(sanitizeInput(e.target.value))}
                className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {error && (
          <div className='mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded'>
            {error}
          </div>
        )}

        {isLoading ? (
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Loading books...</p>
          </div>
        ) : (
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            <div className='overflow-y-auto max-h-160'>
              <table className='min-w-full bg-white'>
                <thead className='bg-red-800 text-white sticky top-0 z-10'>
                  <tr>
                    <th 
                      className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-red-700 transition-colors'
                      onClick={() => handleSort('book_id')}
                    >
                      <div className='flex items-center gap-2'>
                        Book ID {getSortIcon('book_id')}
                      </div>
                    </th>
                    <th 
                      className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-red-700 transition-colors'
                      onClick={() => handleSort('title')}
                    >
                      <div className='flex items-center gap-2'>
                        Title {getSortIcon('title')}
                      </div>
                    </th>
                    <th 
                      className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-red-700 transition-colors'
                      onClick={() => handleSort('author')}
                    >
                      <div className='flex items-center gap-2'>
                        Author {getSortIcon('author')}
                      </div>
                    </th>
                    <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>Genre</th>
                    <th 
                      className='px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-red-700 transition-colors'
                      onClick={() => handleSort('available_copies')}
                    >
                      <div className='flex items-center justify-center gap-2'>
                        Available {getSortIcon('available_copies')}
                      </div>
                    </th>
                    <th className='px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider'>Action</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {filteredBooks.length > 0 ? (
                    filteredBooks.map((book, index) => (
                      <tr 
                        key={book.book_id} 
                        className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-red-50 transition-colors duration-150`}
                      >
                        <td className='px-6 py-4 text-sm text-gray-900 text-center font-medium'>{book.book_id}</td>
                        <td className='px-6 py-4 text-sm text-gray-900 font-medium'>{book.title}</td>
                        <td className='px-6 py-4 text-sm text-gray-700'>{book.author}</td>
                        <td className='px-6 py-4 text-sm text-gray-700'>{book.genre}</td>
                        <td className='px-6 py-4 text-center'>
                          <div className='flex items-center justify-center gap-2'>
                            <span className={`font-semibold text-lg ${book.available_copies === 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {book.available_copies}
                            </span>
                            {book.available_copies === 0 && (
                              <FaExclamationCircle 
                                className='text-red-600 text-lg' 
                                title='Out of Stock'
                              />
                            )}
                          </div>
                        </td>
                        <td className='px-6 py-4 text-center'>
                          <button
                            onClick={() => handleBorrowClick(book)}
                            disabled={book.available_copies === 0}
                            className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                              book.available_copies === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-500 text-white hover:bg-red-700'
                            }`}
                          >
                            {book.available_copies === 0 ? 'Out of Stock' : 'Process Loan'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className='px-6 py-8 text-center text-gray-500'>
                        No books found matching your search criteria
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

export default WalkInBorrowing;
