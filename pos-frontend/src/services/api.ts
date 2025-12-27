import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { resolveBackend } from './backendResolver';

interface RetriableAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}


export let api = axios.create({
  baseURL: '/api/v1',
  withCredentials: false,
});

export async function initApi() {
  try {
    const base = await resolveBackend();
    api.defaults.baseURL = base;
    localStorage.setItem('pos_backend', base);
    toast.success(`POS backend resolved: ${base}`);
  } catch (e) {
    console.error(e);
    toast.error('Unable to reach POS server on this network.');
  }
}

api.interceptors.request.use((config) => {
  const state = useAuthStore.getState();
  if (state.accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${state.accessToken}`;
  }
  return config;
});





api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableAxiosRequestConfig | undefined;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle generic errors (excluding 401 which is handled by refresh logic, and 403 license)
    // We also avoid toasting if the request explicitly asks to skip it (we can add a config for that later if needed)
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      if (status === 403 && data?.errorCode === 'LICENSE_EXPIRED') {
        window.location.href = '/unlock';
        toast.error('License expired');
        return Promise.reject(error);
      }

      if (status !== 401 && status !== 404) {
         // Toast server errors or bad requests
         const message = data?.message || data?.error?.message || 'An unexpected error occurred';
         toast.error(message);
      }
      
      // Optionally toast 404s if needed, or leave it to specific handlers
      // For now, we leave 404 to be handled by the caller (like BarcodeScanner)
    } else if (error.request) {
        // Network error
        toast.error('Network error. Please check your connection.');
    } else {
        toast.error(error.message || 'An unexpected error occurred');
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const authState = useAuthStore.getState();

      try {
        const tokens = await authState.refreshTokens();
        if (!tokens) {
          return Promise.reject(error);
        }

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        authState.clearSession();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

