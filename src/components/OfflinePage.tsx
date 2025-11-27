import { WifiOff } from "lucide-react";
import React from "react";
import { GlassCard } from "./GlassCard";

export const OfflinePage: React.FC = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6">
      <GlassCard variant="primary" className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-full flex items-center justify-center">
            <WifiOff className="w-10 h-10 text-[#8B5CF6]" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold darK:text-white mb-3">
          You're Offline
        </h1>

        <p className="text-[#B4B4B8] mb-8 leading-relaxed">
          It looks like you've lost your internet connection. Some features may
          not be available until you're back online.
        </p>

        <button
          onClick={handleRetry}
          className="w-full bg-[#8B5CF6] text-white py-3 px-6 rounded-lg hover:bg-[#7C3AED] transition-colors font-medium"
        >
          Try Again
        </button>
      </GlassCard>
    </div>
  );
};
