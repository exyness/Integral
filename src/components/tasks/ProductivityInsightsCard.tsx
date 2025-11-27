/** biome-ignore-all lint/correctness/useExhaustiveDependencies: false positive */
import { motion } from "framer-motion";
import { Brain, Lightbulb, Skull, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ghostScare, skullStaring } from "@/assets";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/contexts/ThemeContext";
import { useSpookyAI } from "@/hooks/useSpookyAI";
import { Task } from "@/types/task";

interface ProductivityInsightsCardProps {
  deadTasks: Task[];
  onResurrectClick: () => void;
}

export const ProductivityInsightsCard: React.FC<
  ProductivityInsightsCardProps
> = ({ deadTasks, onResurrectClick }) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { consultSpirits, isGhostWriting } = useSpookyAI();
  const [tip, setTip] = useState<string>("");

  useEffect(() => {
    const fetchTip = async () => {
      const prompt = isHalloweenMode
        ? "Give me a short, spooky productivity tip for a necromancer managing tasks."
        : "Give me a short, motivating productivity tip.";

      const result = await consultSpirits(prompt, "general");
      if (result) {
        setTip(result);
      }
    };

    fetchTip();
  }, [isHalloweenMode]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <GlassCard
      className={`relative overflow-hidden h-full flex flex-col ${
        isHalloweenMode
          ? "border-[rgba(96,201,182,0.2)] shadow-[0_0_15px_rgba(96,201,182,0.1)]"
          : ""
      }`}
    >
      {isHalloweenMode && (
        <img
          src={ghostScare}
          alt=""
          className="absolute -top-4 -right-4 w-16 opacity-10 pointer-events-none rotate-12"
        />
      )}

      <div className="p-4 md:p-6 flex-1 flex flex-col relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3
            className={`text-base md:text-lg font-semibold flex items-center space-x-2 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            <span>Productivity Insights</span>
          </h3>
          {isHalloweenMode && (
            <Sparkles className="w-4 h-4 text-[#F59E0B] animate-pulse" />
          )}
        </div>

        <div className="flex-1 space-y-4">
          {/* Zombie Task Stat */}
          <div
            className={`p-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 ${
              isHalloweenMode
                ? "bg-[#60c9b6]/10 border-[#60c9b6]/20"
                : isDark
                  ? "bg-gray-800/50 border-gray-700"
                  : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div
                className={`p-2 rounded-lg ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/20 text-[#60c9b6]"
                    : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {isHalloweenMode ? (
                  <img src={skullStaring} alt="" className="w-5 h-5" />
                ) : (
                  <Skull className="w-5 h-5" />
                )}
              </div>
              <div>
                <p
                  className={`text-xs font-medium ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Stagnant Tasks
                </p>
                <p
                  className={`text-lg font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {deadTasks.length}
                </p>
              </div>
            </div>
            <motion.button
              onClick={onResurrectClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-center ${
                isHalloweenMode
                  ? "bg-[#F59E0B]/20 text-[#F59E0B] hover:bg-[#F59E0B]/30"
                  : "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
              }`}
            >
              View Graveyard
            </motion.button>
          </div>

          {/* AI Tip */}
          <div className="relative">
            <div
              className={`absolute top-0 left-0 w-1 h-full rounded-full ${
                isHalloweenMode ? "bg-[#F59E0B]" : "bg-[#8B5CF6]"
              }`}
            />
            <div className="pl-3 py-1">
              <p
                className={`text-xs font-medium mb-1 flex items-center gap-1 ${
                  isHalloweenMode ? "text-[#F59E0B]" : "text-[#8B5CF6]"
                }`}
              >
                <Lightbulb className="w-3 h-3" />
                {isHalloweenMode ? "Spooky Tip" : "Daily Tip"}
              </p>
              <p
                className={`text-sm italic ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {isGhostWriting ? (
                  <span className="animate-pulse">
                    Consulting the spirits...
                  </span>
                ) : (
                  tip || "Stay focused and conquer your tasks!"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
