import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { FaSearch, FaSortUp, FaSortDown, FaSort } from 'react-icons/fa'

function BorrowHistoryModal({ isOpen, onClose }) {
  const [loans, setLoans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Get unique dates for filter - MUST be before early return
  const availableDates = useMemo(() => {
    return [...new Set(loans.map(loan => loan.loan_date))].sort();
  }, [loans]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <FaSort className="ml-1 inline text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="ml-1 inline" /> 
      : <FaSortDown className="ml-1 inline" />;
  };

  // Filter loans - MUST be before early return
  const filteredLoans = useMemo(() => {
    let filtered = loans.filter((loan) => {
      const matchesSearch = !searchTerm || 
        loan.book_title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !filterDate || loan.loan_date === filterDate;
      return matchesSearch && matchesDate;
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle string comparison for book_title
        if (sortConfig.key === 'book_title') {
          aValue = aValue?.toLowerCase() || '';
          bValue = bValue?.toLowerCase() || '';
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle numeric comparison for loan_id
        if (sortConfig.key === 'loan_id') {
          return sortConfig.direction === 'asc' 
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
    }

    return filtered;
  }, [loans, searchTerm, filterDate, sortConfig]);

  useEffect(() => {
    if (isOpen) {
      fetchReturnedLoans();
    }
  }, [isOpen]);

  const fetchReturnedLoans = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:3000/api/loans');
      // Filter only returned loans
      const returnedLoans = response.data.filter(loan => loan.status === 'Returned');
      setLoans(returnedLoans);
      setError('');
    } catch (error) {
      console.error('Error fetching returned loans:', error);
      setError('Failed to load borrow history');
    } finally {
      setIsLoading(false);
    }
  };

  // Early return AFTER all hooks
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  return (
    <div 
      className='fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn'
      onClick={handleBackdropClick}
    >
      <div className='bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col animate-slideUp'>
        {/* Header */}
        <div className='p-6 border-b border-gray-200'>
          <div className='flex justify-between items-center'>
            <h2 className='text-2xl font-bold text-gray-800'>Borrow History</h2>
            <button 
              onClick={onClose}
              className='text-gray-500 hover:text-gray-700 text-2xl font-bold'
            >
              ×
            </button>
          </div>

          {/* Search and Filter */}
          <div className='flex gap-4 mt-4'>
            <div>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className='px-4 py-2 border border-gray-300 rounded h-10 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value="">Date</option>
                {availableDates.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            </div>

            <div className='relative flex-1 max-w-md'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FaSearch className='text-gray-400' />
              </div>
              <input
                type="text"
                placeholder="Search, Title"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-auto p-6'>
          {/* Loading State */}
          {isLoading && (
            <div className='text-center py-8 text-gray-500'>
              Loading history...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
              {error}
            </div>
          )}

          {/* Table */}
          {!isLoading && !error && (
            <div className='overflow-hidden shadow-md rounded-lg border border-gray-200'>              <table className='min-w-full bg-white'>
                <thead className='bg-gray-800 text-white sticky top-0 z-10'>
                  <tr>
                    <th 
                      className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors'
                      onClick={() => handleSort('loan_id')}
                    >
                      Loan ID {getSortIcon('loan_id')}
                    </th>
                    <th 
                      className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors'
                      onClick={() => handleSort('book_title')}
                    >
                      Book Title {getSortIcon('book_title')}
                    </th>
                    <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>Borrower</th>
                    <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>Date Borrowed</th>
                    <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>Expected Return</th>
                    <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>No. of Copies</th>
                    <th className='px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider'>Rating</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {filteredLoans.length > 0 ? (
                    filteredLoans.map((loan, index) => (
                      <tr key={loan.loan_id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className='px-6 py-4 text-sm text-gray-900 text-center'>{loan.loan_id}</td>
                        <td className='px-6 py-4 text-sm text-gray-900 font-medium'>{loan.book_title}</td>
                        <td className='px-6 py-4 text-sm text-gray-700'>{loan.borrower_name}</td>
                        <td className='px-6 py-4 text-sm text-gray-700'>{loan.loan_date}</td>
                        <td className='px-6 py-4 text-sm text-gray-700'>{loan.expected_return_date}</td>
                        <td className='px-6 py-4 text-sm text-gray-900 text-center font-semibold'>{loan.copies_borrowed}</td>
                        <td className='px-6 py-4 text-center'>
                          {loan.rating ? (
                            <span className='flex items-center justify-center gap-1'>
                              <span className='text-yellow-500'>★</span>
                              <span className='font-semibold'>{loan.rating}</span>
                            </span>
                          ) : (
                            <span className='text-gray-400'>--</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className='px-6 py-8 text-center text-gray-500'>
                        No history found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BorrowHistoryModal
