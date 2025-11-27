import { motion } from "framer-motion";
import ghostDroopy from "@/assets/ghosts/ghost-droopy-standing.svg";
import pumpkinScary from "@/assets/pumpkin/pumpkin-scary.svg";
import spiderCute from "@/assets/spider/spider-cute-hanging.svg";
import { useTheme } from "@/contexts/ThemeContext";

export const DashboardDecorations = () => {
  const { isHalloweenMode } = useTheme();

  if (!isHalloweenMode) return null;

  return (
    <>
      {/* Top-left floating pumpkin */}
      <motion.img
        src={pumpkinScary}
        alt=""
        className="fixed top-24 left-4 w-8 md:w-10 opacity-20 pointer-events-none z-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: [0.15, 0.25, 0.15],
          y: [0, -10, 0],
          rotate: [-5, 5, -5],
        }}
        transition={{
          opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Top-right floating ghost */}
      <motion.img
        src={ghostDroopy}
        alt=""
        className="fixed top-32 right-8 w-7 md:w-9 opacity-15 pointer-events-none z-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: [0.12, 0.2, 0.12],
          y: [0, -12, 0],
          x: [0, 8, 0, -8, 0],
        }}
        transition={{
          opacity: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Bottom-left spider */}
      <motion.img
        src={spiderCute}
        alt=""
        className="fixed bottom-20 left-12 w-5 md:w-6 opacity-18 pointer-events-none z-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{
          opacity: 0.18,
          y: [0, 8, 0],
        }}
        transition={{
          opacity: { duration: 0.6, delay: 0.3 },
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Bottom-right small pumpkin */}
      <motion.img
        src={pumpkinScary}
        alt=""
        className="fixed bottom-32 right-16 w-6 md:w-7 opacity-16 pointer-events-none z-0"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: [0.14, 0.2, 0.14],
          scale: [0.95, 1.05, 0.95],
          rotate: [0, 10, 0, -10, 0],
        }}
        transition={{
          opacity: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
      />
    </>
  );
};
