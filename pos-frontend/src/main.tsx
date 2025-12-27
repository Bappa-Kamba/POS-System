import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import { ErrorBoundary } from './router/ErrorBoundary';
import { useThemeStore } from './store/themeStore';
import { SessionProvider } from './contexts/SessionContext';
import { RefreshProvider } from './contexts/RefreshContext';
import { initApi } from './services/api';

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

async function init() {
  await initApi();

  ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <RefreshProvider>
            <SessionProvider>
              <ErrorBoundary>
                <ThemeInitializer />
                <Toaster position="top-right" />
                <App />
              </ErrorBoundary>
            </SessionProvider>
          </RefreshProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>,
  );
}

init()
