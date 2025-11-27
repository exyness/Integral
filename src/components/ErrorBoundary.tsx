import { AlertTriangle } from "lucide-react";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { GlassCard } from "./GlassCard";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <GlassCard className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-400" />
            <h2 className="text-xl font-semibold text-white">
              Something went wrong
            </h2>
            <p className="text-[#B4B4B8] max-w-md">
              An unexpected error occurred. Please refresh the page or try again
              later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)] rounded-lg text-[#10B981] hover:bg-[rgba(16,185,129,0.3)] transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </GlassCard>
      );
    }

    return this.props.children;
  }
}
