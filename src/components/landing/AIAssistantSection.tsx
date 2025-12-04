import { motion, useScroll, useTransform } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Info,
  RotateCcw,
  Send,
  Sparkles,
  Wand2,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface AIAssistantSectionProps {
  isDark: boolean;
}

const chatMessages = [
  {
    type: "user",
    text: "@task Buy groceries tomorrow",
    delay: 0,
  },
  {
    type: "ai",
    text: 'Task created: "Buy groceries" due tomorrow in Integral Assistant project!',
    isSuccess: true,
    delay: 0.4,
  },
  {
    type: "user",
    text: "What tasks are due this week?",
    delay: 0.8,
  },
  {
    type: "ai",
    text: "You have 5 tasks due this week:\n• 2 high priority\n• 3 medium priority\n\nWant me to prioritize them for you?",
    delay: 1.2,
  },
];

const mentions = [
  { key: "@task", label: "Task" },
  { key: "@note", label: "Note" },
  { key: "@journal", label: "Journal" },
  { key: "@transaction", label: "Transaction" },
  { key: "@budget", label: "Budget" },
  { key: "@goal", label: "Goal" },
];

const capabilities = [
  { icon: Wand2, label: "Natural Commands" },
  { icon: CheckCircle2, label: "Smart Actions" },
  { icon: Calendar, label: "Context Aware" },
];

