import { AnimatePresence, motion } from "framer-motion";
import {
  FlaskConical,
  Ghost,
  Loader2,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import {
  batSwoop,
  cardBlueCemetary,
  cardCatFence,
  cardHauntedHouse,
  ghostScare,
  spiderCuteHanging,
} from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";
import {
  InsightType,
  useFinancialInsights,
} from "@/hooks/budget/useFinancialInsights";
import { useCurrency } from "@/hooks/useCurrency";
import { Budget, BudgetTransaction } from "@/types/budget";

interface FinancialInsightsCardProps {
  transactions: BudgetTransaction[];
  budgets: Budget[];
}

export const FinancialInsightsCard: React.FC<FinancialInsightsCardProps> = ({
  transactions,
  budgets,
}) => {
  const { isHalloweenMode, isDark } = useTheme();
  const { currency } = useCurrency();
  const { generateInsight, insight, isGhostWriting, currentType } =
    useFinancialInsights(
      transactions,
      budgets,
      currency.symbol,
      isHalloweenMode ? "spooky" : "normal",
    );

  const [activeTab, setActiveTab] = useState<InsightType>(currentType);

  // Update active tab if hook loads a different persisted type
  React.useEffect(() => {
    if (currentType) {
      setActiveTab(currentType);
    }
  }, [currentType]);

  const handleTabChange = (tab: InsightType) => {
    setActiveTab(tab);
    // Optional: Auto-generate when switching tabs if no insight yet?
    // For now, let's require a click to "Summon" to save API calls
  };

  const tabsRef = React.useRef<HTMLDivElement>(null);
  const horrorTabRef = React.useRef<HTMLButtonElement>(null);
  const subscriptionsTabRef = React.useRef<HTMLButtonElement>(null);
  const forecastTabRef = React.useRef<HTMLButtonElement>(null);
  const allocationTabRef = React.useRef<HTMLButtonElement>(null);

  const [tabPosition, setTabPosition] = useState({
    left: 0,
    width: 0,
    top: 0,
    height: 0,
  });

  React.useEffect(() => {
    const updateTabPosition = () => {
      let currentTab: HTMLButtonElement | null;
      switch (activeTab) {
        case "horror":
          currentTab = horrorTabRef.current;
          break;
        case "subscriptions":
          currentTab = subscriptionsTabRef.current;
          break;
        case "forecast":
          currentTab = forecastTabRef.current;
          break;
        case "allocation":
          currentTab = allocationTabRef.current;
          break;
        default:
          currentTab = null;
      }

      if (currentTab && tabsRef.current) {
        const tabsRect = tabsRef.current.getBoundingClientRect();
        const activeRect = currentTab.getBoundingClientRect();
        setTabPosition({
          left: activeRect.left - tabsRect.left,
          width: activeRect.width,
          top: activeRect.top - tabsRect.top,
          height: activeRect.height,
        });
      }
    };

    const timer1 = setTimeout(updateTabPosition, 50);
    const timer2 = setTimeout(updateTabPosition, 100);

    window.addEventListener("resize", updateTabPosition);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener("resize", updateTabPosition);
    };
  }, [activeTab]);

  const tabs: {
    id: InsightType;
    label: string;
    icon: React.ElementType;
    ref: React.RefObject<HTMLButtonElement>;
  }[] = [
    {
      id: "horror",
      label: isHalloweenMode ? "Horror Stories" : "Health Check",
      icon: Ghost,
      ref: horrorTabRef,
    },
    {
      id: "subscriptions",
      label: isHalloweenMode ? "Phantom Charges" : "Subscriptions",
      icon: Search,
      ref: subscriptionsTabRef,
    },
    {
      id: "forecast",
      label: isHalloweenMode ? "The Oracle" : "Forecast",
      icon: TrendingUp,
      ref: forecastTabRef,
    },
    {
      id: "allocation",
      label: isHalloweenMode ? "Potion Brewing" : "Allocation",
      icon: FlaskConical,
      ref: allocationTabRef,
    },
  ];

  const getButtonText = () => {
    if (isGhostWriting)
      return isHalloweenMode ? "Consulting Spirits..." : "Analyzing...";

    switch (activeTab) {
      case "subscriptions":
        return isHalloweenMode ? "Hunt Phantoms" : "Scan Subscriptions";
      case "forecast":
        return isHalloweenMode ? "Gaze into Crystal Ball" : "Generate Forecast";
      case "allocation":
        return isHalloweenMode ? "Brew Potion" : "Optimize Allocation";
      case "horror":
      default:
        return isHalloweenMode
          ? "Summon Financial Ghost"
          : "Check Financial Health";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl border p-6 transition-colors h-full ${
        isHalloweenMode
          ? "border-[rgba(96,201,182,0.4)]! bg-[#1a1a1f]/90 shadow-[0_0_15px_rgba(96,201,182,0.15)]!"
          : isDark
            ? "bg-[rgba(35,35,40,0.75)] backdrop-blur-lg border-[rgba(255,255,255,0.12)] shadow-xl"
            : "bg-white border-gray-200 shadow-lg"
      }`}
    >
      {/* Halloween Background */}
      {isHalloweenMode && (
        <div
          className="absolute inset-0 opacity-5 pointer-events-none z-0"
          style={{
            backgroundImage: `url(${[cardBlueCemetary, cardCatFence, cardHauntedHouse][Math.floor(Math.random() * 3)]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* Halloween Decorations */}
      {isHalloweenMode && (
        <>
          <motion.img
            src={batSwoop}
            alt=""
            className="absolute -top-2 -right-2 w-20 opacity-20 pointer-events-none"
            animate={{ y: [0, -5, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.img
            src={spiderCuteHanging}
            alt=""
            className="absolute top-0 left-10 w-10 opacity-30 pointer-events-none"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          />
        </>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col gap-6 mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div
            className={`p-2.5 rounded-xl ${
              isHalloweenMode
                ? "bg-[#60c9b6]/10 border border-[#60c9b6]/20"
                : "bg-blue-600/10 text-blue-600"
            }`}
          >
            {isHalloweenMode ? (
              <img
                src={ghostScare}
                alt="Ghost"
                className="w-7 h-7 object-contain"
              />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
          </div>
          <h3
            className={`text-xl font-bold ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            {isHalloweenMode ? "Financial Crypt" : "AI Financial Insights"}
          </h3>
        </div>

        {/* Tabs */}
        <div ref={tabsRef} className="relative grid grid-cols-2 gap-2 md:flex">
          {/* Sliding Background */}
          <motion.div
            className="absolute rounded-lg border"
            animate={{
              left: tabPosition.left,
              width: tabPosition.width,
              top: tabPosition.top,
              height: tabPosition.height,
              backgroundColor: isHalloweenMode
                ? "rgba(96,201,182,0.2)"
                : "rgba(59,130,246,0.1)",
              borderColor: isHalloweenMode
                ? "rgba(96,201,182,0.3)"
                : "rgba(59,130,246,0.2)",
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          />
          {isHalloweenMode && (
            <motion.div
              className="absolute rounded-lg"
              animate={{
                left: tabPosition.left,
                width: tabPosition.width,
                top: tabPosition.top,
                height: tabPosition.height,
                boxShadow: [
                  "0 0 8px rgba(96,201,182,0.25), inset 0 0 6px rgba(96,201,182,0.15)",
                  "0 0 12px rgba(96,201,182,0.35), inset 0 0 8px rgba(96,201,182,0.2)",
                  "0 0 8px rgba(96,201,182,0.25), inset 0 0 6px rgba(96,201,182,0.15)",
                ],
              }}
              transition={{
                left: { type: "spring", stiffness: 400, damping: 30 },
                width: { type: "spring", stiffness: 400, damping: 30 },
                top: { type: "spring", stiffness: 400, damping: 30 },
                height: { type: "spring", stiffness: 400, damping: 30 },
                boxShadow: {
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            />
          )}

          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={tab.ref}
              onClick={() => handleTabChange(tab.id)}
              className={`relative z-10 flex items-center justify-center md:justify-start gap-1.5 md:gap-2 px-2 py-2 md:px-4 rounded-lg text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? isHalloweenMode
                    ? "text-[#60c9b6]"
                    : "text-blue-600 dark:text-blue-400"
                  : isHalloweenMode
                    ? "text-gray-500 dark:text-[#B4B4B8] hover:text-[#60c9b6]"
                    : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 min-h-[120px]">
        <AnimatePresence mode="wait">
          {insight ? (
            <motion.div
              key="insight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <div
                className={`p-5 rounded-xl border text-sm leading-relaxed ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/5 border-[#60c9b6]/20 text-gray-300"
                    : "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <p className="whitespace-pre-line">{insight}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10"
            >
              <p
                className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                {isHalloweenMode
                  ? "The spirits are waiting to reveal your financial fate..."
                  : "Select an insight type and let AI analyze your finances."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center">
          <button
            onClick={() => generateInsight(activeTab)}
            disabled={isGhostWriting}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all text-sm cursor-pointer ${
              isHalloweenMode
                ? isGhostWriting
                  ? "bg-[#60c9b6]/5 text-[#60c9b6]/50 cursor-not-allowed"
                  : "bg-[#60c9b6]/20 text-[#60c9b6] hover:bg-[#60c9b6]/30 hover:shadow-[0_0_20px_rgba(96,201,182,0.25)]"
                : isGhostWriting
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : isDark
                    ? "bg-[rgba(59,130,246,0.2)] border border-[rgba(59,130,246,0.3)] text-[#3B82F6] hover:bg-[rgba(59,130,246,0.3)] shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            }`}
          >
            {isGhostWriting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {getButtonText()}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
