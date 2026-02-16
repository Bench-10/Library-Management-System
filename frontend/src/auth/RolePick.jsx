import React from 'react'
import { FaUser} from "react-icons/fa";  
import { FaUserGear } from "react-icons/fa6";

function RolePick({ handleRoleSelection }) {
  
  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-gray-100'>
      <div className='w-full max-w-2xl mx-4'>
        {/* Header */}
        <h1 className='text-center text-5xl font-bold mb-16 text-gray-600'>
          Welcome to the <span className='text-red-500'>Library</span>
        </h1>

        {/* Main Card */}
        <div className='bg-red-500 rounded-3xl p-12 shadow-xl'>
          <div className='grid grid-cols-2 gap-8'>
            
            {/* Customer Section */}
            <div className='flex flex-col items-center text-white'>
              {/* Customer Icon */}
              <div className='mb-8'>
                <FaUser className='text-9xl' />
              </div>
              
              <button
                onClick={() => handleRoleSelection('customer')}
                className='bg-white text-red-500 px-12 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg mb-4'
              >
                Customer
              </button>
            </div>

            {/* Staff Section */}
            <div className='flex flex-col items-center text-white'>
              {/* Staff Icon */}
              <div className='mb-8'>
                <FaUserGear className='text-9xl' />
              </div>
              
              <button
                onClick={() => handleRoleSelection('staff')}
                className='bg-white text-red-500 px-16 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg'
              >
                Staff
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default RolePick