export const AIAssistantSection: React.FC<AIAssistantSectionProps> = ({
  isDark,
}) => {
  const { isHalloweenMode } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const accentColor = isHalloweenMode ? "#60c9b6" : "#a855f7";
  const accentColorLight = isHalloweenMode ? "#60c9b6" : "#c084fc";

  // Typewriter effect
  const [typewriterText, setTypewriterText] = useState("");
  const [showEmptyState, setShowEmptyState] = useState(true);

  useEffect(() => {
    const words = ["Tasks", "Notes", "Journal", "Budget", "Goals", "Pomodoro"];
    let currentWordIndex = Math.floor(Math.random() * words.length);
    let charIndex = 0;
    let isDeleting = false;
    let pauseCounter = 0;

    const typeWriter = () => {
      const currentWord = words[currentWordIndex];

      if (
        charIndex === currentWord.length &&
        !isDeleting &&
        pauseCounter < 40
      ) {
        pauseCounter++;
        return;
      }

      if (pauseCounter >= 40) {
        isDeleting = true;
        pauseCounter = 0;
      }

      if (!isDeleting) {
        charIndex++;
        setTypewriterText(currentWord.slice(0, charIndex));
      } else {
        charIndex--;
        setTypewriterText(currentWord.slice(0, charIndex));
      }

      if (charIndex === 0 && isDeleting) {
        isDeleting = false;
        currentWordIndex = (currentWordIndex + 1) % words.length;
      }
    };

    const timer = setInterval(typeWriter, isDeleting ? 30 : 80);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      ref={containerRef}
      className={`relative py-16 sm:py-24 lg:py-32 overflow-hidden ${
        isDark ? "bg-[#0A0A0B]" : "bg-gray-50"
      }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px]"
          style={{
            background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${accentColor} 1px, transparent 1px), linear-gradient(90deg, ${accentColor} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12 lg:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${
              isHalloweenMode
                ? "bg-[#60c9b6]/10 text-[#60c9b6] border border-[#60c9b6]/20"
                : "bg-purple-500/10 text-purple-500 border border-purple-500/20"
            }`}
          >
            <div className="relative w-5 h-5">
              <img
                src="/assistant.svg"
                alt="AI"
                className="w-full h-full object-contain"
                style={
                  isHalloweenMode
                    ? {
                        filter:
                          "brightness(0) saturate(100%) invert(73%) sepia(18%) saturate(1234%) hue-rotate(120deg) brightness(95%) contrast(87%)",
                      }
                    : isDark
                      ? {
                          filter:
                            "brightness(0) saturate(100%) invert(76%) sepia(20%) saturate(1200%) hue-rotate(213deg) brightness(100%) contrast(96%)",
                        }
                      : {}
                }
              />
              <Sparkles
                className={`w-2.5 h-2.5 absolute -top-0.5 -right-0.5 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-purple-400"
                      : "text-purple-500"
                }`}
              />
            </div>
            AI-Powered Assistant
          </motion.div>

          <h2
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 ${
              isHalloweenMode
                ? "font-creepster tracking-wide text-[#F59E0B]"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            Talk to Your
            <motion.span
              className="block mt-1 sm:mt-2"
              style={{ color: accentColorLight }}
            >
              Productivity
            </motion.span>
          </h2>

          <p
            className={`text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-4 sm:px-0 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Manage tasks, schedule events, and get insights using natural
            conversation. Your AI assistant understands context and takes
            action.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 items-center">
          {/* Chat Interface - Matching FloatingAIChatWidget */}
          <motion.div
            style={{ y }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-3"
          >
            {/* Glass Card Container */}
            <div
              className={`relative rounded-2xl overflow-hidden backdrop-blur-xl border ${
                isHalloweenMode
                  ? "bg-[#1a1a1f]/80 border-[#60c9b6]/20"
                  : isDark
                    ? "bg-[#1A1A1F]/80 border-white/10"
                    : "bg-white/80 border-gray-200"
              }`}
              style={{
                boxShadow: isHalloweenMode
                  ? "0 8px 32px rgba(96, 201, 182, 0.15)"
                  : isDark
                    ? "0 8px 32px rgba(0, 0, 0, 0.4)"
                    : "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Header */}
              <div
                className={`flex items-center justify-between px-4 py-3 border-b ${
                  isHalloweenMode
                    ? "border-[#60c9b6]/20"
                    : isDark
                      ? "border-white/10"
                      : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <img
                      src="/assistant.svg"
                      alt="AI"
                      className="w-full h-full object-contain"
                      style={
                        isHalloweenMode
                          ? {
                              filter:
                                "brightness(0) saturate(100%) invert(73%) sepia(18%) saturate(1234%) hue-rotate(120deg) brightness(95%) contrast(87%)",
                            }
                          : isDark
                            ? {
                                filter:
                                  "brightness(0) saturate(100%) invert(76%) sepia(20%) saturate(1200%) hue-rotate(213deg) brightness(100%) contrast(96%)",
                              }
                            : {}
                      }
                    />
                    <Sparkles
                      className={`w-3 h-3 absolute -top-0.5 -right-0.5 ${
                        isHalloweenMode
                          ? "text-[#60c9b6] drop-shadow-[0_0_3px_rgba(96,201,182,0.8)]"
                          : isDark
                            ? "text-purple-400 drop-shadow-[0_0_3px_rgba(192,132,252,0.6)]"
                            : "text-purple-500"
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isHalloweenMode
                          ? "text-[#60c9b6]"
                          : isDark
                            ? "text-white"
                            : "text-gray-900"
                      }`}
                    >
                      {isHalloweenMode ? "The Grimoire" : "Integral AI"}
                    </p>
                    <p
                      className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      {isHalloweenMode
                        ? "Mystical Assistant"
                        : "Your productivity companion"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                    }`}
                  >
                    <Info
                      className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    />
                  </button>
                  <button
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                    }`}
                  >
                    <RotateCcw
                      className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    />
                  </button>
                </div>
              </div>

              {/* Chat Content */}
              <div className="p-3 sm:p-4 min-h-[320px] sm:min-h-[380px] flex flex-col">
                {showEmptyState ? (
                  /* Empty State with Typewriter */
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col items-center justify-center text-center py-8"
                  >
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="mb-6"
                    >
                      <div className="relative w-16 h-16 mx-auto">
                        <motion.img
                          src="/assistant.svg"
                          alt="AI"
                          className="w-full h-full object-contain"
                          style={
                            isHalloweenMode
                              ? {
                                  filter:
                                    "brightness(0) saturate(100%) invert(73%) sepia(18%) saturate(1234%) hue-rotate(120deg) brightness(95%) contrast(87%)",
                                }
                              : isDark
                                ? {
                                    filter:
                                      "brightness(0) saturate(100%) invert(76%) sepia(20%) saturate(1200%) hue-rotate(213deg) brightness(100%) contrast(96%)",
                                  }
                                : {}
                          }
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <Sparkles
                          className={`w-4 h-4 absolute -top-1 -right-1 ${
                            isHalloweenMode
                              ? "text-[#60c9b6] drop-shadow-[0_0_4px_rgba(96,201,182,0.8)]"
                              : isDark
                                ? "text-purple-400 drop-shadow-[0_0_4px_rgba(192,132,252,0.6)]"
                                : "text-purple-500"
                          }`}
                        />
                      </div>
                    </motion.div>

                    <h3
                      className={`text-lg font-semibold mb-2 ${
                        isHalloweenMode
                          ? "text-[#60c9b6]"
                          : isDark
                            ? "text-white"
                            : "text-gray-900"
                      }`}
                    >
                      {isHalloweenMode
                        ? "Consult the Grimoire"
                        : "How can I help?"}
                    </h3>

                    <p
                      className={`text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {isHalloweenMode
                        ? "Whisper your desires to the spirits..."
                        : "Ask me anything about your"}
                    </p>

                    {/* Typewriter Text */}
                    <div className="h-7 flex items-center justify-center">
                      <span
                        className="text-lg font-semibold"
                        style={{ color: accentColor }}
                      >
                        {typewriterText}
                      </span>
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="ml-0.5 w-0.5 h-5 inline-block"
                        style={{ background: accentColor }}
                      />
                    </div>

                    {/* Mention Suggestions */}
                    <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-1.5 sm:gap-2">
                      {mentions.slice(0, 4).map((mention, i) => (
                        <motion.button
                          key={mention.key}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => setShowEmptyState(false)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isHalloweenMode
                              ? "bg-[#60c9b6]/10 text-[#60c9b6] hover:bg-[#60c9b6]/20 border border-[#60c9b6]/20"
                              : isDark
                                ? "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20"
                                : "bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200"
                          }`}
                        >
                          {mention.key}
                        </motion.button>
                      ))}
                    </div>

                    {/* Example Prompts */}
                    <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 w-full max-w-xs">
                      {[
                        "@task Buy groceries",
                        "What's due tomorrow?",
                        "Create a note",
                      ].map((prompt, i) => (
                        <motion.button
                          key={prompt}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          whileHover={{ x: 4 }}
                          onClick={() => setShowEmptyState(false)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                            isDark
                              ? "bg-white/5 hover:bg-white/10 text-gray-400"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                          }`}
                        >
                          "{prompt}"
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  /* Chat Messages */
                  <div className="flex-1 space-y-4 overflow-y-auto">
                    {chatMessages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: msg.delay, duration: 0.4 }}
                        className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.type === "ai" && (
                          <div className="relative w-7 h-7 mr-2 shrink-0">
                            <img
                              src="/assistant.svg"
                              alt="AI"
                              className="w-full h-full object-contain"
                              style={
                                isHalloweenMode
                                  ? {
                                      filter:
                                        "brightness(0) saturate(100%) invert(73%) sepia(18%) saturate(1234%) hue-rotate(120deg) brightness(95%) contrast(87%)",
                                    }
                                  : isDark
                                    ? {
                                        filter:
                                          "brightness(0) saturate(100%) invert(76%) sepia(20%) saturate(1200%) hue-rotate(213deg) brightness(100%) contrast(96%)",
                                      }
                                    : {}
                              }
                            />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                            msg.type === "user"
                              ? isHalloweenMode
                                ? "bg-[#60c9b6] text-white rounded-br-md"
                                : "bg-purple-500 text-white rounded-br-md"
                              : msg.isSuccess
                                ? isHalloweenMode
                                  ? "bg-[#60c9b6]/10 border border-[#60c9b6]/30 rounded-bl-md"
                                  : "bg-green-500/10 border border-green-500/30 rounded-bl-md"
                                : isDark
                                  ? "bg-white/5 border border-white/10 rounded-bl-md"
                                  : "bg-gray-100 border border-gray-200 rounded-bl-md"
                          }`}
                        >
                          {msg.isSuccess && (
                            <div className="flex items-center gap-1.5 mb-1">
                              <CheckCircle2
                                className="w-3.5 h-3.5"
                                style={{
                                  color: isHalloweenMode
                                    ? "#60c9b6"
                                    : "#22c55e",
                                }}
                              />
                              <span
                                className="text-xs font-medium"
                                style={{
                                  color: isHalloweenMode
                                    ? "#60c9b6"
                                    : "#22c55e",
                                }}
                              >
                                Success
                              </span>
                            </div>
                          )}
                          <p
                            className={`text-sm whitespace-pre-line ${
                              msg.type === "user"
                                ? "text-white"
                                : isDark
                                  ? "text-gray-300"
                                  : "text-gray-700"
                            }`}
                          >
                            {msg.text}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Input Area */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className={`mt-3 sm:mt-4 flex items-center gap-2 p-2 rounded-xl border ${
                    isHalloweenMode
                      ? "bg-black/20 border-[#60c9b6]/20"
                      : isDark
                        ? "bg-black/20 border-white/10"
                        : "bg-gray-100 border-gray-200"
                  }`}
                >
                  <Sparkles
                    className="w-4 h-4 ml-2 shrink-0"
                    style={{ color: accentColor }}
                  />
                  <span
                    className={`flex-1 text-xs sm:text-sm truncate ${isDark ? "text-gray-500" : "text-gray-400"}`}
                  >
                    <span className="hidden sm:inline">
                      Type @ for commands or ask anything...
                    </span>
                    <span className="sm:hidden">Type @ or ask anything...</span>
                  </span>
                  <button
                    className="p-1.5 sm:p-2 rounded-lg transition-colors shrink-0"
                    style={{ background: accentColor }}
                  >
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Capabilities Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-2 space-y-3 sm:space-y-4"
          >
            {/* AI Icon Display */}
            <div
              className={`relative p-6 sm:p-8 rounded-2xl text-center backdrop-blur-xl border ${
                isHalloweenMode
                  ? "bg-[#1a1a1f]/80 border-[#60c9b6]/20"
                  : isDark
                    ? "bg-[#1A1A1F]/80 border-white/10"
                    : "bg-white/80 border-gray-200"
              }`}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative inline-block"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)`,
                    transform: "scale(2)",
                  }}
                />
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto">
                  <motion.img
                    src="/assistant.svg"
                    alt="AI"
                    className="w-full h-full object-contain"
                    style={
                      isHalloweenMode
                        ? {
                            filter:
                              "brightness(0) saturate(100%) invert(73%) sepia(18%) saturate(1234%) hue-rotate(120deg) brightness(95%) contrast(87%)",
                          }
                        : isDark
                          ? {
                              filter:
                                "brightness(0) saturate(100%) invert(76%) sepia(20%) saturate(1200%) hue-rotate(213deg) brightness(100%) contrast(96%)",
                            }
                          : {}
                    }
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <Sparkles
                    className={`w-5 h-5 absolute -top-1 -right-1 ${
                      isHalloweenMode
                        ? "text-[#60c9b6] drop-shadow-[0_0_4px_rgba(96,201,182,0.8)]"
                        : isDark
                          ? "text-purple-400 drop-shadow-[0_0_4px_rgba(192,132,252,0.6)]"
                          : "text-purple-500"
                    }`}
                  />
                </div>
              </motion.div>
              <p
                className={`mt-4 sm:mt-6 text-base sm:text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Powered by Intelligence
              </p>
              <p
                className={`text-xs sm:text-sm mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                Context-aware AI that learns your workflow
              </p>
            </div>

            {/* Capability Cards - horizontal on mobile, vertical on desktop */}
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-3 lg:gap-4">
              {capabilities.map((cap, i) => (
                <motion.div
                  key={cap.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  whileHover={{ x: 4 }}
                  className={`flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-4 p-3 sm:p-4 rounded-xl lg:rounded-2xl cursor-default transition-colors backdrop-blur-xl border ${
                    isHalloweenMode
                      ? "bg-[#1a1a1f]/80 border-[#60c9b6]/20 hover:border-[#60c9b6]/40"
                      : isDark
                        ? "bg-[#1A1A1F]/80 border-white/10 hover:border-white/20"
                        : "bg-white/80 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className="p-2 sm:p-3 rounded-lg lg:rounded-xl"
                    style={{ background: `${accentColor}15` }}
                  >
                    <cap.icon
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      style={{ color: accentColor }}
                    />
                  </div>
                  <span
                    className={`text-xs sm:text-sm lg:text-base font-medium text-center lg:text-left ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {cap.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
