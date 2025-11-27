import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import { halloweenIcon } from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface HalloweenToggleProps {
  className?: string;
}

export const HalloweenToggle = ({ className = "" }: HalloweenToggleProps) => {
  const { isHalloweenMode, toggleHalloweenMode, isDark, setTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const styleId = "halloween-transition-styles";

  const updateStyles = useCallback((css: string) => {
    if (typeof window === "undefined") return;

    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = css;
  }, []);

  const createAnimation = useCallback(() => {
    return `
      ::view-transition-group(root) {
        animation-duration: 0.8s;
        animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        animation-fill-mode: both;
      }

      ::view-transition-new(root) {
        animation-name: reveal-halloween;
        will-change: clip-path;
        backface-visibility: hidden;
        transform: translateZ(0);
      }

      ::view-transition-old(root) {
        animation: none;
        z-index: -1;
        opacity: 1;
      }

      @keyframes reveal-halloween {
        0% {
          clip-path: circle(0% at 100% 0%);
          transform: translateZ(0) scale(1.001);
        }
        100% {
          clip-path: circle(150% at 100% 0%);
          transform: translateZ(0) scale(1);
        }
      }
    `;
  }, []);

  const handleClick = useCallback(() => {
    if (isAnimating) return;

    if (!isDark) {
      // Switch to dark mode and enable Halloween mode
      setTheme("dark");
      setTimeout(() => {
        toggleHalloweenMode();
      }, 100);
    } else {
      setIsAnimating(true);
      const animation = createAnimation();
      updateStyles(animation);

      const switchMode = () => {
        toggleHalloweenMode();
        setTimeout(() => setIsAnimating(false), 50);
      };

      if (!document.startViewTransition) {
        switchMode();
        return;
      }

      document.startViewTransition(switchMode);
    }
  }, [
    isDark,
    isAnimating,
    setTheme,
    toggleHalloweenMode,
    createAnimation,
    updateStyles,
  ]);

  return (
    <motion.button
      type="button"
      className={cn(
        "flex items-center justify-center cursor-pointer rounded-full transition-all duration-200 active:scale-95 border w-7 h-7 will-change-transform",
        isHalloweenMode
          ? "bg-[rgba(249,115,22,0.2)] border-[rgba(249,115,22,0.3)] hover:bg-[rgba(249,115,22,0.3)] hover:scale-105"
          : "bg-[rgba(100,100,100,0.1)] border-[rgba(100,100,100,0.2)] hover:bg-[rgba(100,100,100,0.2)] hover:scale-105",
        isAnimating && "pointer-events-none opacity-80",
        className,
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isAnimating}
      title={
        !isDark
          ? "Switch to Halloween Mode"
          : isHalloweenMode
            ? "Disable Halloween Mode"
            : "Enable Halloween Mode"
      }
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.img
        src={halloweenIcon}
        alt="Halloween"
        className="w-5 h-5"
        animate={{
          filter: isHalloweenMode
            ? [
                "brightness(1) saturate(1)",
                "brightness(1.2) saturate(1.3)",
                "brightness(1) saturate(1)",
              ]
            : isHovered
              ? "brightness(1) saturate(1) opacity(1)"
              : "brightness(0.8) saturate(0.7) opacity(0.85)",
          rotate: isHalloweenMode ? [0, -5, 5, -5, 0] : 0,
        }}
        transition={{
          filter: {
            duration: isHalloweenMode ? 2 : 0.2,
            repeat: isHalloweenMode ? Infinity : 0,
            ease: "easeInOut",
          },
          rotate: {
            duration: 0.5,
            ease: "easeInOut",
          },
        }}
      />
    </motion.button>
  );
};
