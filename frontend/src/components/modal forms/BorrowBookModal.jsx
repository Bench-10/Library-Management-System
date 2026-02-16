import React, { useState, useEffect } from 'react'
import api from '../../api/axios';

function BorrowBookModal({ isOpen, onClose, book, onBorrowSuccess }) {
  const [quantity, setQuantity] = useState(1);
  const [returnDate, setReturnDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate default return date (5 days from now to match backend)
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const defaultReturn = new Date(today);
      defaultReturn.setDate(today.getDate() + 5);
      setReturnDate(defaultReturn.toISOString().split('T')[0]);
      setQuantity(1);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !book) return null;

  // Calculate late fee (10 pesos per day)
  const lateFeePerDay = 10;
  
  // Calculate the actual maximum quantity that can be borrowed
  // (minimum of available copies and the book's borrow limit)
  const maxBorrowQuantity = Math.min(book.available_copies, book.borrow_limit || 3);

  const handleBorrow = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Get customer ID from localStorage
      const userData = JSON.parse(localStorage.getItem('userData'));
      const customerId = userData.user.customer_id;

      const response = await api.post('/borrow', {
        bookId: book.book_id,
        customerId: customerId,
        copiesToBorrow: quantity
      });

      console.log('Book borrowed successfully:', response.data);
      
      // Call success callback to refresh books
      if (onBorrowSuccess) {
        onBorrowSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Error borrowing book:', error);
      setError(error.response?.data?.message || 'Failed to borrow book. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  return (
    <div 
      className='fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn'
      onClick={handleBackdropClick}
    >
      <div className='bg-white rounded-lg shadow-xl p-8 max-w-lg w-full mx-4 animate-slideUp'>
        {/* Header */}
        <h2 className='text-2xl font-bold mb-6'>
          Borrow <span className='text-red-600'>{book.title}</span>
        </h2>

        {/* Information Section */}
        <div className='mb-6'>
          <h3 className='font-semibold text-gray-700 mb-3'>Information</h3>
          <div className='grid grid-cols-2 gap-y-2 text-sm'>
            <div>
              <span className='text-gray-600'>Book ID: </span>
              <span className='text-red-600 font-semibold'>{book.book_id}</span>
            </div>
            <div>
              <span className='text-gray-600'>Author: </span>
              <span className='text-red-600 font-semibold'>{book.author}</span>
            </div>
            <div>
              <span className='text-gray-600'>Action: </span>
              <span className='text-red-600 font-semibold'>{book.genre}</span>
            </div>
            <div>
              <span className='text-gray-600'>Rating: </span>
              <span className='text-red-600 font-semibold'>{book.rating || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Available Copies and Borrow Limit */}
        <div className='text-center mb-6'>
          <div className='mb-2'>
            <span className='text-xl font-semibold'>Available: </span>
            <span className='text-red-600 text-3xl font-bold'>{book.available_copies}</span>
          </div>
          <div className='text-sm text-gray-600'>
            <span className='font-semibold'>Max per borrow: </span>
            <span className='text-red-600 font-bold'>{book.borrow_limit || 3}</span>
            <span className='text-gray-500'> {book.borrow_limit === 1 ? 'copy' : 'copies'}</span>
          </div>
        </div>

        {/* Quantity Input */}
        <div className='mb-6'>
          <label className='block text-center font-semibold mb-2'>
            Quantity to borrow:
          </label>
          <div className='flex justify-center'>
            <input
              type='number'
              min='1'
              max={maxBorrowQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), maxBorrowQuantity))}
              className='w-20 text-center px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        {/* Return Date */}
        <div className='mb-4'>
          <label className='block text-center font-semibold mb-2'>
            Expected return Date: 
            <span className='text-red-600 ml-2'>
              {new Date(returnDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
          </label>
        </div>        {/* Late Fee Warning */}
        <div className='text-center text-sm text-gray-500 mb-6'>
          <p>Return this book on or before <span className='text-red-600 font-semibold'>
            {new Date(returnDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </span></p>
          <p>Late return costs <span className='text-red-600 font-semibold'>{lateFeePerDay} pesos</span> per day</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center'>
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex justify-end gap-3'>
          <button
            onClick={onClose}
            disabled={isLoading}
            className='px-6 py-2 bg-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-400 transition-colors disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={handleBorrow}
            disabled={isLoading}
            className='px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2'
          >
            {isLoading ? (
              <>
                <span className='animate-spin'>⏳</span>
                Borrowing...
              </>
            ) : (
              'Borrow'
            )}
          </button>
        </div>
      </div>
    </div>

  )
}

export default BorrowBookModal
