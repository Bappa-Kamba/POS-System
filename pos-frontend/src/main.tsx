import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ErrorBoundary } from './router/ErrorBoundary';
import { useThemeStore } from './store/themeStore';
import { SessionProvider } from './contexts/SessionContext';

const queryClient = new QueryClient();

// Initialize theme on app load
const ThemeInitializer = () => {
  useEffect(() => {
    // Initialize theme from store on mount
    const { isDarkMode } = useThemeStore.getState();
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Subscribe to theme changes
    const unsubscribe = useThemeStore.subscribe((state) => {
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });

    return unsubscribe;
  }, []);

  return null;
};

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SessionProvider>
          <ErrorBoundary>
            <ThemeInitializer />
            <App />
          </ErrorBoundary>
        </SessionProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);

