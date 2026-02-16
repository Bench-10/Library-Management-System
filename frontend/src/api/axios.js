import axios from 'axios';

// Dynamically determine the API base URL
const getBaseURL = () => {
  const hostname = window.location.hostname;
  
  // If accessing via network IP, use the same IP for API calls
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:3000/api`;
  }
  
  // Default to localhost
  return 'http://192.168.21.244:3000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;