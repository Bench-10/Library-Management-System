import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

function DeleteBookModal({ isOpen, onClose, onConfirm, bookTitle, isDeleting }) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  return (
    <div 
      className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn'
      onClick={handleBackdropClick}
    >
      <div 
        className='bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 animate-slideUp'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className=' text-black px-6 py-4 rounded-t-lg flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <h2 className='text-xl font-bold'>Delete Book</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className='text-white hover:text-gray-200 transition-colors disabled:opacity-50'
            aria-label='Close'
          >
            <FaTimes className='text-xl' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          <p className='text-gray-700 text-lg mb-4'>
            Are you sure you want to delete this book?
          </p>
          
          <div className='bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4'>
            <p className='text-sm text-gray-600 mb-1'>Book Title:</p>
            <p className='text-lg font-semibold text-gray-900'>{bookTitle}</p>
          </div>          
        </div>

        {/* Footer */}
        <div className='bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3'>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className='px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className='px-5 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2'
          >
            {isDeleting ? (
              <>
                <span className='animate-spin'>⏳</span>
                Deleting...
              </>
            ) : (
              'Delete Book'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteBookModal;
