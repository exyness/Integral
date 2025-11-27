import { motion } from "framer-motion";
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  features: string[];
}

interface FeaturesSectionProps {
  isDark: boolean;
  features: Feature[];
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  isDark,
  features,
}) => {
  const { isHalloweenMode } = useTheme();

  return (
    <section id="features" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2
            className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 ${
              isHalloweenMode
                ? "font-creepster text-[#F59E0B] tracking-wide"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            {isHalloweenMode
              ? "Tools for the Afterlife"
              : "Everything You Need"}
          </h2>
          <p
            className={`text-sm sm:text-base md:text-lg ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-[#B4B4B8]"
                  : "text-gray-600"
            }`}
          >
            {isHalloweenMode
              ? "Powerful spells designed to resurrect your productivity"
              : "Powerful features designed to boost your productivity"}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                type: "spring",
                stiffness: 80,
                damping: 15,
              }}
              className={`p-4 sm:p-6 rounded-xl border transition-all duration-300 ${
                isHalloweenMode
                  ? "bg-[#1a1a1f]/80 border-[#60c9b6]/20 hover:border-[#60c9b6]/50 hover:shadow-[0_0_15px_rgba(96,201,182,0.15)]"
                  : isDark
                    ? "bg-[rgba(26,26,31,0.4)] border-[rgba(255,255,255,0.1)]"
                    : "bg-white border-gray-200 hover:shadow-lg"
              }`}
              style={{
                backgroundColor: isHalloweenMode
                  ? undefined
                  : isDark
                    ? `${feature.color}10`
                    : `${feature.color}05`,
                borderColor: isHalloweenMode
                  ? undefined
                  : isDark
                    ? `${feature.color}30`
                    : `${feature.color}20`,
              }}
              onMouseEnter={(e) => {
                if (!isHalloweenMode) {
                  e.currentTarget.style.backgroundColor = isDark
                    ? `${feature.color}20`
                    : `${feature.color}10`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isHalloweenMode) {
                  e.currentTarget.style.backgroundColor = isDark
                    ? `${feature.color}10`
                    : `${feature.color}05`;
                }
              }}
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1">
                  <h3
                    className={`text-base sm:text-lg font-bold mb-1.5 sm:mb-2 ${isHalloweenMode ? "font-creepster tracking-wide" : ""}`}
                    style={{
                      color: isHalloweenMode ? "#60c9b6" : feature.color,
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm mb-2 sm:mb-3 ${
                      isHalloweenMode
                        ? "text-gray-400"
                        : isDark
                          ? "text-[#B4B4B8]"
                          : "text-gray-600"
                    }`}
                  >
                    {feature.description}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center ml-3 sm:ml-4 shrink-0 ${
                    isHalloweenMode
                      ? "bg-[#60c9b6]/10 border border-[#60c9b6]/20"
                      : ""
                  }`}
                  style={{
                    backgroundColor: isHalloweenMode
                      ? undefined
                      : `${feature.color}30`,
                  }}
                >
                  <feature.icon
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    style={{
                      color: isHalloweenMode ? "#60c9b6" : feature.color,
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {feature.features.map((item) => (
                  <span
                    key={item}
                    className={`text-xs px-2 py-1 rounded-lg ${
                      isHalloweenMode
                        ? "bg-[#60c9b6]/10 text-[#60c9b6] border border-[#60c9b6]/20"
                        : isDark
                          ? "bg-[rgba(255,255,255,0.05)] text-[#B4B4B8]"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
