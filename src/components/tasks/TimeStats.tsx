import { motion } from "framer-motion";
import { BarChart3, Calendar, Clock, Timer } from "lucide-react";
import React from "react";
import {
  batGlide,
  candleFive,
  catCrouch,
  ghostGenie,
  ghostJagged,
  pumpkinWitchhat,
  spiderHairyCrawling,
  treeMonstergrin,
  witchTakeoff,
} from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";
import { formatDurationCompact } from "@/lib/timeUtils";

interface TimeStatsProps {
  todayTime: number;
  activeTimersCount: number;
  weekTime: number;
  filteredTime: number;
}

export const TimeStats: React.FC<TimeStatsProps> = ({
  todayTime,
  activeTimersCount,
  weekTime,
  filteredTime,
}) => {
  const { isDark, isHalloweenMode } = useTheme();

  const statCards = [
    {
      title: "Today",
      value: formatDurationCompact(todayTime),
      icon: Clock,
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#10B981]",
      bgColor: isHalloweenMode
        ? "bg-[rgba(96,201,182,0.15)]"
        : isDark
          ? "bg-[rgba(16,185,129,0.1)]"
          : "bg-[rgba(16,185,129,0.05)]",
      borderColor: isHalloweenMode
        ? "border-[rgba(96,201,182,0.3)]"
        : "border-[rgba(16,185,129,0.2)]",
    },
    {
      title: "Active Timers",
      value: activeTimersCount.toString(),
      icon: Timer,
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]",
      bgColor: isHalloweenMode
        ? "bg-[rgba(96,201,182,0.15)]"
        : isDark
          ? "bg-[rgba(139,92,246,0.1)]"
          : "bg-[rgba(139,92,246,0.05)]",
      borderColor: isHalloweenMode
        ? "border-[rgba(96,201,182,0.3)]"
        : "border-[rgba(139,92,246,0.2)]",
    },
    {
      title: "This Week",
      value: formatDurationCompact(weekTime),
      icon: Calendar,
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#3B82F6]",
      bgColor: isHalloweenMode
        ? "bg-[rgba(96,201,182,0.15)]"
        : isDark
          ? "bg-[rgba(59,130,246,0.1)]"
          : "bg-[rgba(59,130,246,0.05)]",
      borderColor: isHalloweenMode
        ? "border-[rgba(96,201,182,0.3)]"
        : "border-[rgba(59,130,246,0.2)]",
    },
    {
      title: "Filtered",
      value: formatDurationCompact(filteredTime),
      icon: BarChart3,
      color: isHalloweenMode ? "text-[#60c9b6]" : "text-[#F59E0B]",
      bgColor: isHalloweenMode
        ? "bg-[rgba(96,201,182,0.15)]"
        : isDark
          ? "bg-[rgba(245,158,11,0.1)]"
          : "bg-[rgba(245,158,11,0.05)]",
      borderColor: isHalloweenMode
        ? "border-[rgba(96,201,182,0.3)]"
        : "border-[rgba(245,158,11,0.2)]",
    },
  ];

  const halloweenIcons = [pumpkinWitchhat, ghostGenie, catCrouch, candleFive];

  const cardDecorations = [
    spiderHairyCrawling,
    batGlide,
    ghostJagged,
    treeMonstergrin,
  ];

  const [hoveredCard, setHoveredCard] = React.useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 relative">
      {isHalloweenMode && (
        <>
          <img
            src={batGlide}
            alt=""
            className="absolute -top-8 -left-4 w-16 md:w-20 opacity-20 pointer-events-none z-0 animate-pulse"
            style={{ transform: "scaleX(-1)" }}
          />
          <img
            src={witchTakeoff}
            alt=""
            className="absolute -top-10 right-10 w-20 md:w-24 opacity-15 pointer-events-none z-0"
          />
        </>
      )}
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          onMouseEnter={() => setHoveredCard(index)}
          onMouseLeave={() => setHoveredCard(null)}
          className={`relative overflow-hidden p-3 md:p-6 rounded-xl ${stat.bgColor} border ${stat.borderColor} ${
            isHalloweenMode ? "shadow-[0_0_10px_rgba(96,201,182,0.2)]" : ""
          }`}
        >
          {isHalloweenMode && (
            <img
              src={cardDecorations[index]}
              alt=""
              className="absolute top-1 right-1 w-5 md:w-6 opacity-15 pointer-events-none"
            />
          )}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex-1">
              <p
                className={`text-[10px] md:text-xs font-medium ${stat.color} mb-0.5 md:mb-1`}
              >
                {stat.title}
              </p>
              <p className={`text-base md:text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
            <div
              className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl ${
                isHalloweenMode
                  ? "bg-[rgba(96,201,182,0.1)]"
                  : isDark
                    ? stat.bgColor.replace("0.05", "0.1")
                    : stat.bgColor.replace("0.05", "0.2") // Fallback for light mode if needed, though logic above handles it
              } flex items-center justify-center`}
            >
              {isHalloweenMode ? (
                <motion.img
                  src={halloweenIcons[index]}
                  alt=""
                  className="w-5 h-5 md:w-8 md:h-8 object-contain"
                  animate={
                    hoveredCard === index
                      ? {
                          scale: [1, 1.2, 1],
                          rotate:
                            index === 0
                              ? [-10, 10, -10, 0]
                              : index === 2
                                ? [0, 5, -5, 0]
                                : 0,
                          y: index === 1 ? [0, -5, 0] : 0,
                        }
                      : { scale: 1, rotate: 0, y: 0 }
                  }
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut",
                  }}
                />
              ) : (
                <stat.icon className={`w-4 h-4 md:w-6 md:h-6 ${stat.color}`} />
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
