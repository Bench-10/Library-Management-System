import React, { useState, useEffect } from 'react'
import api from '../../api/axios';

function ReturnBookModal({ isOpen, onClose, loan, onReturnSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [bookCondition, setBookCondition] = useState('Good');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRating(loan?.rating || 0);
      setHoveredRating(0);
      setBookCondition('Good'); // Default to 'Good'
      setError('');
    }
  }, [isOpen, loan]);

  if (!isOpen || !loan) return null;
  const handleReturn = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.put(
        `/loans/return/${loan.loan_id}`,
        {
          bookId: loan.book_id,
          rating: rating > 0 ? rating : null,
          copiesBorrowed: loan.copies_borrowed,
          bookCondition: bookCondition
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
      <div className='bg-white rounded-lg p-6 max-w-lg w-full mx-4 animate-slideUp'>
        {/* Header */}
        <div className='text-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>
            Loan Details
          </h2>
          <span className='text-lg font-semibold text-red-600'>#{loan.loan_id}</span>
        </div>

        {/* Information Grid */}
        <div className='space-y-4 mb-6'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <span className='text-gray-600 text-sm'>Book ID:</span>
              <div className='font-semibold'>{loan.book_id}</div>
            </div>
            <div>
              <span className='text-gray-600 text-sm'>Borrower:</span>
              <div className='font-semibold'>{loan.borrower_name}</div>
            </div>
          </div>
          
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <span className='text-gray-600 text-sm'>Author:</span>
              <div className='font-semibold'>{loan.author}</div>
            </div>
            <div>
              <span className='text-gray-600 text-sm'>Cell Number:</span>
              <div className='font-semibold'>{loan.contact_number}</div>
            </div>
          </div>
          
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <span className='text-gray-600 text-sm'>Copies:</span>
              <div className='font-semibold'>{loan.copies_borrowed}</div>
            </div>
            <div>
              <span className='text-gray-600 text-sm'>Borrowed Date:</span>
              <div className='font-semibold'>{loan.loan_date}</div>
            </div>
          </div>
          
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <span className='text-gray-600 text-sm'>Expected Return:</span>
              <div className='font-semibold'>{loan.expected_return_date}</div>
            </div>
            <div>
              <span className='text-gray-600 text-sm'>Status:</span>
              <div>
                <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium'>
                  {loan.status}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <span className='text-gray-600 text-sm'>Fine:</span>
            <div className='font-semibold text-red-600'>₱ {parseFloat(loan.fine_amount || 0).toFixed(2)}</div>
          </div>
        </div>        {/* Rating Section */}
        <div className='mb-6 text-center'>
          <h3 className='font-semibold text-gray-700 mb-3'>Rating:</h3>
          <div className='flex justify-center gap-1'>
            {renderStars()}
          </div>
          {rating > 0 && (
            <p className='text-sm text-gray-500 mt-2'>You rated this book {rating} star{rating !== 1 ? 's' : ''}</p>
          )}
        </div>

        {/* Book Condition Section */}
        <div className='mb-6'>
          <label htmlFor='bookCondition' className='block font-semibold text-gray-700 mb-2'>
            Book Condition <span className='text-red-500'>*</span>
          </label>
          <select
            id='bookCondition'
            value={bookCondition}
            onChange={(e) => setBookCondition(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
            required
          >
            <option value='Excellent'>Excellent - Like new, no damage</option>
            <option value='Good'>Good - Minor wear, fully readable</option>
            <option value='Fair'>Fair - Noticeable wear, some damage</option>
            <option value='Poor'>Poor - Significant wear, pages damaged</option>
            <option value='Damaged'>Damaged - Major damage, missing pages</option>
          </select>
          <p className='text-xs text-gray-500 mt-1'>
            Please assess the condition of the book upon return
          </p>
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
