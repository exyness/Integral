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
    { name: "Finances", icon: Wallet, color: "#F59E0B" },
    { name: "Notes", icon: FileText, color: "#EC4899" },
    { name: "Accounts", icon: KeyRound, color: "#6366F1" },
    { name: "Pomodoro", icon: Clock, color: "#EF4444" },
  ];

  const features = [
    {
      icon: CheckCircle2,
      title: "AI Task Management",
      description:
        "Organize tasks with AI-assisted prioritization. Let our RAG engine suggest relevant tasks based on your current context.",
      color: "#10B981",
      features: [
        "Smart Prioritization",
        "Zombie Task Resurrection",
        "Contextual Suggestions",
        "Kanban Boards",
      ],
    },
    {
      icon: Clock,
      title: "Smart Time & Focus",
      description:
        "Optimize your schedule with AI insights. Our smart timers adapt to your workflow for maximum deep work efficiency.",
      color: "#3B82F6",
      features: [
        "AI Focus Insights",
        "Smart Pomodoro",
        "Productivity Analytics",
        "Flow State Mode",
      ],
    },
    {
      icon: BookOpen,
      title: "Journal",
      description:
        "Document your daily progress. Use RAG-powered Vector Search to find connections between your entries and past reflections.",
      color: "#8B5CF6",
      features: [
        "Ghost Writer AI",
        "RAG Vector Search",
        "Project Tagging",
        "Calendar View",
      ],
    },
    {
      icon: Wallet,
      title: "Financial Management",
      description:
        "Track budgets with visual icons, manage recurring transactions, assets & liabilities. Chat with your finances using RAG for AI-powered insights.",
      color: "#F59E0B",
      features: [
        "Visual Budget Icons",
        "Smart Category Tracking",
        "Recurring Transactions",
        "RAG Financial Chat",
        "Net Worth Dashboard",
        "Multi-Currency Support",
      ],
    },
    {
      icon: FileText,
      title: "Notes & Knowledge",
      description:
        "Create and organize notes with folders, tags, and powerful AI Semantic Search. Chat with your second brain.",
      color: "#EC4899",
      features: [
        "Folder Organization",
        "Tags",
        "AI Semantic Search",
        "Rich Formatting",
      ],
    },
    {
      icon: KeyRound,
      title: "Secure AI Vault",
      description:
        "Securely manage credentials with intelligent monitoring. AI detects unusual activity to keep your digital life safe.",
      color: "#6366F1",
      features: [
        "Smart Security",
        "Usage Analytics",
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
