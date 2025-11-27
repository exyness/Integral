import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { ghostGenie } from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";

interface CTASectionProps {
  isDark: boolean;
}

export const CTASection: React.FC<CTASectionProps> = ({ isDark }) => {
  const navigate = useNavigate();
  const { isHalloweenMode } = useTheme();

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`p-6 sm:p-8 rounded-2xl border text-center relative overflow-hidden ${
            isHalloweenMode
              ? "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.3)] shadow-[0_0_30px_rgba(96,201,182,0.1)]"
              : isDark
                ? "bg-[rgba(26,26,31,0.6)] border-[rgba(255,255,255,0.1)]"
                : "bg-white border-gray-200"
          }`}
        >
          {isHalloweenMode && (
            <motion.img
              src={ghostGenie}
              alt="Halloween Ghost"
              className="absolute bottom-2 -right-5 w-32 h-32 opacity-20 pointer-events-none"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          <h2
            className={`text-lg sm:text-xl md:text-2xl font-bold mb-2 ${
              isHalloweenMode
                ? "font-creepster tracking-wider text-[#60c9b6] drop-shadow-[0_0_10px_rgba(96,201,182,0.5)]"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            Ready to Get Started?
          </h2>
          <p
            className={`text-xs sm:text-sm md:text-base mb-4 sm:mb-5 ${
              isHalloweenMode
                ? "text-[#60c9b6]/80"
                : isDark
                  ? "text-[#B4B4B8]"
                  : "text-gray-600"
            }`}
          >
            Join thousands boosting their productivity with Integral
          </p>
          <motion.button
            onClick={() => navigate("/auth")}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all cursor-pointer inline-flex items-center space-x-2 border ${
              isHalloweenMode
                ? "bg-[rgba(96,201,182,0.2)] border-[rgba(96,201,182,0.3)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)] hover:shadow-[0_0_15px_rgba(96,201,182,0.3)]"
                : isDark
                  ? "bg-[rgba(16,185,129,0.2)] border-[rgba(16,185,129,0.3)] text-[#10B981] hover:bg-[rgba(16,185,129,0.3)]"
                  : "bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-green-600 hover:bg-[rgba(16,185,129,0.2)]"
            }`}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Create Your Free Account</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
