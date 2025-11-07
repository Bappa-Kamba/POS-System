import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  return { user, isAuthenticated, accessToken, refreshToken, isAuthLoading };
};
