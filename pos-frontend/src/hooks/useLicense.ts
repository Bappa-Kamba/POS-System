import { useAuthStore } from '../store/authStore';

/**
 * Hook to check the license status and determine if the system is in read-only mode.
 * Use this hook to disable form submissions and buttons when the license is expired.
 */
export const useLicense = () => {
  const license = useAuthStore((state) => state.license);

  const isReadOnly = license?.status === 'EXPIRED';
  const isTrial = license?.status === 'TRIAL';
  const isActive = license?.status === 'ACTIVE';

  const daysRemaining = license?.trialExpiresAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(license.trialExpiresAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  return {
    license,
    isReadOnly,
    isTrial,
    isActive,
    daysRemaining,
    /**
     * Helper to get a tooltip message when an action is blocked
     */
    readOnlyMessage: 'This action is unavailable in read-only mode. Please activate your license.',
  };
};
