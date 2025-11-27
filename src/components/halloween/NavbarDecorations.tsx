import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  batGlide,
  spiderCuteHanging,
  spiderSharpHanging,
  webCornerLeft,
} from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";

export const NavbarDecorations = () => {
  const { isHalloweenMode } = useTheme();
  const [showBats, setShowBats] = useState(false);

  useEffect(() => {
    if (isHalloweenMode) {
      const timer = setTimeout(() => {
        setShowBats(true);
      }, 10000);

      return () => clearTimeout(timer);
    } else {
      setShowBats(false);
    }
  }, [isHalloweenMode]);

  if (!isHalloweenMode) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Top-left corner web */}
      <motion.img
        src={webCornerLeft}
        alt=""
        className="absolute top-0 left-0 w-16 md:w-20 opacity-35"
        initial={{ opacity: 0.2, scale: 0.5 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />

      {/* Top-right corner web (flipped) */}
      <motion.img
        src={webCornerLeft}
        alt=""
        className="absolute top-0 right-0 w-16 md:w-20 opacity-35 scale-x-[-1]"
        initial={{ opacity: 0.2, scale: 0.5 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />

      {/* Spider hanging from left web */}
      <motion.img
        src={spiderSharpHanging}
        alt=""
        className="absolute top-10 left-8 w-4 md:w-5 opacity-25"
        initial={{ opacity: 0, y: -10 }}
        animate={{
          opacity: 0.25,
          y: [0, 6, 0],
        }}
        transition={{
          opacity: { duration: 0.6, delay: 0.5 },
          y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Spider hanging from right web */}
      <motion.img
        src={spiderCuteHanging}
        alt=""
        className="absolute top-12 right-10 w-3 md:w-4 opacity-22"
        initial={{ opacity: 0, y: -10 }}
        animate={{
          opacity: 0.22,
          y: [0, 5, 0],
        }}
        transition={{
          opacity: { duration: 0.6, delay: 0.6 },
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Bat hive flying across navbar - Only show after 10 seconds */}
      {showBats && (
        <>
          {/* Bat 1 - Top */}
          <motion.img
            src={batGlide}
            alt=""
            className="absolute w-7 md:w-9 opacity-35"
            style={{ top: "20%" }}
            initial={{ opacity: 0, x: -50 }}
            animate={{
              opacity: [0, 0.35, 0.35, 0],
              x: [-50, window.innerWidth + 50],
              y: [0, -8, 0, 8, 0],
              scaleX: [1, 0.95, 1, 1.05, 1],
              scaleY: [1, 1.05, 1, 0.95, 1],
            }}
            transition={{
              opacity: { duration: 10, times: [0, 0.1, 0.9, 1] },
              x: { duration: 10, ease: "linear" },
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              scaleX: { duration: 0.3, repeat: Infinity, ease: "easeInOut" },
              scaleY: { duration: 0.3, repeat: Infinity, ease: "easeInOut" },
              repeat: Infinity,
              repeatDelay: 20,
            }}
          />

          {/* Bat 2 - Middle */}
          <motion.img
            src={batGlide}
            alt=""
            className="absolute w-8 md:w-10 opacity-30"
            style={{ top: "45%" }}
            initial={{ opacity: 0, x: -50 }}
            animate={{
              opacity: [0, 0.3, 0.3, 0],
              x: [-50, window.innerWidth + 50],
              y: [0, 10, 0, -10, 0],
              scaleX: [1, 0.93, 1, 1.07, 1],
              scaleY: [1, 1.07, 1, 0.93, 1],
            }}
            transition={{
              opacity: { duration: 10, times: [0, 0.1, 0.9, 1], delay: 0.5 },
              x: { duration: 10, ease: "linear", delay: 0.5 },
              y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
              scaleX: { duration: 0.35, repeat: Infinity, ease: "easeInOut" },
              scaleY: { duration: 0.35, repeat: Infinity, ease: "easeInOut" },
              repeat: Infinity,
              repeatDelay: 20,
            }}
          />

          {/* Bat 3 - Bottom */}
          <motion.img
            src={batGlide}
            alt=""
            className="absolute w-6 md:w-8 opacity-28"
            style={{ top: "70%" }}
            initial={{ opacity: 0, x: -50 }}
            animate={{
              opacity: [0, 0.28, 0.28, 0],
              x: [-50, window.innerWidth + 50],
              y: [0, -6, 0, 6, 0],
              scaleX: [1, 0.97, 1, 1.03, 1],
              scaleY: [1, 1.03, 1, 0.97, 1],
            }}
            transition={{
              opacity: { duration: 10, times: [0, 0.1, 0.9, 1], delay: 1 },
              x: { duration: 10, ease: "linear", delay: 1 },
              y: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
              scaleX: { duration: 0.28, repeat: Infinity, ease: "easeInOut" },
              scaleY: { duration: 0.28, repeat: Infinity, ease: "easeInOut" },
              repeat: Infinity,
              repeatDelay: 20,
            }}
          />
        </>
      )}
    </div>
  );
};
