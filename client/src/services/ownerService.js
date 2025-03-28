import axios from 'axios';

const API_URL = '/api/owners';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add token to Authorization header
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Owner service methods
const ownerService = {
  // Register new landowner
  registerOwner: async (ownerData) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/register`, ownerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all landowners
  getAllOwners: async () => {
    try {
      const response = await axiosInstance.get(API_URL);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get owner profile
  getProfile: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/profile`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update owner profile
  updateProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/profile`, profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a landowner
  deleteOwner: async (ownerId) => {
    try {
      const response = await axiosInstance.delete(`${API_URL}/${ownerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default ownerService;