import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { SessionExpiryMonitor } from '../auth/SessionExpiryMonitor';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Navbar />
      <main>
        {children}
      </main>
      <SessionExpiryMonitor />
    </div>
  );
};

