import React, { useState, useEffect } from 'react'
import axios from 'axios'

function ReturnBookModal({ isOpen, onClose, loan, onReturnSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRating(loan?.rating || 0);
      setHoveredRating(0);
      setError('');
    }
  }, [isOpen, loan]);

  if (!isOpen || !loan) return null;

  const handleReturn = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.put(
        `http://localhost:3000/api/loans/return/${loan.loan_id}`,
        {
          bookId: loan.book_id,
          rating: rating > 0 ? rating : null,
          copiesBorrowed: loan.copies_borrowed
        }
      );

      console.log('Book returned successfully:', response.data);
      
      if (onReturnSuccess) {
        onReturnSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Error returning book:', error);
      setError(error.response?.data?.message || 'Failed to return book. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
          className={`text-3xl transition-colors ${
            i <= (hoveredRating || rating) 
              ? 'text-yellow-400' 
              : 'text-gray-300'
          }`}
        >
          ★
        </button>
      );
    }
    return stars;
  };
  return (
    <div      className='fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn'
      onClick={handleBackdropClick}
    >
      <div className='bg-white rounded-lg  p-8 max-w-lg w-full mx-4 animate-slideUp'>
        {/* Header */}
        <h2 className='text-2xl font-bold mb-6 text-center'>
          Loan ID: <span className='text-red-600'>#{loan.loan_id}</span>
        </h2>

        {/* Information Section - Two Columns */}
        <div className='mb-6 grid grid-cols-2 gap-x-8 gap-y-3'>
          <div>
            <span className='text-gray-700'>Book ID: </span>
            <span className='text-red-600 font-semibold'>{loan.book_id}</span>
          </div>
          <div>
            <span className='text-gray-700'>Borrower: </span>
            <span className='text-red-600 font-semibold'>{loan.borrower_name}</span>
          </div>
          <div>
            <span className='text-gray-700'>Author: </span>
            <span className='text-red-600 font-semibold'>{loan.author}</span>
          </div>
          <div>
            <span className='text-gray-700'>Copies: </span>
            <span className='text-red-600 font-semibold'>{loan.copies_borrowed}</span>
          </div>
          <div>
            <span className='text-gray-700'>Borrowed Date: </span>
            <span className='text-red-600 font-semibold'>{loan.loan_date}</span>
          </div>
          <div>
            <span className='text-gray-700'>Expected Return Date: </span>
            <span className='text-red-600 font-semibold'>{loan.expected_return_date}</span>
          </div>
          <div className='col-span-2'>
            <span className='text-gray-700'>Status: </span>
            <span className='px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold'>
              {loan.status}
            </span>
          </div>
          <div className='col-span-2'>
            <span className='text-gray-700'>Fine: </span>
            <span className='text-red-600 font-semibold'>Php {parseFloat(loan.fine_amount || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Rating Section */}
        <div className='mb-6 text-center'>
          <h3 className='font-semibold text-gray-700 mb-3'>Rating:</h3>
          <div className='flex justify-center gap-1'>
            {renderStars()}
          </div>
          {rating > 0 && (
            <p className='text-sm text-gray-500 mt-2'>You rated this book {rating} star{rating !== 1 ? 's' : ''}</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center'>
            {error}
          </div>
        )}

        {/* Action Button */}
        <div className='flex justify-center'>
          <button
            onClick={handleReturn}
            disabled={isLoading}
            className='px-8 py-3 bg-green-500 text-white rounded-md font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
          >
            {isLoading ? (
              <>
                <span className='animate-spin'>⏳</span>
                Processing...
              </>
            ) : (
              'Set as Returned'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReturnBookModal
