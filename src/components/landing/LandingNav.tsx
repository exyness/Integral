import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { pumpkinScary } from "@/assets";
import { NavbarDecorations } from "@/components/halloween/NavbarDecorations";
import {
  AnimatedThemeToggle,
  HalloweenAudioToggle,
  HalloweenToggle,
} from "@/components/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

interface NavFeature {
  name: string;
  icon: React.ElementType;
  color: string;
}

interface LandingNavProps {
  isDark: boolean;
  navFeatures: NavFeature[];
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const LandingNav: React.FC<LandingNavProps> = ({
  isDark,
  navFeatures,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isHalloweenMode } = useTheme();

  const handleScrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition =
        elementPosition - window.innerHeight / 2 + element.offsetHeight / 2;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <motion.nav
      className={`relative inset-0 h-14 sm:h-16 top-0 left-0 border ${
        isDark
          ? "bg-[rgba(20,20,25,0.7)] border-[rgba(255,255,255,0.1)]"
          : "bg-white/90 border-slate-200"
      } z-50 flex items-center justify-between px-2 sm:px-4 md:px-6 shadow-xs rounded-lg mx-2 sm:mx-4 md:mx-6 mt-2 sm:mt-3 backdrop-blur-xl fixed`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <NavbarDecorations />
      {/* Logo */}
      <button
        onClick={() => navigate("/")}
        className="relative z-10 flex items-center space-x-2 sm:space-x-3 cursor-pointer"
      >
        <motion.div
          className={`h-8 w-8 sm:h-9 sm:w-9 rounded-lg flex items-center justify-center transition-colors duration-300 ${
            isHalloweenMode
              ? "bg-[#60c9b6]/20"
              : "bg-linear-to-br from-[#8B5CF6] to-[#7C3AED]"
          }`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {isHalloweenMode ? (
            <img
              src={pumpkinScary}
              alt="Halloween"
              className="w-6 h-6 sm:w-7 sm:h-7"
              style={{ filter: "brightness(1.2)" }}
            />
          ) : (
            <span className="text-gray-300 font-bold text-base sm:text-lg font-['Outfit']">
              IG
            </span>
          )}
        </motion.div>
        <h1
          className={`hidden sm:block text-xl md:text-2xl font-semibold tracking-tight font-['Outfit'] transition-colors duration-300 ${
            isHalloweenMode ? "text-[#60c9b6]" : "text-purple-600"
          }`}
        >
          Integral
        </h1>
      </button>

      {/* Desktop Navigation - Features */}
      <div className="hidden lg:flex items-center space-x-1">
        {navFeatures
          .filter((feature) => feature.name !== "Lovable")
          .map((feature) => {
            const sectionId = "features-in-action";

            return (
              <a
                key={feature.name}
                href={`#${sectionId}`}
                onClick={(e) => handleScrollToSection(e, sectionId)}
                className={`relative z-10 flex items-center px-3 py-2 rounded-lg transition-all duration-200 group text-xs font-medium ${
                  isDark
                    ? isHalloweenMode
                      ? "text-[#B4B4B8] hover:text-[#60c9b6] hover:bg-[rgba(96,201,182,0.1)]"
                      : "text-[#B4B4B8] hover:text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.1)]"
                    : isHalloweenMode
                      ? "text-slate-600 hover:text-[#60c9b6] hover:bg-[rgba(96,201,182,0.1)]"
                      : "text-slate-600 hover:text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.1)]"
                }`}
              >
                <feature.icon
                  className={`w-5 h-5 mr-3 shrink-0 transition-colors ${
                    isHalloweenMode
                      ? "text-gray-400 group-hover:text-[#60c9b6]"
                      : "text-gray-400 group-hover:text-[#8B5CF6]"
                  }`}
                />
                <span>{feature.name}</span>
              </a>
            );
          })}
      </div>

      {/* Desktop Actions */}
      <div className="relative z-10 flex items-center space-x-1 sm:space-x-2 md:space-x-4">
        {/* Halloween Audio Toggle */}
        <div className="scale-90 sm:scale-100 w-7 flex items-center justify-center">
          <HalloweenAudioToggle />
        </div>

        {/* Halloween Toggle */}
        <div className="scale-90 sm:scale-100">
          <HalloweenToggle />
        </div>

        {/* Theme Toggle */}
        <div className="scale-90 sm:scale-100">
          <AnimatedThemeToggle direction="top-right" />
        </div>

        <div className="hidden md:flex items-center space-x-2">
          {user ? (
            <button
              onClick={() => navigate("/dashboard")}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all cursor-pointer text-xs sm:text-sm border flex items-center space-x-2 ${
                isHalloweenMode
                  ? "bg-[rgba(96,201,182,0.2)] border-[rgba(96,201,182,0.3)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)]"
                  : isDark
                    ? "bg-[rgba(16,185,129,0.2)] border-[rgba(16,185,129,0.3)] text-[#10B981] hover:bg-[rgba(16,185,129,0.3)]"
                    : "bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-green-600 hover:bg-[rgba(16,185,129,0.2)]"
              }`}
            >
              <span>Dashboard</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/auth")}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all cursor-pointer text-xs sm:text-sm border ${
                  isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.2)] border-[rgba(96,201,182,0.3)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)]"
                    : isDark
                      ? "bg-[rgba(139,92,246,0.2)] border-[rgba(139,92,246,0.3)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.3)]"
                      : "bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.3)] text-purple-600 hover:bg-[rgba(139,92,246,0.2)]"
                }`}
              >
                Sign In
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              isDark
                ? "hover:bg-[rgba(255,255,255,0.1)] text-[#B4B4B8]"
                : "hover:bg-slate-100 text-slate-600"
            }`}
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>
      </div>
    </motion.nav>
  );
};
