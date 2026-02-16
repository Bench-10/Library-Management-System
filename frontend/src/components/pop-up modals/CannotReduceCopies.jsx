import React from 'react'

function CannotReduceCopies({ isOpen, onClose }) {
  return (
    <div>
        {isOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg p-6 w-80 text-center">
                    <h2 className="text-xl font-bold mb-4">Cannot Reduce Copies</h2>
                    <p className="mb-6">You cannot reduce the number of total copies below the number of books that is currently borrowed.</p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        )}
    </div>
  )
}

export default CannotReduceCopies
