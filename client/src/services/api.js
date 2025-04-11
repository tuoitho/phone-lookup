import axios from 'axios';

// Sử dụng biến môi trường cho API URL nếu có, mặc định là URL local
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Dùng đường dẫn tương đối để tận dụng Nginx proxy
const API_URL = '/api';  // Loại bỏ VITE_API_URL và localhost mặc định
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const searchPhones = async (query) => {
  try {
    const response = await api.get(`/phones?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching phones:', error);
    throw error;
  }
};

export const getPhoneDetails = async (id) => {
  try {
    const response = await api.get(`/phones/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting phone details:', error);
    throw error;
  }
};

export const addPhone = async (phoneData) => {
  try {
    const response = await api.post('/phones', phoneData);
    return response.data;
  } catch (error) {
    console.error('Error adding phone:', error);
    throw error;
  }
};

export const addReview = async (phoneId, reviewData) => {
  try {
    const response = await api.post(`/phones/${phoneId}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export const checkServerHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking server health:', error);
    throw error;
  }
};

export default {
  searchPhones,
  getPhoneDetails,
  addPhone,
  addReview,
  checkServerHealth,
};
