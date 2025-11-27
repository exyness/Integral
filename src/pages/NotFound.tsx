import { motion } from "framer-motion";
import { ArrowLeft, Home, LayoutDashboard } from "lucide-react";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const NotFound: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden ${
        isDark ? "bg-[#0A0A0B]" : "bg-gray-50"
      }`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={floatingAnimation}
          className="absolute top-20 left-10 w-72 h-72 bg-[#8B5CF6] rounded-full opacity-10 blur-3xl"
        />
        <motion.div
          animate={{
            ...floatingAnimation,
            transition: { ...floatingAnimation.transition, delay: 1 },
          }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#A855F7] rounded-full opacity-10 blur-3xl"
        />
        <motion.div
          animate={{
            ...floatingAnimation,
            transition: { ...floatingAnimation.transition, delay: 2 },
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#7C3AED] rounded-full opacity-5 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl mx-auto relative z-10"
      >
        {/* 404 Text with glitch effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <motion.h1
            className="text-[140px] md:text-[180px] font-black leading-none mb-2 bg-gradient-to-br from-[#8B5CF6] via-[#A855F7] to-[#7C3AED] bg-clip-text text-transparent"
            animate={{
              textShadow: [
                "0 0 20px rgba(139, 92, 246, 0)",
                "0 0 20px rgba(139, 92, 246, 0.3)",
                "0 0 20px rgba(139, 92, 246, 0)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            404
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent mx-auto max-w-xs"
          />
        </motion.div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <h2
            className={`text-3xl md:text-4xl font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Page Not Found
          </h2>
          <p
            className={`text-lg md:text-xl max-w-md mx-auto ${
              isDark ? "text-[#B4B4B8]" : "text-gray-600"
            }`}
          >
            Oops! The page you're looking for seems to have wandered off into
            the digital void.
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <motion.button
            onClick={() => navigate(user ? "/dashboard" : "/")}
            className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
              isDark
                ? "bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.25)]"
                : "bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.2)]"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {user ? (
              <>
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </>
            ) : (
              <>
                <Home className="w-4 h-4" />
                <span>Go to Home</span>
              </>
            )}
          </motion.button>

          <motion.button
            onClick={() => navigate(-1)}
            className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
              isDark
                ? "bg-[rgba(113,113,122,0.15)] border border-[rgba(113,113,122,0.3)] text-[#B4B4B8] hover:bg-[rgba(113,113,122,0.25)]"
                : "bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </motion.button>
        </motion.div>

        {/* Path info */}
        {location.pathname && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12"
          >
            <p
              className={`text-sm mb-2 ${
                isDark ? "text-[#71717A]" : "text-gray-500"
              }`}
            >
              Requested path
            </p>
            <code
              className={`inline-block font-mono px-4 py-2 rounded-lg text-sm ${
                isDark
                  ? "bg-[rgba(255,255,255,0.05)] text-[#B4B4B8] border border-[rgba(255,255,255,0.1)]"
                  : "bg-gray-100 text-gray-700 border border-gray-200"
              }`}
            >
              {location.pathname}
            </code>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default NotFound;
