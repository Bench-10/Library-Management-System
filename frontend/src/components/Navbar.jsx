import React, { useState } from 'react'
import { NavLink } from "react-router-dom";
import { FaBook, FaClipboardList, FaBookOpen, FaBookmark, FaSignOutAlt, FaBookReader, FaExclamationCircle, FaHeart, FaUserPlus, FaTachometerAlt, FaUsers } from 'react-icons/fa';
function Navbar({ logout, userRole, isAdmin }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };
  return (
    <>
      <nav className='fixed p-4 bg-red-800 flex flex-col h-screen w-60 shadow-xl'>
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
                  {/* Admin Dashboard - Only for Admin users */}
                  {isAdmin && (
                    <li className='transform transition-all duration-200'>
                      <NavLink 
                        to="/dashboard" 
                        className={({isActive}) => 
                          isActive 
                            ? "flex items-center gap-3 bg-red-500 w-full py-3 px-4 font-semibold rounded-lg shadow-md transition-all duration-300" 
                            : "flex items-center gap-3 w-full py-3 px-3 font-medium rounded-lg hover:bg-red-500 transition-all duration-300"
                        }
                      >
                        <FaTachometerAlt className='text-lg' />
                        <span>Dashboard</span>
                      </NavLink>
                    </li>
                  )}
                    {/* Book Management - Only for Admin users */}
                  {isAdmin && (
                    <li className='transform transition-all duration-200'>
                      <NavLink 
                        to="/book_management" 
                        className={({isActive}) => 
                          isActive 
                            ? "flex items-center gap-3 bg-red-500 w-full py-3 px-4 font-semibold rounded-lg shadow-md transition-all duration-300" 
                            : "flex items-center gap-3 w-full py-3 px-3 font-medium rounded-lg hover:bg-red-500 transition-all duration-300"
                        }
                      >
                        <FaBook className='text-lg' />
                        <span>Book Management</span>
                      </NavLink>
                    </li>
                  )}

                  {/* User Management - Only for Admin users */}
                  {isAdmin && (
                    <li className='transform transition-all duration-200'>
                      <NavLink 
                        to="/user_management" 
                        className={({isActive}) => 
                          isActive 
                            ? "flex items-center gap-3 bg-red-500 w-full py-3 px-4 font-semibold rounded-lg shadow-md transition-all duration-300" 
                            : "flex items-center gap-3 w-full py-3 px-3 font-medium rounded-lg hover:bg-red-500 transition-all duration-300"
                        }
                      >
                        <FaUsers className='text-lg' />
                        <span>User Management</span>
                      </NavLink>
                    </li>
                  )}
                  
                  {/* Walk-in Borrowing - For both Admin and Staff */}
                  <li className='transform transition-all duration-200'>
                    <NavLink 
                      to="/walk_in_borrowing" 
                      className={({isActive}) => 
                        isActive 
                          ? "flex items-center gap-3 bg-red-500 w-full py-3 px-4 font-semibold rounded-lg shadow-md transition-all duration-300" 
                          : "flex items-center gap-3 w-full py-3 px-3 font-medium rounded-lg hover:bg-red-500 transition-all duration-300"
                      }
                    >
                      <FaUserPlus className='text-lg' />
                      <span>Walk-in Borrowing</span>
                    </NavLink>
                  </li>
                  
                  {/* Borrowing Activities - For both Admin and Staff */}
                  <li className='transform transition-all duration-200'>
                    <NavLink 
                      to="/borrowing_activities" 
                      className={({isActive}) => 
                        isActive 
                          ? "flex items-center gap-3 bg-red-500 w-full py-3 px-4 font-semibold rounded-lg shadow-md transition-all duration-300" 
                          : "flex items-center gap-3 w-full py-3 px-3 font-medium rounded-lg hover:bg-red-500 transition-all duration-300"
                      }
                    >
                      <FaClipboardList className='text-lg' />
                      <span>Borrowing Activities</span>
                    </NavLink>
                  </li>
                </>
              ) : (
                <>
                  {/* Customer Navigation */}
                  <li className='transform transition-all duration-200'>
                    <NavLink 
                      to="/book_catalog" 
                      className={({isActive}) => 
                        isActive 
                          ? "flex items-center gap-3 bg-red-500 w-full py-3 px-4 font-semibold rounded-lg shadow-md transition-all duration-300" 
                          : "flex items-center gap-3 w-full py-3 px-3 font-medium rounded-lg hover:bg-red-500 transition-all duration-300"
                      }
                    >
                      <FaBookOpen className='text-lg' />
                      <span>Book Catalog</span>
                    </NavLink>
                  </li>
                  
                  <li className='transform transition-all duration-200'>
                    <NavLink 
                      to="/borrowed_books" 
                      className={({isActive}) => 
                        isActive 
                          ? "flex items-center gap-3 bg-red-500 w-full py-3 px-4 font-semibold rounded-lg shadow-md transition-all duration-300" 
                          : "flex items-center gap-3 w-full py-3 px-3 font-medium rounded-lg hover:bg-red-500 transition-all duration-300"
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
                          ? "flex items-center gap-3 bg-red-500 w-full py-3 px-4 font-semibold rounded-lg shadow-md transition-all duration-300" 
                          : "flex items-center gap-3 w-full py-3 px-3 font-medium rounded-lg hover:bg-red-500 transition-all duration-300"
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
              onClick={handleLogoutClick}
              className='w-full py-3 px-4 bg-red-500 text-white font-semibold rounded-lg active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl'
            >
              <FaSignOutAlt className='text-lg' />
              <span>Logout</span>
            </button>
          </div>

      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className='fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl'>
            <div className='text-center'>
              <div className='mb-4'>
                <FaSignOutAlt className='text-red-500 text-4xl mx-auto mb-3' />
                <h2 className='text-xl font-bold text-gray-800 mb-2'>Confirm Logout</h2>
                <p className='text-gray-600'>Are you sure you want to log out?</p>
              </div>

              <div className='flex gap-3 justify-center'>
                <button
                  onClick={handleCancelLogout}
                  className='px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold'
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className='px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold'
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
