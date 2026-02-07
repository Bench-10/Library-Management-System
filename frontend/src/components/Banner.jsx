import React, { useState, useEffect } from 'react';

function Banner() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Get user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        const user = userData.user;
        
        // Set user name (first_name + last_name)
        if (user.first_name && user.last_name) {
          setUserName(`${user.first_name} ${user.last_name}`);
        } else if (user.first_name) {
          setUserName(user.first_name);
        } else {
          setUserName('User');
        }
        
        // Set user role
        setUserRole(userData.role);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUserName('User');
      }
    }

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []);

  // Format time as HH:MM:SS AM/PM
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Format date as Day, Month DD, YYYY
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className='bg-white text-red-600 px-8 py-4 shadow-md'>
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-3'>
          <h2 className='text-2xl font-bold'>
            Welcome, {userName}!
          </h2>
          <span className='text-sm bg-red-500/20 px-3 py-1 rounded-full capitalize'>
            {userRole}
          </span>
        </div>
        
        <div className='text-right'>
          <div className='text-lg font-semibold'>
            {formatTime(currentTime)}
          </div>
          <div className='text-sm opacity-90'>
            {formatDate(currentTime)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banner;
