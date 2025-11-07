// src/router/ErrorBoundary.tsx

import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  // This lifecycle method is called if an error is thrown
  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render shows the fallback UI.
    return { hasError: true };
  }

  // This lifecycle method is called when an error is caught
  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error('Uncaught error in component:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-6">
          <h1 className="text-3xl font-bold text-red-700 mb-4">
            Application Error 💔
          </h1>
          <p className="text-lg text-neutral-600 mb-8">
            Something went wrong. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Refresh
          </button>
          <p className='mt-8 text-sm text-neutral-400'>
             Check the console for full error details.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
