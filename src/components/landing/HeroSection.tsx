import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { batSwoop, ghostScare } from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";
import LiquidEther from "../LiquidEther";

interface HeroSectionProps {
  isDark: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ isDark }) => {
  const navigate = useNavigate();
  const { isHalloweenMode } = useTheme();

  const liquidColors = isHalloweenMode
    ? ["#2DD4BF", "#14B8A6", "#0F766E"] // Brighter Teal/Cyan for better visibility
    : isDark
      ? ["#A855F7", "#D946EF", "#8B5CF6"] // More visible Purple/Fuchsia/Violet for Dark Mode
      : ["#F472B6", "#9333EA", "#6366F1"]; // Pink/Purple/Indigo for Light Mode

  return (
    <section className="relative pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Liquid Ether Background */}
      <div className="absolute inset-0 opacity-60">
        <LiquidEther
          colors={liquidColors}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      {/* Halloween Decorations */}
      {isHalloweenMode && (
        <>
          <motion.img
            src={batSwoop}
            alt=""
            className="absolute top-20 right-[10%] w-24 opacity-60 pointer-events-none z-0"
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              rotate: [0, 5, 0],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.img
            src={ghostScare}
            alt=""
            className="absolute bottom-20 left-[10%] w-32 opacity-20 pointer-events-none z-0"
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      <div className="max-w-7xl mx-auto relative z-10 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6"
          >
            <div
              className={`px-3 py-1.5 rounded-full border ${
                isHalloweenMode
                  ? "bg-[#60c9b6]/10 border-[#60c9b6]/30"
                  : isDark
                    ? "bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.3)]"
                    : "bg-purple-50 border-purple-200"
              }`}
            >
              <span
                className={`text-xs font-medium flex items-center gap-1.5 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-[#A855F7]"
                      : "text-purple-600"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isHalloweenMode
                  ? "Spooky Season is Here!"
                  : "AI-Powered Productivity Platform"}
              </span>
            </div>
          </motion.div>
          <h1
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-2 ${
              isHalloweenMode
                ? "font-creepster tracking-wider text-[#F59E0B] drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            {isHalloweenMode ? "Haunt Your Habits" : "Organize Your Life with AI"}
          </h1>
          <p
            className={`text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4 max-w-3xl mx-auto leading-relaxed px-4 ${
              isHalloweenMode
                ? "text-gray-300"
                : isDark
                  ? "text-[#B4B4B8]"
                  : "text-gray-600"
            }`}
          >
            {isHalloweenMode
              ? "Manage zombie tasks, track phantom expenses, and brew the perfect budget—all in one haunted platform."
              : "Manage tasks, track time, journal your progress, control your budget, and organize notes—all in one beautiful, integrated platform."}
          </p>
          <p
            className={`text-xs sm:text-sm md:text-base mb-8 sm:mb-10 font-medium ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-[#8B5CF6]"
                  : "text-purple-600"
            }`}
          >
            {isHalloweenMode
              ? "Don't let your productivity die..."
              : "Integral part of your life"}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pointer-events-auto px-4">
            <motion.button
              onClick={() => navigate("/auth")}
              className={`w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center space-x-2 border ${
                isHalloweenMode
                  ? "bg-[#60c9b6]/20 border-[#60c9b6]/30 text-[#60c9b6] hover:bg-[#60c9b6]/30 hover:shadow-[0_0_15px_rgba(96,201,182,0.25)]"
                  : isDark
                    ? "bg-[rgba(139,92,246,0.2)] border-[rgba(139,92,246,0.3)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.3)]"
                    : "bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.3)] text-purple-600 hover:bg-[rgba(139,92,246,0.2)]"
              }`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>
                {isHalloweenMode ? "Enter if You Dare" : "Start Free Today"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
