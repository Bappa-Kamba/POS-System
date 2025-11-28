import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useSession } from "../contexts/SessionContext";
import { api } from "../services/api";
import { toast } from "react-hot-toast";

interface LogoutOptions {
  onLogoutComplete?: () => void;
  onCancelled?: () => void;
}

/**
 * Hook that provides a safe logout experience
 * If there's an active session, prompts user to provide closing balance
 * before logging out, ensuring complete audit trail
 */
export const useSafeLogout = (options: LogoutOptions = {}) => {
  const { onLogoutComplete, onCancelled } = options;
  const logout = useAuthStore((state) => state.logout);
  const { activeSession, refreshSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [closingBalance, setClosingBalance] = useState<string>("");
  const [showClosingModal, setShowClosingModal] = useState(false);

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
    // If there's an active session, require closing balance
    if (activeSession?.status === "OPEN") {
      setShowClosingModal(true);
      return;
    }

    // No active session, proceed with logout
    await completeLogout();
  };

  const handleConfirmClosingBalance = async () => {
    if (!activeSession) {
      toast.error("No active session found");
      return;
    }

    if (!closingBalance) {
      toast.error("Please enter the closing balance");
      return;
    }

    setIsLoading(true);
    try {
      // End the session with closing balance
      await api.post(`/sessions/${activeSession.id}/end`, {
        closingBalance: parseFloat(closingBalance) || 0,
      });

      toast.success("Session ended successfully");
      setShowClosingModal(false);
      setClosingBalance("");

      // Refresh session data to clear it
      await refreshSession();

      // Now proceed with logout
      await completeLogout();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to end session");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowClosingModal(false);
    setClosingBalance("");
    onCancelled?.();
  };

  return {
    handleSafeLogout,
    handleConfirmClosingBalance,
    handleCancel,
    isLoading,
    closingBalance,
    setClosingBalance,
    showClosingModal,
    activeSession,
  };
};
