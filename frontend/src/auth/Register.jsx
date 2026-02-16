import api from '../api/axios';
import { React, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import { sanitizeInput } from '../utils/sanitizeInput';

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Last name validation  
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 5) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }    // Phone validation (required)
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const cleanedPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
      
      // Check if it contains only valid characters (digits, +, spaces, hyphens, parentheses)
      if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
        newErrors.phone = 'Phone number contains invalid characters';
      } 
      // Check for Philippine format with country code (+63 or 0063)
      else if (/^(\+63|0063)/.test(cleanedPhone)) {
        // +639123456789 or 00639123456789 (country code + 10 digits)
        if (!/^(\+63|0063)9\d{9}$/.test(cleanedPhone)) {
          newErrors.phone = 'Please enter a valid Philippine number. Example: +639123456789 or 09123456789';
        }
      }
      // Check for Philippine format without country code (09...)
      else if (/^09/.test(cleanedPhone)) {
        // 09123456789 (11 digits starting with 09)
        if (!/^09\d{9}$/.test(cleanedPhone)) {
          newErrors.phone = 'Please enter a valid Philippine number. Example: 09123456789';
        }
      }
      // Check for international format (must start with + and have at least 10 digits)
      else if (/^\+/.test(cleanedPhone)) {
        // +[country code][number] - minimum 10 digits total
        if (!/^\+\d{10,15}$/.test(cleanedPhone)) {
          newErrors.phone = 'Please enter a valid international number. Example: +1234567890';
        }
      }
      // Invalid format
      else {
        newErrors.phone = 'Please enter a valid phone number. Example: +639123456789, 09123456789, or +1234567890';
      }
    }

    return newErrors;
  }

  const handleInputChange = (field, value) => {
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Sanitize text inputs (not phone numbers)
    const sanitizedValue = (field === 'phone' || field === 'password' || field === 'confirmPassword') 
      ? value 
      : (typeof value === 'string' ? sanitizeInput(value) : value);
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }    setIsLoading(true);
    setErrors({});

    try {
      const result = await api.post('/user/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null
      });

      if (result.status === 200 || result.status === 201) {
        console.log('Registration successful:', result.data);
        
        navigate('/login');
      } else {
        setErrors({ form: 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response) {
        if (error.response.status === 409) {
          setErrors({ email: 'Email address is already registered. Please use a different email or try logging in.' });
        } else {
          setErrors({ form: error.response.data?.message || 'Registration failed. Please try again.' });
        }
      } else if (error.request) {
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
      <div className='flex flex-col min-h-screen w-full items-center justify-center bg-gray-100'>
        <div className='w-full max-w-md mx-4'>
          <div className='flex items-center justify-between mb-12'>
            <button 
              onClick={() => navigate('/')}
              className='text-gray-500 hover:text-gray-700 flex items-center text-sm'
            >
              <div className='flex justify-center align-middle '>
                <MdOutlineArrowBackIosNew className='font-bold text-red-500'/> 
                Back to Role Selection
              </div> 
            </button>
          </div>
          <h1 className='text-center text-4xl font-bold mb-12 text-gray-600'>
            Create <span className='text-red-500'>Customer</span> Account
          </h1>
        </div>

        <div className='bg-white rounded-3xl p-12 shadow-xl w-full max-w-md'>
          {errors.form && (
            <div className='mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md'>
              <p className='text-red-700 text-sm font-medium'>{errors.form}</p>
            </div>
          )}
          
          <form className='space-y-4' onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label htmlFor='firstName' className='block text-sm font-medium text-red-500 mb-2'>
                  First Name *
                </label>
                <input 
                  id='firstName' 
                  name='firstName' 
                  type='text' 
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`mt-1 block w-full rounded-md border p-3 focus:outline-none focus:ring-2 transition-colors ${
                    errors.firstName 
                      ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 focus:ring-red-500'
                  }`}
                  placeholder='First name'
                />
                {errors.firstName && (
                  <p className='mt-2 text-red-600 text-sm flex items-center'>
                    *{errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor='lastName' className='block text-sm font-medium text-red-500 mb-2'>
                  Last Name *
                </label>
                <input 
                  id='lastName' 
                  name='lastName' 
                  type='text' 
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`mt-1 block w-full rounded-md border p-3 focus:outline-none focus:ring-2 transition-colors ${
                    errors.lastName 
                      ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 focus:ring-red-500'
                  }`}
                  placeholder='Last name'
                />
                {errors.lastName && (
                  <p className='mt-2 text-red-600 text-sm flex items-center'>
                    *{errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor='email' className='block text-sm font-medium text-red-500 mb-2'>
                Email *
              </label>
              <input 
                id='email' 
                name='email' 
                type='email' 
                value={formData.email}
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
                  *{errors.email}
                </p>
              )}
            </div>
            
            {/* Password Fields */}
            <div className='grid grid-cols-1 gap-4'>
              <div>
                <label htmlFor='password' className='block text-sm font-medium text-red-500 mb-2'>
                  Password *
                </label>
                <input 
                  id='password' 
                  name='password' 
                  type='password' 
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`mt-1 block w-full rounded-md border p-3 focus:outline-none focus:ring-2 transition-colors ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 focus:ring-red-500'
                  }`}
                  placeholder='Enter password'
                />
                {errors.password && (
                  <p className='mt-2 text-red-600 text-sm flex items-center'>
                    *{errors.password}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor='confirmPassword' className='block text-sm font-medium text-red-500 mb-2'>
                  Confirm Password *
                </label>
                <input 
                  id='confirmPassword' 
                  name='confirmPassword' 
                  type='password' 
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`mt-1 block w-full rounded-md border p-3 focus:outline-none focus:ring-2 transition-colors ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 focus:ring-red-500'
                  }`}
                  placeholder='Confirm password'
                />
                {errors.confirmPassword && (
                  <p className='mt-2 text-red-600 text-sm flex items-center'>
                    *{errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor='phone' className='block text-sm font-medium text-red-500 mb-2'>
                Phone *
              </label>
              <input 
                id='phone' 
                name='phone' 
                type='tel' 
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`mt-1 block w-full rounded-md border p-3 focus:outline-none focus:ring-2 transition-colors ${
                  errors.phone 
                    ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                    : 'border-gray-300 focus:ring-red-500'
                }`}
                placeholder='Phone number'
              />
              {errors.phone && (
                <p className='mt-2 text-red-600 text-sm flex items-center'>
                  *{errors.phone}
                </p>
              )}
            </div>

            {/* Optional Fields */}
            <div>
              <label htmlFor='address' className='block text-sm font-medium text-gray-600 mb-2'>
                Address (Optional)
              </label>
              <textarea 
                id='address' 
                name='address' 
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className='mt-1 block w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors'
                placeholder='Your address'
                rows='2'
              />
            </div>
            
            <div className='pt-4'>
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
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className='text-center pt-4'>
              <p className='text-sm text-gray-600'>
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  state={{ role: 'customer' }}
                  className='text-red-500 hover:text-red-600 font-medium'
                >
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
