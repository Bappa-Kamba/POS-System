import { create } from "zustand";
import { authService } from "../services/auth.service";
import type { AuthTokens, LoginPayload } from "../types/auth";
import type { AuthUser } from "../types/user";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  checkAuthStatus: () => Promise<void>;
  setSession: (payload: LoginPayload) => void;
  clearSession: () => void;
  refreshTokens: () => Promise<AuthTokens | null>;
  logout: () => Promise<void>;
}

let refreshPromise: Promise<AuthTokens | null> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isAuthLoading: true,

  setSession: ({ user, tokens }: LoginPayload) => {
    set({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: true,
    });
  },

  checkAuthStatus: async () => {
    console.log("Checking auth status");
    // 1. Check if tokens exist in local storage (if you persist them)
    // 2. OR attempt a token refresh immediately
    const { refreshToken, clearSession } = get();
    console.log("refresh token", refreshToken);

    if (!refreshToken) {
      set({ isAuthLoading: false });
      console.log("IsAuthLoading", get().isAuthLoading);
      return;
    }

    // Attempt refresh to validate existing tokens
    try {
      await get().refreshTokens();
    } catch (error) {
      clearSession();
    } finally {
      set({ isAuthLoading: false });
    }
  },

  clearSession: () => {
    refreshPromise = null;
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  refreshTokens: async () => {
    const { refreshToken } = get();

    if (!refreshToken) {
      get().clearSession();
      return null;
    }

    if (!refreshPromise) {
      refreshPromise = authService
        .refresh({ refreshToken })
        .then((tokens) => {
          set({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
          });
          refreshPromise = null;
          return tokens;
        })
        .catch((error) => {
          refreshPromise = null;
          get().clearSession();
          throw error;
        });
    }

    return refreshPromise;
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Swallow network errors to ensure client state clears
    } finally {
      get().clearSession();
    }
  },
}));
