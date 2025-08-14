import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_APP_URL || '';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Create a separate instance for frontend API routes (no baseURL)
const frontendAxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Create a separate instance for file uploads (no default Content-Type)
const uploadAxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

export default axiosInstance;
export { frontendAxiosInstance, uploadAxiosInstance }; 