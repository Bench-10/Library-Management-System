import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

function SuccessModal({ isOpen, onClose, title = 'Success!', message }) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 animate-slideUp">
        {/* Header */}        
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <FaCheckCircle className="text-lg text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 text-sm">{message}</p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessModal;
