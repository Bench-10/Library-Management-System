import React from 'react';

function CannotDeleteBookModal({ isOpen, onClose, bookTitle, borrowerNames, activeLoans }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 overflow-y-auto h-full w-full z-50 animate-fadeIn">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white animate-slideUp">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-red-600">Cannot Delete Book</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="mb-6">

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium mb-2">
              This book cannot be deleted because it is currently borrowed by:
            </p>
            
            <ul className="list-disc list-inside text-red-700 space-y-1">
              {borrowerNames && borrowerNames.length > 0 ? (
                borrowerNames.map((name, index) => (
                  <li key={index} className="text-sm">{name}</li>
                ))
              ) : (
                <li className="text-sm">{activeLoans} customer(s)</li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}

export default CannotDeleteBookModal;
