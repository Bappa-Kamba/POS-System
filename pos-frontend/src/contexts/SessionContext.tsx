import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';

const SESSION_STORAGE_KEY_PREFIX = 'activeSession_';

interface Session {
  id: string;
  name: string;
  status: 'OPEN' | 'CLOSED';
  startTime: string;
  endTime?: string;
  openingBalance: number;
  openedBy: {
    firstName: string | null;
    lastName: string | null;
    username: string;
  };
}

interface SessionContextType {
  activeSession: Session | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const logout = useAuthStore((state) => state.logout);
  const isUpdatingRef = React.useRef(false);
  
  // Generate user-specific storage key
  const getStorageKey = useCallback(() => {
    return user?.id ? `${SESSION_STORAGE_KEY_PREFIX}${user.id}` : null;
  }, [user?.id]);

  const updateSessionStorage = useCallback((session: Session | null) => {
    const storageKey = getStorageKey();
    if (!storageKey) return;
    
    isUpdatingRef.current = true;
    if (session) {
      localStorage.setItem(storageKey, JSON.stringify({
        sessionId: session.id,
        userId: user?.id,
        timestamp: Date.now(),
      }));
    } else {
      localStorage.removeItem(storageKey);
    }
    // Reset flag after a short delay to allow storage event to process
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 100);
  }, [user?.id, getStorageKey]);

  const refreshSession = useCallback(async () => {
    if (!user) {
      setActiveSession(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get<{ data: Session }>('/sessions/active');
      const session = response.data.data;
      setActiveSession(session);
      updateSessionStorage(session);
    } catch (error) {
      // If 404 or other error, assume no active session
      setActiveSession(null);
      // Only clear localStorage if we're sure there's no session
      // Don't clear on initial load or network errors
      const storageKey = getStorageKey();
      if (storageKey) {
        const storedSession = localStorage.getItem(storageKey);
        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession);
            // Only clear if this is actually our user's session
            if (parsed.userId === user?.id) {
              updateSessionStorage(null);
            }
          } catch {
            // Invalid JSON, clear it
            updateSessionStorage(null);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, updateSessionStorage, getStorageKey]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) return;
    
    const handleStorageChange = (e: StorageEvent) => {
      // Ignore storage events triggered by this tab
      if (isUpdatingRef.current) {
        return;
      }

      // Only react to this user's session key
      if (e.key === storageKey) {
        if (!e.newValue) {
          // Session was closed in another tab → logout this tab
          console.log('Session closed in another tab, logging out...');
          logout();
        } else {
          // Session was created/updated in another tab → refresh
          console.log('Session updated in another tab, refreshing...');
          refreshSession();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [logout, refreshSession, getStorageKey]);

  // Initial session fetch
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  return (
    <SessionContext.Provider value={{ activeSession, isLoading, refreshSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
