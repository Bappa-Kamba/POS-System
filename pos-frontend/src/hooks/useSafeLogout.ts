import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useSession } from "../contexts/SessionContext";
import { toast } from "react-hot-toast";

interface LogoutOptions {
  onLogoutComplete?: () => void;
  onCancelled?: () => void;
}

/**
 * Hook that provides a safe logout experience
 * If there's an active session, shows SessionEndModal to end session
 * before logging out, ensuring complete audit trail
 */
export const useSafeLogout = (options: LogoutOptions = {}) => {
  const { onLogoutComplete, onCancelled } = options;
  const logout = useAuthStore((state) => state.logout);
  const { activeSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showSessionEndModal, setShowSessionEndModal] = useState(false);

  const completeLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      toast.success("Logged out successfully");
      onLogoutComplete?.();
    } catch (error: any) {
      toast.error("Logout failed");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSafeLogout = async () => {
    // If there's an active session, show SessionEndModal
    if (activeSession?.status === "OPEN") {
      setShowSessionEndModal(true);
      return;
    }

    // No active session, proceed with logout
    await completeLogout();
  };

  const handleSessionEndComplete = async () => {
    // Session has been ended, now proceed with logout
    setShowSessionEndModal(false);
    await completeLogout();
  };

  const handleCancel = () => {
    setShowSessionEndModal(false);
    onCancelled?.();
  };

  return {
    handleSafeLogout,
    handleSessionEndComplete,
    handleCancel,
    isLoading,
    showSessionEndModal,
    setShowSessionEndModal,
    activeSession,
  };
};
