import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  KeyRound,
  List,
  Timer,
  Wallet,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  BenefitsSection,
  CTASection,
  FeatureShowcase,
  FeaturesSection,
  Footer,
  HeroSection,
  LandingNav,
  MobileMenu,
  MobileShowcase,
} from "@/components/landing";
import { useTheme } from "@/contexts/ThemeContext";

export const Landing: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navFeatures = [
    { name: "Tasks", icon: List, color: "#10B981" },
    { name: "Time", icon: Timer, color: "#3B82F6" },
    { name: "Journal", icon: BookOpen, color: "#8B5CF6" },
    { name: "Budget", icon: Wallet, color: "#F59E0B" },
    { name: "Notes", icon: FileText, color: "#EC4899" },
    { name: "Accounts", icon: KeyRound, color: "#6366F1" },
    { name: "Pomodoro", icon: Clock, color: "#EF4444" },
  ];

  const features = [
    {
      icon: CheckCircle2,
      title: "Task Management",
      description:
        "Organize tasks with projects, priorities, and deadlines. Track progress with Kanban boards, list views, and calendar integration.",
      color: "#10B981",
      features: [
        "Kanban Boards",
        "Zombie Task Resurrection",
        "Project Organization",
        "Priority Levels",
      ],
    },
    {
      icon: Clock,
      title: "Time & Focus",
      description:
        "Monitor time spent on tasks with built-in timers and Pomodoro technique. Boost productivity with focus sessions.",
      color: "#3B82F6",
      features: [
        "Task Timers",
        "Pomodoro Sessions",
        "Time Analytics",
        "Focus Mode",
      ],
    },
    {
      icon: BookOpen,
      title: "Journal",
      description:
        "Document your daily progress and reflections. Organize entries by projects with calendar views and powerful search.",
      color: "#8B5CF6",
      features: [
        "Ghost Writer AI",
        "Daily Entries",
        "Project Tagging",
        "Calendar View",
      ],
    },
    {
      icon: Wallet,
      title: "Budget Tracker",
      description:
        "Track expenses, set budgets, and analyze spending patterns with detailed analytics, charts, and multi-currency support.",
      color: "#F59E0B",
      features: [
        "AI Financial Insights",
        "Expense Tracking",
        "Budget Goals",
        "Multi-Currency",
      ],
    },
    {
      icon: FileText,
      title: "Notes",
      description:
        "Create and organize notes with folders, tags, and powerful search. Perfect for ideas and documentation.",
      color: "#EC4899",
      features: ["Folder Organization", "Tags", "Search", "Rich Formatting"],
    },
    {
      icon: KeyRound,
      title: "Accounts",
      description:
        "Securely manage all your accounts in one place. Track usage, monitor activity, and keep your credentials safe.",
      color: "#6366F1",
      features: [
        "Secure Storage",
        "Usage Tracking",
        "Activity Monitor",
        "Quick Access",
      ],
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0A0A0B]" : "bg-gray-50"}`}>
      <div className="px-2 sm:px-4 md:px-6 lg:px-10">
        <LandingNav
          isDark={isDark}
          navFeatures={navFeatures}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <MobileMenu
          isDark={isDark}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          navFeatures={navFeatures}
        />

        <HeroSection isDark={isDark} />

        <MobileShowcase isDark={isDark} />

        <FeaturesSection isDark={isDark} features={features} />

        <FeatureShowcase isDark={isDark} />

        <BenefitsSection isDark={isDark} />

        <CTASection isDark={isDark} />
      </div>

      <Footer isDark={isDark} />

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 z-50 p-3 rounded-full shadow-lg transition-colors cursor-pointer ${
              isHalloweenMode
                ? "bg-[rgba(96,201,182,0.2)] border border-[rgba(96,201,182,0.3)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)]"
                : isDark
                  ? "bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.3)]"
                  : "bg-white border border-[rgba(139,92,246,0.2)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.1)]"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
