import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

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

  const refreshSession = async () => {
    if (!user) {
      setActiveSession(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get<{ data: Session }>('/sessions/active');
      setActiveSession(response.data.data);
    } catch (error) {
      // If 404 or other error, assume no active session
      setActiveSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, [user]);

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
