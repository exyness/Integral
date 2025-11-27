import { motion } from "framer-motion";
import { Shield, Smartphone, Zap } from "lucide-react";
import React from "react";

import { useTheme } from "@/contexts/ThemeContext";

interface BenefitsSectionProps {
  isDark: boolean;
}

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({ isDark }) => {
  const { isHalloweenMode } = useTheme();
  const benefits = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Built with React and modern tech for instant responsiveness",
      color: "#F59E0B",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and stored securely",
      color: "#10B981",
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Works seamlessly on all your devices",
      color: "#3B82F6",
    },
  ];

  return (
    <section id="benefits" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2
            className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold ${
              isHalloweenMode
                ? "font-creepster tracking-wider text-[#60c9b6] drop-shadow-[0_0_15px_rgba(96,201,182,0.5)]"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            Why Choose Integral?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`p-4 sm:p-6 rounded-xl border transition-all ${
                isHalloweenMode
                  ? "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.2)] hover:bg-[rgba(96,201,182,0.1)] hover:border-[rgba(96,201,182,0.4)] hover:shadow-[0_0_15px_rgba(96,201,182,0.1)]"
                  : isDark
                    ? "bg-[rgba(26,26,31,0.4)] border-[rgba(255,255,255,0.1)] hover:bg-[rgba(26,26,31,0.6)]"
                    : "bg-white border-gray-200 hover:shadow-lg"
              }`}
              style={{
                backgroundColor: isHalloweenMode
                  ? undefined
                  : isDark
                    ? `${benefit.color}10`
                    : `${benefit.color}05`,
                borderColor: isHalloweenMode
                  ? undefined
                  : isDark
                    ? `${benefit.color}30`
                    : `${benefit.color}20`,
              }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex-1">
                  <h3
                    className={`text-base sm:text-lg font-bold mb-1.5 sm:mb-2 ${
                      isHalloweenMode ? "font-creepster tracking-wide" : ""
                    }`}
                    style={{
                      color: isHalloweenMode ? "#60c9b6" : benefit.color,
                    }}
                  >
                    {benefit.title}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm ${
                      isHalloweenMode
                        ? "text-[#60c9b6]/70"
                        : isDark
                          ? "text-[#B4B4B8]"
                          : "text-gray-600"
                    }`}
                  >
                    {benefit.description}
                  </p>
                </div>
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center sm:ml-4 shrink-0"
                  style={{
                    backgroundColor: isHalloweenMode
                      ? "rgba(96,201,182,0.1)"
                      : `${benefit.color}30`,
                  }}
                >
                  <benefit.icon
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    style={{
                      color: isHalloweenMode ? "#60c9b6" : benefit.color,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
