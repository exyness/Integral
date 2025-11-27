import { motion } from "framer-motion";
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  batGlide,
  batSwoop,
  cardBlueCemetary,
  pumpkinScary,
  spiderHairyCrawling,
} from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";

const GithubIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4 sm:w-5 sm:h-5"
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const TwitterIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4 sm:w-5 sm:h-5"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4 sm:w-5 sm:h-5"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const MailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4 sm:w-5 sm:h-5"
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

interface FooterProps {
  isDark: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isDark }) => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const { isHalloweenMode } = useTheme();

  return (
    <footer
      className={`py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8 border-t relative overflow-hidden ${
        isHalloweenMode
          ? "bg-[#1a1a1f] border-[#60c9b6]/20"
          : isDark
            ? "bg-[rgba(10,10,11,0.8)] border-[rgba(255,255,255,0.1)]"
            : "bg-white border-gray-200"
      }`}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-10 z-0"
        style={{
          backgroundImage: `url(${cardBlueCemetary})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(100%)",
        }}
      />

      {/* Halloween Decorations */}
      {isHalloweenMode && (
        <>
          <motion.img
            src={batSwoop}
            alt=""
            className="absolute top-10 left-[20%] w-20 opacity-40 pointer-events-none"
            animate={{
              x: [0, 100, 0],
              y: [0, -20, 0],
              rotate: [0, 10, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.img
            src={batGlide}
            alt=""
            className="absolute top-24 right-[15%] w-24 opacity-30 pointer-events-none"
            animate={{
              x: [0, -120, 0],
              y: [0, 40, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          <img
            src={spiderHairyCrawling}
            alt=""
            className="absolute top-0 right-0 w-32 opacity-20 pointer-events-none"
          />
          <img
            src={pumpkinScary}
            alt=""
            className="absolute -bottom-5 -left-5 rotate-25 w-36 opacity-30 pointer-events-none"
          />
        </>
      )}

      <div className="max-w-7xl mx-auto px-2 sm:px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div
                className={`${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/20 border border-[#60c9b6]/30"
                    : "bg-linear-to-br from-[#8B5CF6] to-[#7C3AED]"
                } h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg flex items-center justify-center`}
              >
                <span
                  className={`${
                    isHalloweenMode ? "text-[#60c9b6]" : "text-white"
                  } font-bold text-base sm:text-lg font-['Outfit']`}
                >
                  IG
                </span>
              </div>
              <span
                className={`text-lg sm:text-xl font-bold font-['Outfit'] ${
                  isHalloweenMode
                    ? "text-[#60c9b6] font-creepster tracking-wide"
                    : "text-purple-600"
                }`}
              >
                Integral
              </span>
            </div>
            <p
              className={`text-xs sm:text-sm ${
                isHalloweenMode
                  ? "text-gray-400"
                  : isDark
                    ? "text-[#B4B4B8]"
                    : "text-gray-600"
              }`}
            >
              {isHalloweenMode
                ? "Your haunted hub for tasks, time, budget, and more."
                : "Your all-in-one productivity platform for tasks, time, budget, and more."}
            </p>
          </div>

          {/* Features */}
          <div className="col-span-1">
            <h4
              className={`font-semibold mb-3 sm:mb-4 text-sm sm:text-base ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-900"
              }`}
            >
              Features
            </h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {[
                "Tasks",
                "Journal",
                "Budget",
                "Time Tracking",
                "Notes",
                "Pomodoro",
              ].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => navigate("/auth")}
                    className={`text-xs sm:text-sm transition-colors cursor-pointer ${
                      isHalloweenMode
                        ? "text-gray-400 hover:text-[#60c9b6]"
                        : isDark
                          ? "text-[#B4B4B8] hover:text-white"
                          : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h4
              className={`font-semibold mb-3 sm:mb-4 text-sm sm:text-base ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-900"
              }`}
            >
              Company
            </h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => navigate("/auth")}
                    className={`text-xs sm:text-sm transition-colors cursor-pointer ${
                      isHalloweenMode
                        ? "text-gray-400 hover:text-[#60c9b6]"
                        : isDark
                          ? "text-[#B4B4B8] hover:text-white"
                          : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="col-span-2 md:col-span-1">
            <h4
              className={`font-semibold mb-3 sm:mb-4 text-sm sm:text-base ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-900"
              }`}
            >
              Connect
            </h4>
            <div className="flex space-x-2 sm:space-x-3">
              <button
                onClick={() => navigate("/auth")}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/10 hover:bg-[#60c9b6]/20 text-[#60c9b6]"
                    : isDark
                      ? "bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#B4B4B8] hover:text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                }`}
                aria-label="GitHub"
              >
                <GithubIcon />
              </button>
              <button
                onClick={() => navigate("/auth")}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/10 hover:bg-[#60c9b6]/20 text-[#60c9b6]"
                    : isDark
                      ? "bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#B4B4B8] hover:text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                }`}
                aria-label="Twitter"
              >
                <TwitterIcon />
              </button>
              <button
                onClick={() => navigate("/auth")}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/10 hover:bg-[#60c9b6]/20 text-[#60c9b6]"
                    : isDark
                      ? "bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#B4B4B8] hover:text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                }`}
                aria-label="LinkedIn"
              >
                <LinkedinIcon />
              </button>
              <button
                onClick={() => navigate("/auth")}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/10 hover:bg-[#60c9b6]/20 text-[#60c9b6]"
                    : isDark
                      ? "bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#B4B4B8] hover:text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                }`}
                aria-label="Email"
              >
                <MailIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className={`pt-6 sm:pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 ${
            isHalloweenMode
              ? "border-[#60c9b6]/20"
              : isDark
                ? "border-[rgba(255,255,255,0.1)]"
                : "border-gray-200"
          }`}
        >
          <p
            className={`text-xs sm:text-sm ${
              isHalloweenMode
                ? "text-gray-500"
                : isDark
                  ? "text-[#B4B4B8]"
                  : "text-gray-600"
            }`}
          >
            © {currentYear} Integral. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6">
            <button
              onClick={() => navigate("/privacy")}
              className={`text-xs sm:text-sm transition-colors cursor-pointer ${
                isHalloweenMode
                  ? "text-gray-400 hover:text-[#60c9b6]"
                  : isDark
                    ? "text-[#B4B4B8] hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigate("/terms")}
              className={`text-xs sm:text-sm transition-colors cursor-pointer ${
                isHalloweenMode
                  ? "text-gray-400 hover:text-[#60c9b6]"
                  : isDark
                    ? "text-[#B4B4B8] hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigate("/cookies")}
              className={`text-xs sm:text-sm transition-colors cursor-pointer ${
                isHalloweenMode
                  ? "text-gray-400 hover:text-[#60c9b6]"
                  : isDark
                    ? "text-[#B4B4B8] hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Cookie Policy
            </button>
            <button
              onClick={() => navigate("/assets")}
              className={`text-xs sm:text-sm transition-colors cursor-pointer ${
                isHalloweenMode
                  ? "text-[#F59E0B] hover:text-[#F59E0B]/80 font-creepster tracking-wide"
                  : isDark
                    ? "text-[#B4B4B8] hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Halloween Assets
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
