"use client";

import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; message: string };

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || 'Something went wrong' };
  }

  componentDidCatch(error: Error) {
    console.error('UI ErrorBoundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center p-6">
          <div className="max-w-md text-center space-y-3">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">{this.state.message}</p>
            <button className="border rounded px-3 py-2" onClick={() => location.reload()}>
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
