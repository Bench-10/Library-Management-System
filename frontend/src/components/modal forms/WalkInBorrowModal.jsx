import React, { useState } from 'react';
import api from '../../api/axios';
import { sanitizeInput } from '../../utils/sanitizeInput';

function WalkInBorrowModal({ isOpen, onClose, book, onBorrowSuccess }) {
  const [customerData, setCustomerData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: ''
  });  const [copiesToBorrow, setCopiesToBorrow] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !book) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Sanitize the input value before setting state
    const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;
    setCustomerData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  const handleClose = () => {
    setCustomerData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: ''
    })
    setCopiesToBorrow(1);
    setError('');
    onClose();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');    // Validation
    if (!customerData.firstName.trim() || !customerData.lastName.trim() || !customerData.phone.trim()) {
      setError('First name, last name, and phone number are required.');
      setIsLoading(false);
      return;
    }

    // Enhanced phone validation with country code support
    const cleanedPhone = customerData.phone.replace(/[\s\-\(\)]/g, '');
    
    // Check if it contains only valid characters
    if (!/^[\d\s\-\+\(\)]+$/.test(customerData.phone)) {
      setError('Phone number contains invalid characters.');
      setIsLoading(false);
      return;
    }
    
    // Validate phone format
    let isValidPhone = false;
    
    // Philippine format with country code (+63 or 0063)
    if (/^(\+63|0063)/.test(cleanedPhone)) {
      isValidPhone = /^(\+63|0063)9\d{9}$/.test(cleanedPhone);
    } 
    // Philippine format without country code (09...)
    else if (/^09/.test(cleanedPhone)) {
      isValidPhone = /^09\d{9}$/.test(cleanedPhone);
    }
    // International format (must start with + and have at least 10 digits)
    else if (/^\+/.test(cleanedPhone)) {
      isValidPhone = /^\+\d{10,15}$/.test(cleanedPhone);
    }
    
    if (!isValidPhone) {
      setError('Please enter a valid phone number. Example: +639123456789, 09123456789, or +1234567890');
      setIsLoading(false);
      return;
    }

    if (copiesToBorrow < 1 || copiesToBorrow > book.available_copies) {
      setError(`Please enter a valid number of copies (1-${book.available_copies}).`);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/walk-in-borrow', {
        bookId: book.book_id,
        customerData,
        copiesToBorrow
      });

      console.log('Walk-in borrowing successful:', response.data);
        // Reset form
      setCustomerData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: ''
      });
      setCopiesToBorrow(1);
      
      if (onBorrowSuccess) {
        onBorrowSuccess(response.data.loanId, book.title);
      }
      
      onClose();
    } catch (error) {
      console.error('Error processing walk-in borrowing:', error);
      setError(error.response?.data?.message || 'Failed to process loan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      handleClose();
    }
  };  return (
    <div 
      className='fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50'
      onClick={handleBackdropClick}
    >
      <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='mb-6 text-center border-b pb-4'>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>Process Walk-in Loan</h2>
          <div className='text-sm text-gray-600'>
            <p className='font-semibold'>{book.title}</p>
            <p>by {book.author}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Customer Information */}
          <div>
            <h3 className='text-lg font-semibold text-gray-700 mb-3'>Customer Information</h3>
            
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label htmlFor='firstName' className='block text-sm font-medium text-gray-700 mb-1'>
                  First Name *
                </label>
                <input
                  type='text'
                  id='firstName'
                  name='firstName'
                  value={customerData.firstName}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              
              <div>
                <label htmlFor='lastName' className='block text-sm font-medium text-gray-700 mb-1'>
                  Last Name *
                </label>
                <input
                  type='text'
                  id='lastName'
                  name='lastName'
                  value={customerData.lastName}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
            </div>
            
            <div className='mt-3'>
              <label htmlFor='phone' className='block text-sm font-medium text-gray-700 mb-1'>
                Phone Number *
              </label>
              <input
                type='tel'
                id='phone'
                name='phone'
                value={customerData.phone}
                onChange={handleInputChange}
                className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
            
            <div className='mt-3'>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
                Email (optional)
              </label>
              <input
                type='email'
                id='email'
                name='email'
                value={customerData.email}
                onChange={handleInputChange}
                className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            
            <div className='mt-3'>
              <label htmlFor='address' className='block text-sm font-medium text-gray-700 mb-1'>
                Address (optional)
              </label>
              <textarea
                id='address'
                name='address'
                value={customerData.address}
                onChange={handleInputChange}
                rows='2'
                className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>

          {/* Loan Information */}
          <div>
            <h3 className='text-lg font-semibold text-gray-700 mb-3'>Loan Information</h3>
            
            <div>
              <label htmlFor='copiesToBorrow' className='block text-sm font-medium text-gray-700 mb-1'>
                Number of Copies
              </label>
              <div className='flex items-center gap-3'>
                <input
                  type='number'
                  id='copiesToBorrow'
                  min='1'
                  max={book.available_copies}
                  value={copiesToBorrow}
                  onChange={(e) => setCopiesToBorrow(parseInt(e.target.value) || 1)}
                  className='w-20 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <span className='text-sm text-gray-600'>
                  (Available: {book.available_copies})
                </span>
              </div>
            </div>

            <div className='mt-3 text-sm text-gray-600 bg-blue-50 p-3 rounded'>
              <p><strong>Return Date:</strong> {new Date(Date.now() + parseInt(book.return_days) * 24 * 60 * 60 * 1000).toDateString()}</p>
              <p className='text-xs mt-1'>Standard {book.return_days}-day loan period</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className='p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm'>
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex justify-end gap-3 pt-4 border-t'>
            <button
              type='button'
              onClick={handleClose}
              disabled={isLoading}
              className='px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            >
              {isLoading ? (
                <>
                  <span className='animate-spin'>⏳</span>
                  Processing...
                </>
              ) : (
                'Process Loan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WalkInBorrowModal;
