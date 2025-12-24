import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/auth.service";
import type { AuthTokens, LoginPayload } from "../types/auth";
import type { AuthUser } from "../types/user";
import type { LicenseStatus } from "../services/license.service";
import { licenseService } from "../services/license.service";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  license: LicenseStatus | null;
  checkAuthStatus: () => Promise<void>;
  setSession: (payload: LoginPayload) => void;
  clearSession: () => void;
  refreshTokens: () => Promise<AuthTokens | null>;
  logout: () => Promise<void>;
}

let refreshPromise: Promise<AuthTokens | null> | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      license: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isAuthLoading: true,

      setSession: ({ user, tokens, license }: LoginPayload) => {
        set({
          user,
          license,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        });
      },

      checkAuthStatus: async () => {
        console.log("Checking auth status");
        const { refreshToken, accessToken, clearSession } = get();

        if (!refreshToken) {
          set({ isAuthLoading: false });
          return;
        }

        // If we have an access token, try to validate it first by fetching user data
        if (accessToken) {
          try {
            const [user, license] = await Promise.all([
              authService.me(),
              licenseService.getStatus()
            ]);
            set({ user, license, isAuthenticated: true, isAuthLoading: false });
            return; // Access token is still valid
          } catch (error) {
            console.log("Access token invalid, attempting refresh...");
            // Access token is invalid, proceed to refresh
          }
        }

        // Attempt to refresh tokens to validate session
        try {
          const tokens = await get().refreshTokens();
          if (tokens) {
            // If refresh succeeds, also fetch user data to ensure it's up to date
            try {
              const [user, license] = await Promise.all([
              authService.me(),
              licenseService.getStatus()
            ]);
              set({ user, license, isAuthenticated: true });
            } catch (error) {
              console.error("Failed to fetch user data:", error);
              // Continue anyway, user data might be in state
            }
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
          clearSession();
        } finally {
          set({ isAuthLoading: false });
        }
      },

      clearSession: () => {
        refreshPromise = null;
        set({
          user: null,
          license: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        // Clear localStorage
        localStorage.removeItem("auth-storage");
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
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        license: state.license,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
