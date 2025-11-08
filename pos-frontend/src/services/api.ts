import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

interface RetriableAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  withCredentials: false,
});

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

export { api };

