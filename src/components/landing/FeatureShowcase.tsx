import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  KeyRound,
  Timer,
  Wallet,
} from "lucide-react";
import React, { useState } from "react";
import {
  ExpandableScreen,
  ExpandableScreenContent,
  ExpandableScreenTrigger,
} from "@/components/ui/expandable-screen";
import { useTheme } from "@/contexts/ThemeContext";

interface FeatureShowcaseProps {
  isDark: boolean;
}

interface Showcase {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  imagePosition: string;
  features: string[];
  coverImage: string;
  galleryImages: string[];
}

export const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({ isDark }) => {
  const { isHalloweenMode } = useTheme();
  const [activeShowcase, setActiveShowcase] = useState<Showcase | null>(null);

  const getFeatureColor = (originalColor: string) => {
    return isHalloweenMode ? "#60c9b6" : originalColor;
  };

  const getThemeFolder = () => {
    if (isHalloweenMode) return "halloween";
    if (isDark) return "dark";
    return "light";
  };

  const themeFolder = getThemeFolder();

  const showcases: Showcase[] = [
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

  return (
    <section
      id="features-in-action"
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {showcases.map((showcase, index) => {
            return (
              <div
                key={showcase.id}
                className={`flex ${
                  index === 0 || index === 3
                    ? "md:col-span-2 lg:col-span-2"
                    : "md:col-span-1"
                }`}
              >
                <ExpandableScreen
                  layoutId={`showcase-${showcase.id}`}
                  triggerRadius="24px"
                  contentRadius="24px"
                  animationDuration={0.4}
                >
                  <ExpandableScreenTrigger
                    className="flex-1"
                    childrenClassName="h-full"
                  >
                    <div
                      onClick={() => setActiveShowcase(showcase)}
                      className={`h-full min-h-[320px] rounded-3xl cursor-pointer overflow-hidden group ${
                        isDark
                          ? "bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] border-transparent"
                          : "bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md"
                      } transition-all duration-300`}
                    >
                      <div className="h-full flex flex-col">
                        <div className="w-full shrink-0">
                          <div className="h-48 md:h-56 relative overflow-hidden">
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
                                  style={{
                                    color: getFeatureColor(showcase.color),
                                  }}
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
                        </div>

                        <div className="p-6 flex flex-col justify-between w-full flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{
                                backgroundColor: `${getFeatureColor(showcase.color)}20`,
                              }}
                            >
                              <showcase.icon
                                className="w-5 h-5"
                                style={{
                                  color: getFeatureColor(showcase.color),
                                }}
                              />
                            </div>
                            <h3
                              className={`text-lg font-bold ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                              style={{ color: getFeatureColor(showcase.color) }}
                            >
                              {showcase.title}
                            </h3>
                          </div>
                          <p
                            className={`text-sm ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            } line-clamp-3`}
                          >
                            {showcase.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </ExpandableScreenTrigger>

                  <ExpandableScreenContent
                    className={`max-w-6xl mx-auto ${
                      isDark ? "bg-[#1A1A1F]" : "bg-white"
                    }`}
                  >
                    <div className="h-full overflow-y-auto mobile-scrollbar-hide">
                      <div className="relative">
                        <img
                          src={showcase.coverImage}
                          alt={showcase.title}
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
                      </div>

                      <div className="p-4 sm:p-6 md:p-8">
                        <div className="flex items-start gap-4 mb-6">
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                            style={{
                              backgroundColor: `${getFeatureColor(showcase.color)}20`,
                            }}
                          >
                            <showcase.icon
                              className="w-8 h-8"
                              style={{ color: getFeatureColor(showcase.color) }}
                            />
                          </div>
                          <div className="flex-1">
                            <h3
                              className={`text-2xl md:text-3xl font-bold mb-2 ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                              style={{ color: getFeatureColor(showcase.color) }}
                            >
                              {showcase.title}
                            </h3>
                            <p
                              className={`text-base md:text-lg ${
                                isDark ? "text-gray-300" : "text-gray-600"
                              }`}
                            >
                              {showcase.description}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <h4
                              className={`text-lg font-semibold mb-3 ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              Key Features
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              {showcase.features.map((feature) => (
                                <div
                                  key={feature}
                                  className={`flex items-center space-x-2 p-3 rounded-lg ${
                                    isDark ? "bg-white/5" : "bg-gray-100"
                                  }`}
                                >
                                  <div
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{
                                      backgroundColor: getFeatureColor(
                                        showcase.color,
                                      ),
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
                              {showcase.galleryImages
                                .slice(0, 6)
                                .map((img, idx) => (
                                  <div
                                    key={idx}
                                    className="aspect-video rounded-lg overflow-hidden bg-gray-100"
                                  >
                                    <img
                                      src={img}
                                      alt={`${showcase.title} screenshot ${idx + 1}`}
                                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                      onError={(e) => {
                                        e.currentTarget.style.opacity = "0.3";
                                      }}
                                    />
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ExpandableScreenContent>
                </ExpandableScreen>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
