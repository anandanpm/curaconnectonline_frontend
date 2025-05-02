
import axios from 'axios';
import Cookies from 'js-cookie';
import { store } from '../redux/store';
import { logoutDoctor } from '../redux/doctorSlice';
import {logoutUser} from '../redux/userSlice'
import { logoutAdmin } from '../redux/adminSlice';

const userApi = axios.create({
  baseURL: import.meta.env.VITE_USER_API_URL,
  withCredentials: true,
  headers:{
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

const doctorApi = axios.create({
  baseURL: import.meta.env.VITE_DOCTOR_API_URL,
  withCredentials: true,
  headers:{
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_URL,
  withCredentials: true,
  headers:{
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});


let isRefreshing = false;
let refreshFailed = false;


const redirectToLogin = (apiType: 'user' | 'doctor' | 'admin', isBlocked = false) => {
  refreshFailed = false;
  isRefreshing = false;
  

  localStorage.setItem('redirectUrl', window.location.pathname);
  
  
  if (isBlocked) {
    localStorage.setItem('accountBlocked', 'true');
  } else {
    localStorage.removeItem('accountBlocked');
  }
  
  switch (apiType) {
    case 'doctor':
      window.location.href = '/doctor/login';
      break;
    case 'admin':
      window.location.href = '/admin';
      break;
    case 'user':
    default:
      window.location.href = '/login';
      break;
  }
};


const shouldSkipRefresh = (url: string) => {
  return url.includes('/login') || url.includes('/refresh-token');
};

userApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

  
    if (error.response?.status === 403) {
      console.error("Access denied: User account may be blocked");
      store.dispatch(logoutUser())
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      return Promise.reject(error);
    }

    if (shouldSkipRefresh(originalRequest.url) || originalRequest._retry || refreshFailed) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      originalRequest._retry = true;

   
      if (isRefreshing) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return userApi(originalRequest);
        } catch (retryError) {
          return Promise.reject(retryError);
        }
      }

      isRefreshing = true;

      try {

        await userApi.post('/refresh-token');
        isRefreshing = false;
        return userApi(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh user token:", refreshError);
        isRefreshing = false;
        refreshFailed = true;
        
        if (axios.isAxiosError(refreshError) && refreshError.response?.status === 403) {
          store.dispatch(logoutUser())
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          redirectToLogin('user');
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


doctorApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403) {
      console.error("Access denied: Doctor account may be blocked");
 
      store.dispatch(logoutDoctor());
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      return Promise.reject(error);
    }

  
    if (shouldSkipRefresh(originalRequest.url) || originalRequest._retry || refreshFailed) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      originalRequest._retry = true;

  
      if (isRefreshing) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return doctorApi(originalRequest);
        } catch (retryError) {
          return Promise.reject(retryError);
        }
      }

      isRefreshing = true;

      try {

        await doctorApi.post('/refresh-token');
        isRefreshing = false;
        return doctorApi(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh doctor token:", refreshError);
        isRefreshing = false;
        refreshFailed = true;
        

        if (axios.isAxiosError(refreshError) && refreshError.response?.status === 403) {
          store.dispatch(logoutDoctor());
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;


    if (error.response?.status === 403) {
      console.error("Access denied: Admin account may be blocked");
      store.dispatch(logoutAdmin())
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      return Promise.reject(error);
    }

    if (shouldSkipRefresh(originalRequest.url) || originalRequest._retry || refreshFailed) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      originalRequest._retry = true;

      if (isRefreshing) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return adminApi(originalRequest);
        } catch (retryError) {
          return Promise.reject(retryError);
        }
      }

      isRefreshing = true;

      try {
    
        await adminApi.post('/refresh-token');
        isRefreshing = false;
        return adminApi(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh admin token:", refreshError);
        isRefreshing = false;
        refreshFailed = true;
        

        if (axios.isAxiosError(refreshError) && refreshError.response?.status === 403) {
          store.dispatch(logoutAdmin());
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


const resetFlags = () => {
  if (
    window.location.pathname === '/login' || 
    window.location.pathname === '/doctor/login' ||
    window.location.pathname === '/admin'
  ) {
    isRefreshing = false;
    refreshFailed = false;
  }
};


window.addEventListener('popstate', resetFlags);

export const checkBlockedAccount = () => {
  const isBlocked = localStorage.getItem('accountBlocked') === 'true';
  if (isBlocked) {
  
    return true;
  }
  return false;
};


export const clearBlockedFlag = () => {
  localStorage.removeItem('accountBlocked');
};

export { userApi, doctorApi, adminApi };