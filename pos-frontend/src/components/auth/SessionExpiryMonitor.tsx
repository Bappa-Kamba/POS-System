import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { ReLoginModal } from './ReLoginModal';

// Helper to decode JWT without external library
const getJwtExp = (token: string): number | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload).exp;
  } catch (e) {
    return null;
  }
};

export const SessionExpiryMonitor = () => {
  const logout = useAuthStore((state) => state.logout);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const user = useAuthStore((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Track notifications to avoid spamming
  const hasWarnedRef = useRef(false);
  
  useEffect(() => {
    if (!refreshToken || !user) return;

    const checkExpiry = () => {
      const exp = getJwtExp(refreshToken);
      if (!exp) return;

      const now = Date.now() / 1000;
      const timeLeft = exp - now;

      // Thresholds in seconds
      const WARNING_THRESHOLD = 300; // 5 minutes
      const CRITICAL_THRESHOLD = 60; // 1 minute

      if (timeLeft <= 0) {
        // Explicitly logout if expired to prevent limbo state
        if (isModalOpen) setIsModalOpen(false);
        logout();
        return;
      }

      // Critical: Open Modal (if not already open)
      if (timeLeft < CRITICAL_THRESHOLD) {
        if (!isModalOpen) {
           setIsModalOpen(true);
        }
      } 
      // Warning: Show Toast (once)
      else if (timeLeft < WARNING_THRESHOLD) {
        if (!hasWarnedRef.current) {
          toast('Session expiring in 5 minutes', {
            icon: '⚠️',
            duration: 5000,
          });
          hasWarnedRef.current = true;
        }
      } else {
        // Reset warning flag if we have plenty of time (e.g. after refresh)
        hasWarnedRef.current = false;
         if (isModalOpen) {
           setIsModalOpen(false);
         }
      }
    };

    // Check immediately
    checkExpiry();

    // Check every 10 seconds
    const interval = setInterval(checkExpiry, 10000);

    return () => clearInterval(interval);
  }, [refreshToken, user, isModalOpen, logout]);

  // If refreshToken changes (e.g. re-login success), reset everything
  useEffect(() => {
    setIsModalOpen(false);
    hasWarnedRef.current = false;
  }, [refreshToken]);

  if (!user) return null;

  return (
    <ReLoginModal
      isOpen={isModalOpen}
      onClose={() => {
        // Optional: Maybe don't allow closing if critical? 
        // For now allowing dismiss, but it will pop up again next interval if still critical
        setIsModalOpen(false);
      }}
      onSuccess={() => {
        setIsModalOpen(false);
        hasWarnedRef.current = false;
      }}
    />
  );
};
