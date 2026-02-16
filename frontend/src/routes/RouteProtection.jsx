import React from 'react'
import { Navigate } from 'react-router-dom'

function RouteProtection({ children, allowedRole, requireAdmin = false }) {
  
  const storedUserData = localStorage.getItem('userData');
  const isLoggedIn = localStorage.getItem('isLoggedIn');


  if (!storedUserData || isLoggedIn !== 'true') {
    return <Navigate to="/" replace />;
  }

  try {
    const userData = JSON.parse(storedUserData);
    
    // Check role access
    if (allowedRole && userData.role !== allowedRole) {
      if (userData.role === 'staff') {
        // Redirect to appropriate staff page based on admin status
        if (userData.user?.is_admin) {
          return <Navigate to="/dashboard" replace />;
        } else {
          return <Navigate to="/walk_in_borrowing" replace />;
        }
      } else {
        return <Navigate to="/book_catalog" replace />;
      }
    }

    // Check admin requirement for staff users
    if (requireAdmin && userData.role === 'staff' && !userData.user?.is_admin) {
      return <Navigate to="/walk_in_borrowing" replace />;
    }

    return children;
    
  } catch (error) {
    console.error('Error parsing user data:', error);
    return <Navigate to="/" replace />;
  }
}

export default RouteProtection
