import React from "react";
import { Navbar } from "@/components/Navbar";
import { OfflinePage } from "@/components/OfflinePage";
import { useTheme } from "@/contexts/ThemeContext";
import { useNetwork } from "@/hooks/useNetwork";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { isOnline } = useNetwork();

  if (!isOnline) {
    return <OfflinePage />;
  }

  return (
    <div
      className={`halloween-bg-container min-h-screen w-full transition-colors duration-300 ${
        isDark
          ? isHalloweenMode
            ? "bg-transparent text-white"
            : "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      } flex flex-col`}
    >
      <main className="px-2 sm:px-4 md:px-6 lg:px-10 mt-2 sm:mt-4 flex-1 w-full relative z-10">
        <Navbar />
        <div className="p-2 sm:p-4 md:p-6 h-full w-full">{children}</div>
      </main>
    </div>
  );
};
