import axios from 'axios';
import { React, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdOutlineArrowBackIosNew } from "react-icons/md";


function Login({ currentLoginRole, clearRole, setUserRole }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    return newErrors;
  }

  const handleInputChange = (field, value) => {
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    if (field === 'email') {
      setEmail(value);
    } else if (field === 'password') {
      setPassword(value);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});    try {
      const result = await axios.post('http://localhost:3000/api/user/login', { 
        email, 
        password, 
        role: currentLoginRole?.toLowerCase() 
      });        if (result.status === 200) {
        console.log('Login successful:', result.data);
        
        // Store authentication data
        const userData = {
          user: result.data.data,
          role: currentLoginRole.toLowerCase(),
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        setUserRole(userData.role); // Set role in App state
        
        // Navigate based on role
        if (userData.role === 'staff') {
          navigate('/book_management');
        } else {
          navigate('/book_catalog');
        }
      } else {
        setErrors({ form: 'Invalid credentials. Please try again.' });
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          setErrors({ form: 'Invalid email/username or password. Please check your credentials.' });
        } else {
          setErrors({ form: error.response.data?.message || 'Server error occurred.' });
        }
      } else if (error.request) {
        // Network error
        setErrors({ form: 'Cannot connect to server. Please check if the backend is running.' });
      } else {
        setErrors({ form: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className='flex min-h-screen w-full'>
        <div className=' flex flex-col min-h-screen w-full  items-center justify-center bg-gray-100'>            <div className='w-full max-w-md mx-4'>
                <div className='flex items-center justify-between mb-12'>
                    <button 
                        onClick={() => {
                            if (clearRole) clearRole();
                            navigate('/');
                        }}
                        className='text-gray-500 hover:text-gray-700 flex items-center text-sm'
                    >
                        <div className='flex justify-center align-middle '><MdOutlineArrowBackIosNew className='font-bold text-red-500'/> Back to Role Selection</div> 
                    </button>
                </div>
                <h1 className='text-center text-4xl font-bold mb-12 text-gray-600'>
                    Login as <span className='text-red-500'>{currentLoginRole}</span>
                </h1>
            </div><div className='bg-white rounded-3xl p-12 shadow-xl w-full max-w-md'>
                {errors.form && (
                  <div className='mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md'>
                    <p className='text-red-700 text-sm font-medium'>{errors.form}</p>
                  </div>
                )}
                
                <form className='space-y-6' onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor='email' className='block text-sm font-medium text-red-500 mb-2'>
                            Email
                        </label>
                        <input 
                            id='email' 
                            name='email' 
                            type='email' 
                            value={email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`mt-1 block w-full rounded-md border p-3 focus:outline-none focus:ring-2 transition-colors ${
                                errors.email 
                                    ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                                    : 'border-gray-300 focus:ring-red-500'
                            }`}
                            placeholder='Enter your email'
                        />
                        {errors.email && (
                            <p className='mt-2 text-red-600 text-sm flex items-center'>
                                <span className='mr-1'>⚠️</span>
                                {errors.email}
                            </p>
                        )}
                    </div>
                    
                    <div>
                        <label htmlFor='password' className='block text-sm font-medium text-red-500 mb-2'>
                            Password
                        </label>
                        <input 
                            id='password' 
                            name='password' 
                            type='password' 
                            value={password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className={`mt-1 block w-full rounded-md border p-3 focus:outline-none focus:ring-2 transition-colors ${
                                errors.password 
                                    ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                                    : 'border-gray-300 focus:ring-red-500'
                            }`}
                            placeholder='Enter your password'
                        />
                        {errors.password && (
                            <p className='mt-2 text-red-600 text-sm flex items-center'>
                                <span className='mr-1'>⚠️</span>
                                {errors.password}
                            </p>
                        )}
                    </div>
                    
                    <div>
                        <button 
                            type='submit' 
                            disabled={isLoading}
                            className={`w-full px-4 py-3 rounded-full font-bold text-lg transition-all duration-200 shadow-lg ${
                                isLoading 
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                    : 'bg-red-500 text-white hover:bg-red-600 hover:shadow-xl'
                            }`}
                        >
                            {isLoading ? (
                                <span className='flex items-center justify-center'>
                                    <svg className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                    </svg>
                                    Logging in...
                                </span>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </div>                
                  </form>
            </div>

        </div>
    </div>
  )
}

export default Login