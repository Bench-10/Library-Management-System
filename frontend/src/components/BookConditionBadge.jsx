import React from 'react';

function BookConditionBadge({ condition }) {
  // Return placeholder if no condition
  if (!condition) {
    return <span className='text-gray-400'>--</span>;
  }

  // Define styles for each condition
  const getConditionStyle = () => {
    switch (condition) {
      case 'Excellent':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Good':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Fair':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Poor':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Damaged':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getConditionStyle()}`}>
      {condition}
    </span>
  );
}

export default BookConditionBadge;
