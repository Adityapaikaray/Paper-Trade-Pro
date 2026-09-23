import React, { Component, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends (Component as { new(props: any): any }) {
  props: ErrorBoundaryProps;
  state: State;
  setState: (state: Partial<State> | ((prevState: State) => Partial<State>)) => void;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[320px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-ui-surface border border-ui-border rounded-2xl p-6 text-center shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-xl bg-negative/10 border border-negative/20 text-negative flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-main">
                {this.props.fallbackMessage || 'Module Temporarily Unavailable'}
              </h3>
              <p className="text-xs text-text-muted mt-1.5 leading-relaxed font-mono">
                {this.state.error?.message || 'An unexpected error occurred while rendering this module.'}
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Retry / Reload Module</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
