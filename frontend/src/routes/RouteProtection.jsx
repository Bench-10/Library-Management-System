import React from 'react'
import { Navigate } from 'react-router-dom'

function RouteProtection({ children, allowedRole }) {
  
  const storedUserData = localStorage.getItem('userData');
  const isLoggedIn = localStorage.getItem('isLoggedIn');


  if (!storedUserData || isLoggedIn !== 'true') {
    return <Navigate to="/" replace />;
  }

  try {
    const userData = JSON.parse(storedUserData);
    
    if (allowedRole && userData.role !== allowedRole) {

      if (userData.role === 'staff') {
        return <Navigate to="/book_management" replace />;
      } else {
        return <Navigate to="/book_catalog" replace />;
      }
    }

    return children;
    
  } catch (error) {
    console.error('Error parsing user data:', error);
    return <Navigate to="/" replace />;
  }
}

export default RouteProtection