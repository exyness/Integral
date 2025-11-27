import { motion } from "framer-motion";
import { Copy, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { candleTrio, cardFieryPumpkin, ghostDroopy, witchFly } from "@/assets";
import { GlassCard } from "@/components/GlassCard";
import { NavbarDecorations } from "@/components/halloween/NavbarDecorations";
import {
  AnimatedThemeToggle,
  HalloweenAudioToggle,
  HalloweenToggle,
} from "@/components/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";

export const Auth: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;

        // Auto-login check: if we have a session, the user is logged in
        if (data.session) {
          navigate("/");
        } else {
          // If no session, it might require email confirmation, but for this app
          // we'll assume immediate login if configured, or just let them know.
          // However, supabase.auth.signUp usually signs in automatically if email confirm is off.
          // If email confirm is on, they can't login yet.
          // Let's try to sign in immediately just in case, or show a message.
          // For now, consistent with "Auto-login" request:
          const { error: signInError } = await supabase.auth.signInWithPassword(
            {
              email,
              password,
            },
          );

          if (!signInError) {
            navigate("/");
          } else {
            // If sign in fails (e.g. email not confirmed), just show success message or let them know
            // But usually data.session is null only if email confirmation is required.
            if (!data.session && !data.user) {
              setError("Check your email for confirmation link.");
            } else {
              navigate("/");
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`halloween-bg-container min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden ${
        isDark
          ? isHalloweenMode
            ? "bg-transparent"
            : "bg-[#0A0A0B]"
          : "bg-gray-50"
      }`}
    >
      <NavbarDecorations />

      {/* Theme Toggles - Top Right */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 flex items-center space-x-2">
        <div className="scale-90 sm:scale-100 w-8 h-8 flex items-center justify-center">
          <HalloweenAudioToggle />
        </div>
        <div className="scale-90 sm:scale-100">
          <HalloweenToggle />
        </div>
        <div className="scale-90 sm:scale-100">
          <AnimatedThemeToggle direction="top-right" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <img
              src="/logo.svg"
              alt="Integral Logo"
              className="w-10 h-10 sm:w-12 sm:h-12"
            />
            <h1
              className={`text-3xl sm:text-4xl font-bold ${isDark ? "text-[#8B5CF6]" : "text-gray-900"}`}
            >
              Integral
            </h1>
          </div>
          <h2
            className={`text-lg sm:text-xl font-semibold mb-1 sm:mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p
            className={`text-sm sm:text-base ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
          >
            {isLogin ? "Sign in to your account" : "Sign up to get started"}
          </p>
        </div>

        <GlassCard
          variant="primary"
          className={`relative overflow-hidden ${
            isHalloweenMode
              ? "border-[rgba(96,201,182,0.4)]! shadow-[0_0_15px_rgba(96,201,182,0.15)]!"
              : ""
          }`}
        >
          {isHalloweenMode && (
            <>
              <div
                className="absolute inset-0 pointer-events-none opacity-10 z-0"
                style={{
                  backgroundImage: `url(${cardFieryPumpkin})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "grayscale(100%)",
                }}
              />
              <motion.img
                src={witchFly}
                alt=""
                className="absolute top-2 right-4 w-16 md:w-20 opacity-15 pointer-events-none"
                animate={{
                  y: [0, -10, 0],
                  x: [0, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.img
                src={candleTrio}
                alt=""
                className="absolute bottom-2 left-4 w-12 md:w-16 opacity-18 pointer-events-none"
                animate={{
                  opacity: [0.18, 0.25, 0.18],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.img
                src={ghostDroopy}
                alt=""
                className="absolute bottom-12 right-12 w-10 md:w-12 opacity-15 pointer-events-none"
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.15, 0.25, 0.15],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}

          <div className="p-4 sm:p-6 relative z-10">
            {/* OAuth Buttons - Top */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  setError("");
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: `${window.location.origin}/`,
                    },
                  });
                  if (error) {
                    setError(error.message);
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className={`cursor-pointer py-2 sm:py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 ${
                  isDark
                    ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(50,50,55,0.6)] hover:border-[rgba(255,255,255,0.2)]"
                    : "bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium text-sm sm:text-base">Google</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  setError("");
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: "github",
                    options: {
                      redirectTo: `${window.location.origin}/`,
                    },
                  });
                  if (error) {
                    setError(error.message);
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className={`cursor-pointer py-2 sm:py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 ${
                  isDark
                    ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(50,50,55,0.6)] hover:border-[rgba(255,255,255,0.2)]"
                    : "bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                }`}
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="font-medium text-sm sm:text-base">GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-4 sm:mb-6">
              <div className="absolute inset-0 flex items-center">
                <div
                  className={`w-full border-t ${isDark ? "border-[rgba(255,255,255,0.1)]" : "border-gray-300"}`}
                ></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span
                  className={`px-2 ${isDark ? "bg-[rgba(26,26,31,0.6)] text-[#71717A]" : "bg-white text-gray-500"}`}
                >
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Demo Credentials */}
            <div
              className={`mb-6 p-4 rounded-xl border ${
                isDark
                  ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)]"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <p
                className={`text-xs font-medium mb-2 uppercase tracking-wider ${
                  isDark ? "text-[#71717A]" : "text-gray-500"
                }`}
              >
                Demo Account
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                  >
                    Email:
                  </span>
                  <code
                    className={`text-sm font-mono px-2 py-1 rounded-md ${
                      isDark
                        ? "bg-[rgba(0,0,0,0.3)] text-white"
                        : "bg-white text-gray-900 border border-gray-200"
                    }`}
                  >
                    demo@integral.com
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("demo@integral.com");
                      toast.success("Email copied to clipboard");
                    }}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      isDark
                        ? "hover:bg-[rgba(255,255,255,0.1)] text-[#B4B4B8]"
                        : "hover:bg-gray-200 text-gray-500"
                    }`}
                    title="Copy Email"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                  >
                    Password:
                  </span>
                  <code
                    className={`text-sm font-mono px-2 py-1 rounded-md ${
                      isDark
                        ? "bg-[rgba(0,0,0,0.3)] text-white"
                        : "bg-white text-gray-900 border border-gray-200"
                    }`}
                  >
                    integral
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("integral");
                      toast.success("Password copied to clipboard");
                    }}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      isDark
                        ? "hover:bg-[rgba(255,255,255,0.1)] text-[#B4B4B8]"
                        : "hover:bg-gray-200 text-gray-500"
                    }`}
                    title="Copy Password"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-3 sm:space-y-4">
              {!isLogin && (
                <div>
                  <label
                    className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 ${isDark ? "text-[#B4B4B8]" : "text-gray-700"}`}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base focus:outline-hidden ${
                      isDark
                        ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#8B5CF6]"
                        : "bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                    }`}
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <label
                  className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 ${isDark ? "text-[#B4B4B8]" : "text-gray-700"}`}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base focus:outline-hidden ${
                    isDark
                      ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#8B5CF6]"
                      : "bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                  }`}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label
                  className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 ${isDark ? "text-[#B4B4B8]" : "text-gray-700"}`}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 sm:py-2.5 pr-10 text-sm sm:text-base focus:outline-hidden ${
                      isDark
                        ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#8B5CF6]"
                        : "bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                    }`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? "text-[#71717A] hover:text-[#B4B4B8]" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-xs sm:text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-2.5 sm:p-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer w-full bg-[#8B5CF6] text-white py-2.5 sm:py-3 rounded-lg hover:bg-[#7C3AED] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
              >
                {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="cursor-pointer text-[#8B5CF6] hover:text-[#A855F7] transition-colors text-sm sm:text-base"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
