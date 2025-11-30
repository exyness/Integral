import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  KeyRound,
  Timer,
  Wallet,
  X,
} from "lucide-react";
import React, { useEffect, useId, useRef, useState } from "react";

import { useTheme } from "@/contexts/ThemeContext";
import { useOutsideClick } from "@/hooks/useOutsideClick";

interface FeatureShowcaseProps {
  isDark: boolean;
}

export const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({ isDark }) => {
  const { isHalloweenMode } = useTheme();
  const [active, setActive] = useState<(typeof showcases)[number] | null>(null);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  const getFeatureColor = (originalColor: string) => {
    return isHalloweenMode ? "#60c9b6" : originalColor;
  };

  const getThemeFolder = () => {
    if (isHalloweenMode) return "halloween";
    if (isDark) return "dark";
    return "light";
  };

  const themeFolder = getThemeFolder();

  const showcases = [
    {
      id: "tasks",
      icon: CheckCircle2,
      title: "Task Management",
      description:
        "Organize your work with powerful task management. Create projects, set priorities, track deadlines, and visualize progress with Kanban boards.",
      color: "#10B981",
      imagePosition: "right",
      features: [
        "Kanban Boards",
        "Project Organization",
        "Priority Levels",
        "Calendar Integration",
      ],
      coverImage: `showcase/${themeFolder}/tasks/tasks-cover.webp`,
      galleryImages: [
        `showcase/${themeFolder}/tasks/tasks-cover.webp`,
        `showcase/${themeFolder}/tasks/tasks-kanbanboard.webp`,
        `showcase/${themeFolder}/tasks/tasks-calendar.webp`,
        `showcase/${themeFolder}/tasks/tasks-projects.webp`,
        `showcase/${themeFolder}/tasks/tasks-kanban-projects.webp`,
        `showcase/${themeFolder}/tasks/tasks-project-analytics.webp`,
        `showcase/${themeFolder}/tasks/tasks-details.webp`,
        `showcase/${themeFolder}/tasks/tasks-project-details.webp`,
      ],
    },
    {
      id: "time",
      icon: Clock,
      title: "Time Tracking",
      description:
        "Monitor how you spend your time. Track time on tasks, analyze productivity patterns, and optimize your workflow with detailed reports.",
      color: "#3B82F6",
      imagePosition: "left",
      features: [
        "Task Timers",
        "Time Analytics",
        "Productivity Reports",
        "Session History",
      ],
      coverImage: `showcase/${themeFolder}/time/time-cover.webp`,
      galleryImages: [
        `showcase/${themeFolder}/time/time-cover.webp`,
        `showcase/${themeFolder}/time/time-active.webp`,
        `showcase/${themeFolder}/time/time-history.webp`,
      ],
    },
    {
      id: "journal",
      icon: BookOpen,
      title: "Journal Your Progress",
      description:
        "Document your daily achievements and reflections. Keep track of your journey with organized entries, project tagging, and calendar views.",
      color: "#8B5CF6",
      imagePosition: "right",
      features: [
        "Daily Entries",
        "Project Tagging",
        "Calendar View",
        "Rich Text Editor",
      ],
      coverImage: `showcase/${themeFolder}/journal/journal-cover.webp`,
      galleryImages: [
        `showcase/${themeFolder}/journal/journal-cover.webp`,
        `showcase/${themeFolder}/journal/journal-calendar.webp`,
        `showcase/${themeFolder}/journal/journal-projects.webp`,
        `showcase/${themeFolder}/journal/journal-details.webp`,
        `showcase/${themeFolder}/journal/journal-inactive-projects.webp`,
      ],
    },
    {
      id: "budget",
      icon: Wallet,
      title: "Financial Management",
      description:
        "Take control of your finances. Track assets, liabilities, and net worth. Get insights with AI-powered analytics.",
      color: "#F59E0B",
      imagePosition: "left",
      features: [
        "Net Worth Tracking",
        "Asset & Liability Management",
        "Analytics Dashboard",
        "Multi-Currency Support",
      ],
      coverImage: `showcase/${themeFolder}/budgets/budgets-cover.webp`,
      galleryImages: [
        `showcase/${themeFolder}/budgets/budgets-cover.webp`,
        `showcase/${themeFolder}/budgets/budget-analytics.webp`,
        `showcase/${themeFolder}/budgets/budgets-ai.webp`,
        `showcase/${themeFolder}/budgets/budgets-calendar.webp`,
        `showcase/${themeFolder}/budgets/budgets-history.webp`,
      ],
    },
    {
      id: "notes",
      icon: FileText,
      title: "Notes & Documentation",
      description:
        "Capture ideas and organize knowledge. Create notes with folders, tags, and powerful search to keep everything at your fingertips.",
      color: "#EC4899",
      imagePosition: "right",
      features: ["Folder Organization", "Tags", "Search", "Rich Formatting"],
      coverImage: `showcase/${themeFolder}/notes/notes-cover.webp`,
      galleryImages: [
        `showcase/${themeFolder}/notes/notes-cover.webp`,
        `showcase/${themeFolder}/notes/notes-details.webp`,
      ],
    },
    {
      id: "accounts",
      icon: KeyRound,
      title: "Accounts",
      description:
        "Securely manage all your accounts in one place. Track usage, monitor activity, and keep your credentials safe with encrypted storage.",
      color: "#6366F1",
      imagePosition: "left",
      features: [
        "Secure Storage",
        "Usage Tracking",
        "Activity Monitor",
        "Quick Access",
      ],
      coverImage: `showcase/${themeFolder}/accounts/accounts-cover.webp`,
      galleryImages: [
        `showcase/${themeFolder}/accounts/accounts-cover.webp`,
        `showcase/${themeFolder}/accounts/accounts-activity.webp`,
        `showcase/${themeFolder}/accounts/accounts-usage-calendar.webp`,
        `showcase/${themeFolder}/accounts/accounts-details.webp`,
      ],
    },
    {
      id: "pomodoro",
      icon: Timer,
      title: "Pomodoro Timer",
      description:
        "Boost your focus with the Pomodoro technique. Customize work/break intervals, track sessions, and improve concentration.",
      color: "#EF4444",
      imagePosition: "right",
      features: [
        "Custom Intervals",
        "Session Tracking",
        "Focus Mode",
        "Statistics",
      ],
      coverImage: `showcase/${themeFolder}/pomodoro/pomodoro-cover.webp`,
      galleryImages: [
        `showcase/${themeFolder}/pomodoro/pomodoro-cover.webp`,
        `showcase/${themeFolder}/pomodoro/pomodoro-focus.webp`,
        `showcase/${themeFolder}/pomodoro/pomodoro-short-break.webp`,
        `showcase/${themeFolder}/pomodoro/pomodoro-long-break.webp`,
        `showcase/${themeFolder}/pomodoro/pomodoro-history.webp`,
      ],
    },
  ];

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <section
      id="features-in-action"
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold ${
              isHalloweenMode
                ? "font-creepster tracking-wider text-[#60c9b6] drop-shadow-[0_0_15px_rgba(96,201,182,0.5)]"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            Features in Action
          </h2>
        </motion.div>

        {/* Backdrop Overlay */}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
          )}
        </AnimatePresence>

        {/* Expanded Card View */}
        <AnimatePresence>
          {active ? (
            <div className="fixed inset-0 grid place-items-center z-50 p-4">
              <motion.div
                layoutId={`card-${active.id}-${id}`}
                ref={ref}
                className={`w-full max-w-5xl max-h-[90vh] overflow-y-auto mobile-scrollbar-hide rounded-3xl shadow-2xl ${
                  isDark ? "bg-[#1A1A1F]" : "bg-white"
                }`}
              >
                <motion.div
                  layoutId={`image-${active.id}-${id}`}
                  className="relative"
                >
                  <img
                    src={active.coverImage}
                    alt={active.title}
                    className="w-full h-48 md:h-64 lg:h-80 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(to bottom, transparent 0%, ${
                        isDark ? "#1A1A1F" : "#ffffff"
                      } 100%)`,
                    }}
                  />
                </motion.div>

                <div className="p-4 sm:p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                      style={{
                        backgroundColor: `${getFeatureColor(active.color)}20`,
                      }}
                    >
                      <active.icon
                        className="w-8 h-8"
                        style={{ color: getFeatureColor(active.color) }}
                      />
                    </div>
                    <div className="flex-1">
                      <motion.h3
                        layoutId={`title-${active.id}-${id}`}
                        className={`text-2xl md:text-3xl font-bold mb-2 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                        style={{ color: getFeatureColor(active.color) }}
                      >
                        {active.title}
                      </motion.h3>
                      <motion.p
                        layoutId={`description-${active.id}-${id}`}
                        className={`text-base md:text-lg ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {active.description}
                      </motion.p>
                    </div>
                  </div>

                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h4
                        className={`text-lg font-semibold mb-3 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Key Features
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {active.features.map((feature) => (
                          <div
                            key={feature}
                            className={`flex items-center space-x-2 p-3 rounded-lg ${
                              isDark ? "bg-white/5" : "bg-gray-100"
                            }`}
                          >
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{
                                backgroundColor: getFeatureColor(active.color),
                              }}
                            />
                            <span
                              className={`text-sm font-medium ${
                                isDark ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4
                        className={`text-lg font-semibold mb-3 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Gallery
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {active.galleryImages.slice(0, 6).map((img, idx) => (
                          <div
                            key={idx}
                            className="aspect-video rounded-lg overflow-hidden bg-gray-100"
                          >
                            <img
                              src={img}
                              alt={`${active.title} screenshot ${idx + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.style.opacity = "0.3";
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>

        {/* Card Grid */}
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {showcases.map((showcase, index) => {
            const isLarge = index === 0 || index === 3;
            return (
              <motion.li
                layoutId={`card-${showcase.id}-${id}`}
                key={showcase.id}
                onClick={() => setActive(showcase)}
                className={`rounded-3xl cursor-pointer overflow-hidden group ${
                  isDark
                    ? "bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] border-transparent"
                    : "bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md"
                } transition-all duration-300 ${
                  isLarge ? "md:col-span-2" : "md:col-span-1"
                }`}
              >
                <div
                  className={`h-full flex ${isLarge ? "flex-col md:flex-row" : "flex-col"}`}
                >
                  <motion.div
                    layoutId={`image-${showcase.id}-${id}`}
                    className={`${isLarge ? "w-full md:w-1/2" : "w-full"}`}
                  >
                    <div className="h-full min-h-[200px] relative overflow-hidden">
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${getFeatureColor(
                            showcase.color,
                          )}10 0%, ${getFeatureColor(showcase.color)}05 100%)`,
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <showcase.icon
                            className="w-24 h-24 opacity-10"
                            style={{ color: getFeatureColor(showcase.color) }}
                          />
                        </div>
                      </div>
                      {showcase.coverImage && (
                        <img
                          src={showcase.coverImage}
                          alt={showcase.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                    </div>
                  </motion.div>

                  <div
                    className={`p-6 flex flex-col justify-center ${isLarge ? "w-full md:w-1/2" : "w-full"}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${getFeatureColor(showcase.color)}20`,
                        }}
                      >
                        <showcase.icon
                          className="w-5 h-5"
                          style={{ color: getFeatureColor(showcase.color) }}
                        />
                      </div>
                      <motion.h3
                        layoutId={`title-${showcase.id}-${id}`}
                        className={`text-lg font-bold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                        style={{ color: getFeatureColor(showcase.color) }}
                      >
                        {showcase.title}
                      </motion.h3>
                    </div>
                    <motion.p
                      layoutId={`description-${showcase.id}-${id}`}
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      } ${isLarge ? "" : "line-clamp-2"}`}
                    >
                      {showcase.description}
                    </motion.p>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
