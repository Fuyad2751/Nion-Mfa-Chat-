import axios from 'axios';

const API = axios.create({
  baseURL: 'https://mfa-chat-backend.onrender.com/api',  // ✅ লাইভ URL
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