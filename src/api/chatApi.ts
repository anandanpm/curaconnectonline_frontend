import axios from 'axios';

export const chatApi = axios.create({
  baseURL: 'http://localhost:3000/chat',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});