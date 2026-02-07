import React from 'react'
import { NavLink } from "react-router-dom";
import { FaBook, FaClipboardList, FaBookOpen, FaBookmark, FaSignOutAlt, FaBookReader, FaExclamationCircle, FaHeart } from 'react-icons/fa';
function Navbar({ logout, userRole }) {
  return (
    <>
      <nav className='fixed p-4 bg-red-500 flex flex-col h-screen w-60 shadow-xl'>
          {/*TITLE */}
          <div className='mb-8 pb-4 border-b border-red-400/30'>
            <div className='flex items-center gap-2 text-white'>
              <FaBookReader className='text-3xl' />
              <h1 className='text-2xl font-bold'>
                Library
              </h1>
            </div>
            <p className='text-red-100 text-xs mt-1 ml-10'>Management System</p>
          </div>

          <div className='flex-1'>
            <ul className='flex flex-col gap-2 text-white text-sm'>
              {userRole === 'staff' ? (
                <>
                  <li className='transform transition-all duration-200'>
                    <NavLink 
                      to="/book_management" 
                      className={({isActive}) => 
                        isActive 
                          ? "flex items-center gap-3 bg-red-800 w-full py-3 px-4 font-semibold rounded-lg shadow-md transition-all duration-300" 
                          : "flex items-center gap-3 w-full py-3 px-3 font-medium rounded-lg hover:bg-red-600 transition-all duration-300"
                      }
                    >
                      <FaBook className='text-lg' />
                      <span>Book Management</span>
                    </NavLink>
                  </li>
                  <li className='transform transition-all duration-200'>
                    <NavLink 
                      to="/borrowing_activities" 
                      className={({isActive}) => 
                        isActive 
                          ? "flex items-center gap-3 bg-red-800 w-full py-3 px-4 font-semibold rounded-lg shadow-md transition-all duration-300" 
                          : "flex items-center gap-3 w-full py-3 px-3 font-medium rounded-lg hover:bg-red-600 transition-all duration-300"
                      }
                    >
                      <FaClipboardList className='text-lg' />
                      <span>Borrowing Activities</span>
                    </NavLink>
                  </li>
                </>
              ) : (
                <>
                  <li className='transform transition-all duration-200'>
                    <NavLink 
                      to="/book_catalog" 
                      className={({isActive}) => 
                        isActive 
                          ? "flex items-center gap-3 bg-red-800 w-full py-3 px-4 font-semibold rounded-lg shadow-md transition-all duration-300" 
                          : "flex items-center gap-3 w-full py-3 px-3 font-medium rounded-lg hover:bg-red-600 transition-all duration-300"
                      }
                    >
                      <FaBookOpen className='text-lg' />
                      <span>Book Catalog</span>
                    </NavLink>
                  </li>                  <li className='transform transition-all duration-200'>
                    <NavLink 
                      to="/borrowed_books" 
                      className={({isActive}) => 
                        isActive 
                          ? "flex items-center gap-3 bg-red-800 w-full py-3 px-4 font-semibold rounded-lg shadow-md transition-all duration-300" 
                          : "flex items-center gap-3 w-full py-3 px-3 font-medium rounded-lg hover:bg-red-600 transition-all duration-300"
                      }
                    >
                      <FaBookmark className='text-lg' />
                      <span>My Borrowed Books</span>
                    </NavLink>
                  </li>
                  <li className='transform transition-all duration-200'>
                    <NavLink 
                      to="/favorites" 
                      className={({isActive}) => 
                        isActive 
                          ? "flex items-center gap-3 bg-red-800 w-full py-3 px-4 font-semibold rounded-lg shadow-md transition-all duration-300" 
                          : "flex items-center gap-3 w-full py-3 px-3 font-medium rounded-lg hover:bg-red-600 transition-all duration-300"
                      }
                    >
                      <FaHeart className='text-lg' />
                      <span>My Favorites</span>
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Logout Button */}
          <div className='mt-auto pt-4 border-t border-red-400/30'>
            <button 
              onClick={logout}
              className='w-full py-3 px-4 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl'
            >
              <FaSignOutAlt className='text-lg' />
              <span>Logout</span>
            </button>
          </div>

      </nav>
    </>
  )
}

export default Navbar