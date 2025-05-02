import axios from 'axios';

export const chatApi = axios.create({
  baseURL: import.meta.env.VITE_CHAT_API_URL||'http://localhost:3000/chat',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});