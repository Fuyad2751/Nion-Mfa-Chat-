import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000/api',
});

// রিকোয়েস্ট ইন্টারসেপ্টর (টোকেন অটো বসাবে)
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('mfaUser'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default API;