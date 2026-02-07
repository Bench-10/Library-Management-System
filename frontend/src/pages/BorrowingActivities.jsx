import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { FaSearch, FaSortUp, FaSortDown, FaSort } from 'react-icons/fa'
import ReturnBookModal from '../components/modal forms/ReturnBookModal'
import BorrowHistoryModal from '../components/modal forms/BorrowHistoryModal'

function BorrowingActivities() {
  const [loans, setLoans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  useEffect(() => {
    fetchAllLoans();
  }, []);

  const fetchAllLoans = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:3000/api/loans');
      setLoans(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching all loans:', error);
      setError('Failed to load borrowing activities');
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique dates for filter
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
      return <FaSort className="ml-1 inline text-gray-300" />;
    }
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="ml-1 inline" /> 
      : <FaSortDown className="ml-1 inline" />;
  };

  const filteredLoans = useMemo(() => {
    let filtered = loans.filter((loan) => {
      // Only show "Borrowed" status loans (hide "Returned" loans)
      const isBorrowed = loan.status === 'Borrowed';
      const matchesSearch = !searchTerm || 
        loan.book_title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !filterDate || loan.loan_date === filterDate;
      return isBorrowed && matchesSearch && matchesDate;
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

  const handleOpenReturnModal = (loan) => {
    if (loan.status === 'Borrowed') {
      setSelectedLoan(loan);
      setIsReturnModalOpen(true);
    }
  };

  const handleReturnSuccess = () => {
    fetchAllLoans(); // Refresh the list
  };
  return (
    <div className='p-8'>
      <ReturnBookModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        loan={selectedLoan}
        onReturnSuccess={handleReturnSuccess}
      />

      <BorrowHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold text-gray-800'>
          Borrowing Activities Page
        </h1>
        <button 
          onClick={() => setIsHistoryModalOpen(true)}
          className='px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors'
        >
          Borrow History
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className='flex gap-4 mb-6'>
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

      {/* Loading State */}
      {isLoading && (
        <div className='text-center py-8 text-gray-500'>
          Loading borrowing activities...
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
        <div className='overflow-hidden shadow-md rounded-lg border border-gray-200'>
          <div className='overflow-y-auto max-h-160'>            <table className='min-w-full bg-white'>
              <thead className='bg-red-500 text-white sticky top-0 z-10'>
                <tr>
                  <th 
                    className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-red-600 transition-colors'
                    onClick={() => handleSort('loan_id')}
                  >
                    Loan ID {getSortIcon('loan_id')}
                  </th>
                  <th 
                    className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-red-600 transition-colors'
                    onClick={() => handleSort('book_title')}
                  >
                    Book Title {getSortIcon('book_title')}
                  </th>
                  <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>Borrower</th>
                  <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>Expected Return Date</th>
                  <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>No. Copies Borrowed</th>
                  <th className='px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider'>Status</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {filteredLoans.length > 0 ? (
                  filteredLoans.map((loan, index) => (
                    <tr 
                      key={loan.loan_id} 
                      onClick={() => handleOpenReturnModal(loan)}
                      className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${
                        loan.status === 'Borrowed' ? 'hover:bg-blue-50 cursor-pointer' : ''
                      } transition-colors duration-150`}
                    >
                      <td className='px-6 py-4 text-sm text-gray-900 text-center'>{loan.loan_id}</td>
                      <td className='px-6 py-4 text-sm text-gray-900 font-medium'>{loan.book_title}</td>
                      <td className='px-6 py-4 text-sm text-gray-700'>{loan.borrower_name}</td>
                      <td className='px-6 py-4 text-sm text-gray-700'>{loan.expected_return_date}</td>
                      <td className='px-6 py-4 text-sm text-gray-900 text-center font-semibold'>{loan.copies_borrowed}</td>
                      <td className='px-6 py-4 text-center'>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${
                          loan.status === 'Borrowed' ? 'bg-blue-600' : 'bg-green-600'
                        }`}>
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className='px-6 py-8 text-center text-gray-500'>
                      No borrowing activities found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default BorrowingActivities