import React, { useEffect, useState } from "react";
import { Toaster as Sonner } from "sonner";
import {
  batSwoop,
  ghostScare,
  pumpkinScary,
  spiderSharpHanging,
} from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";
import "./toast.css";

type ToasterProps = React.ComponentProps<typeof Sonner>;

// Spooky Halloween Icons using actual assets
const SpookyIcons = {
  success: (
    <img
      src={ghostScare}
      alt="Success"
      className="w-5 h-5 object-contain"
      style={{ filter: "brightness(1.2)" }}
    />
  ),
  error: (
    <img
      src={spiderSharpHanging}
      alt="Error"
      className="w-5 h-5 object-contain"
      style={{ filter: "hue-rotate(320deg) saturate(1.5)" }}
    />
  ),
  warning: (
    <img src={pumpkinScary} alt="Warning" className="w-5 h-5 object-contain" />
  ),
  info: (
    <img
      src={batSwoop}
      alt="Info"
      className="w-5 h-5 object-contain"
      style={{ filter: "brightness(1.1)" }}
    />
  ),
};

const Toaster = ({ ...props }: ToasterProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const { isHalloweenMode } = useTheme();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <Sonner
      theme="system"
      className="toaster group"
      position={isMobile ? "top-center" : "bottom-right"}
      icons={isHalloweenMode ? SpookyIcons : undefined}
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-white dark:bg-[rgba(20,20,25,0.7)] border border-purple-600 text-black dark:text-white shadow-lg rounded-md backdrop-blur-md",
          description: "text-gray-600 dark:text-gray-300",
          actionButton:
            "bg-purple-600 hover:bg-purple-700 text-white border-0 rounded font-medium transition-colors duration-200",
          cancelButton:
            "bg-gray-200 dark:bg-[rgba(255,255,255,0.1)] hover:bg-gray-300 dark:hover:bg-[rgba(255,255,255,0.15)] text-gray-700 dark:text-gray-300 border-0 rounded font-medium transition-colors duration-200",
          success:
            "!border-[#8B5CF6] bg-white! dark:bg-[rgba(20,20,25,0.7)]! text-black! dark:text-white!",
          error:
            "!border-[#EF4444] bg-white! dark:bg-[rgba(20,20,25,0.7)]! text-black! dark:text-white!",
          warning:
            "!border-[#F59E0B] bg-white! dark:bg-[rgba(20,20,25,0.7)]! text-black! dark:text-white!",
          info: "!border-[#3B82F6] bg-white! dark:bg-[rgba(20,20,25,0.7)]! text-black! dark:text-white!",
          icon: "shrink-0",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
