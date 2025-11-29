import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  List,
  Menu as MenuIcon,
  PanelRightClose,
  Search,
  Timer,
  Wallet,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ghostDroopy, pumpkinScary } from "@/assets";
import { NavbarDecorations } from "@/components/halloween/NavbarDecorations";
import {
  AnimatedThemeToggle,
  HalloweenAudioToggle,
  HalloweenToggle,
} from "@/components/theme";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/Avatar.tsx";
import { Button } from "@/components/ui/Button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu.tsx";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet.tsx";
import { useAuth } from "@/contexts/AuthContext";
import { useFloatingWidget } from "@/contexts/FloatingWidgetContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTimeTracking } from "@/hooks/tasks/useTimeTracking";
import { supabase } from "@/integrations/supabase/client";

const THEME_STYLES = {
  navbar: {
    dark: "bg-[rgba(20,20,25,0.7)] border-[rgba(255,255,255,0.1)]",
    light: "bg-white/90 border-slate-200",
  },
  logo: "bg-linear-to-br from-[#8B5CF6] to-[#7C3AED]",
  activeLink: "bg-[rgba(139,92,246,0.2)] text-[#8B5CF6]",
  inactiveLink: {
    dark: "text-[#B4B4B8] hover:text-[#E5E5E5] hover:bg-[rgba(255,255,255,0.08)]",
    light: "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
  },
  dropdown: {
    dark: "bg-[rgba(26,26,31,0.95)] border-[rgba(255,255,255,0.1)] text-slate-200",
    light: "bg-white border-slate-200 text-slate-800",
  },
  mobileSheet: {
    dark: "bg-[rgba(20,20,25,0.85)] border-l-[rgba(255,255,255,0.1)]",
    light: "bg-[rgba(250,250,252,0.85)] border-l-slate-200",
  },
} as const;

interface NavigationItem {
  id: string;
  icon: React.ElementType;
  label: string;
  path: string;
  color: string;
}

const navigationItems: NavigationItem[] = [
  { id: "tasks", icon: List, label: "Tasks", path: "/tasks", color: "#06B6D4" },
  { id: "time", icon: Timer, label: "Time", path: "/time", color: "#6366F1" },
  {
    id: "journal",
    icon: BookOpen,
    label: "Journal",
    path: "/journal",
    color: "#F59E0B",
  },
  {
    id: "budget",
    icon: Wallet,
    label: "Budget",
    path: "/budget",
    color: "#10B981",
  },
  {
    id: "notes",
    icon: FileText,
    label: "Notes",
    path: "/notes",
    color: "#EC4899",
  },
  {
    id: "accounts",
    icon: KeyRound,
    label: "Accounts",
    path: "/accounts",
    color: "#3B82F6",
  },
  {
    id: "pomodoro",
    icon: Clock,
    label: "Pomodoro",
    path: "/pomodoro",
    color: "#EF4444",
  },
] as const;

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDark, isHalloweenMode } = useTheme();
  const {
    isWidgetVisible,
    toggleWidget,
    isSearchModalOpen,
    setSearchModalOpen,
  } = useFloatingWidget();
  const { timeEntries } = useTimeTracking();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navContainerRef = useRef<HTMLDivElement>(null);
  const navItemRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});
  const [activeNavPosition, setActiveNavPosition] = useState({
    left: 0,
    width: 0,
  });

  const getActiveNavItem = () => {
    const currentPath = location.pathname;

    const exactMatch = navigationItems.find(
      (item) => currentPath === item.path,
    );
    if (exactMatch) return exactMatch.id;

    if (currentPath === "/") return "dashboard";

    return null;
  };

  const activeNavId = getActiveNavItem();

  useEffect(() => {
    const updateNavPosition = () => {
      const activeRef = navItemRefs.current[activeNavId];
      if (activeRef && navContainerRef.current) {
        const containerRect = navContainerRef.current.getBoundingClientRect();
        const activeRect = activeRef.getBoundingClientRect();
        setActiveNavPosition({
          left: activeRect.left - containerRect.left,
          width: activeRect.width,
        });
      }
    };

    const timer1 = setTimeout(updateNavPosition, 50);
    const timer2 = setTimeout(updateNavPosition, 100);
    const timer3 = setTimeout(updateNavPosition, 200);

    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateNavPosition();
      }, 150);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", debouncedResize);
    };
  }, [activeNavId]);

  useEffect(() => {
    const initializeNavPosition = () => {
      const activeRef = navItemRefs.current[activeNavId];
      if (activeRef && navContainerRef.current) {
        const containerRect = navContainerRef.current.getBoundingClientRect();
        const activeRect = activeRef.getBoundingClientRect();
        setActiveNavPosition({
          left: activeRect.left - containerRect.left,
          width: activeRect.width,
        });
      }
    };

    const timer = setTimeout(initializeNavPosition, 100);
    return () => clearTimeout(timer);
  }, [activeNavId]);

  const runningEntries = timeEntries.filter((entry) => entry.is_running);
  const hasRunningTimers = runningEntries.length > 0;

  const getThemeClasses = (
    darkClass: string,
    lightClass: string = darkClass,
  ) => (isDark ? darkClass : lightClass);

  const handleLogout = React.useCallback(async () => {
    try {
      console.log("Logging out...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [navigate]);

  const userInfo = React.useMemo(
    () => ({
      initial: user?.email ? user.email.charAt(0).toUpperCase() : "U",
      displayName:
        user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User",
      email: user?.email,
      avatarUrl: user?.user_metadata?.avatar_url,
    }),
    [user],
  );

  return (
    <motion.nav
      className={`relative inset-0 h-14 sm:h-16 top-0 left-0 border ${getThemeClasses(
        "bg-[rgba(20,20,25,0.7)] border-[rgba(255,255,255,0.1)]",
        "bg-white/90 border-slate-200",
      )} flex items-center justify-between px-2 sm:px-4 md:px-6 shadow-xs rounded-lg mx-2 sm:mx-4 md:mx-6 mt-2 sm:mt-3 backdrop-blur-md`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <NavbarDecorations />
      <Link
        to="/dashboard"
        className="relative z-10 flex items-center space-x-2 sm:space-x-3"
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
      </Link>

      {/* Desktop Navigation */}
      <div className="relative z-10 hidden lg:flex items-center space-x-1">
        <div ref={navContainerRef} className="relative flex space-x-1">
          {/* Sliding Background - Only show when there's an active nav item */}
          {activeNavId && activeNavPosition.width > 0 && (
            <>
              <motion.div
                className="absolute top-0 bottom-0 rounded-lg border"
                animate={{
                  left: activeNavPosition.left,
                  width: activeNavPosition.width,
                  backgroundColor: isHalloweenMode
                    ? "rgba(96,201,182,0.2)"
                    : "rgba(139,92,246,0.2)",
                  borderColor: isHalloweenMode
                    ? "rgba(96,201,182,0.3)"
                    : "rgba(139,92,246,0.3)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
              {/* Spooky pulsing glow effect for Halloween mode */}
              {isHalloweenMode && (
                <>
                  <motion.div
                    className="absolute top-0 bottom-0 rounded-lg"
                    style={{
                      boxShadow:
                        "0 0 8px rgba(96,201,182,0.25), inset 0 0 6px rgba(96,201,182,0.15)",
                    }}
                    animate={{
                      left: activeNavPosition.left,
                      width: activeNavPosition.width,
                      boxShadow: [
                        "0 0 8px rgba(96,201,182,0.25), inset 0 0 6px rgba(96,201,182,0.15)",
                        "0 0 12px rgba(96,201,182,0.35), inset 0 0 8px rgba(96,201,182,0.2)",
                        "0 0 8px rgba(96,201,182,0.25), inset 0 0 6px rgba(96,201,182,0.15)",
                      ],
                    }}
                    transition={{
                      left: { type: "spring", stiffness: 400, damping: 30 },
                      width: { type: "spring", stiffness: 400, damping: 30 },
                      boxShadow: {
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                  />
                  {/* Ghost floating on active menu */}
                  <motion.img
                    src={ghostDroopy}
                    alt=""
                    className="absolute w-5 h-5 opacity-30"
                    animate={{
                      left:
                        activeNavPosition.left +
                        activeNavPosition.width / 2 -
                        10,
                      top: -8,
                      y: [0, -4, 0],
                      opacity: [0.25, 0.35, 0.25],
                    }}
                    transition={{
                      left: { type: "spring", stiffness: 400, damping: 30 },
                      y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                      opacity: {
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                  />
                </>
              )}
            </>
          )}

          {navigationItems.map((item) => (
            <Link
              key={item.id}
              ref={(el) => {
                navItemRefs.current[item.id] = el;
              }}
              to={item.path}
              className={`relative z-10 flex items-center px-3 py-2 rounded-lg transition-all duration-200 group text-xs font-medium ${
                activeNavId === item.id
                  ? isHalloweenMode
                    ? "text-[#60c9b6]"
                    : "text-[#8B5CF6]"
                  : getThemeClasses(
                      isHalloweenMode
                        ? "text-[#B4B4B8] hover:text-[#60c9b6] hover:bg-[rgba(96,201,182,0.1)]"
                        : "text-[#B4B4B8] hover:text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.1)]",
                      isHalloweenMode
                        ? "text-slate-600 hover:text-[#60c9b6] hover:bg-[rgba(96,201,182,0.1)]"
                        : "text-slate-600 hover:text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.1)]",
                    )
              }`}
              aria-current={activeNavId === item.id ? "page" : undefined}
            >
              <item.icon
                className={`hidden xl:block w-5 h-5 mr-3 shrink-0 transition-colors ${
                  activeNavId === item.id
                    ? isHalloweenMode
                      ? "text-[#60c9b6]"
                      : "text-[#8B5CF6]"
                    : isHalloweenMode
                      ? "text-gray-400 group-hover:text-[#60c9b6]"
                      : "text-gray-400 group-hover:text-[#8B5CF6]"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

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

        {/* Mobile Search Icon - visible only on small screens */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSearchModalOpen(true)}
          className={`lg:hidden h-8 w-8 ${
            isHalloweenMode
              ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
              : isDark
                ? "text-gray-400 hover:bg-white/10"
                : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Search className="w-4 h-4" />
        </Button>

        {/* Search Trigger */}
        <motion.div
          layoutId="search-modal-expand"
          onClick={() => setSearchModalOpen(true)}
          className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-text transition-colors w-64 ${
            isHalloweenMode
              ? "bg-[#60c9b6]/10 border-[#60c9b6]/30 text-[#60c9b6] hover:bg-[#60c9b6]/20"
              : isDark
                ? "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300"
                : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          }`}
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="text-xs flex-1 text-left">Search...</span>
          <kbd
            className={`hidden xl:inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 ${
              isHalloweenMode
                ? "bg-[#60c9b6]/20 border-[#60c9b6]/30 text-[#60c9b6]"
                : isDark
                  ? "bg-white/10 border-white/10 text-gray-400"
                  : "bg-gray-100 border-gray-200 text-gray-500"
            }`}
          >
            <span className="text-sm">⌘</span>
            <span className="text-base">K</span>
          </kbd>
        </motion.div>

        {hasRunningTimers && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleWidget}
            className={`hidden lg:flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              isWidgetVisible
                ? isHalloweenMode
                  ? "bg-[#F59E0B]/20 text-[#F59E0B] hover:bg-[#F59E0B]/30 hover:text-[#F59E0B]"
                  : "bg-[rgba(245,158,11,0.2)] text-[#F59E0B] hover:bg-[rgba(245,158,11,0.3)] hover:text-[#F59E0B]"
                : isHalloweenMode
                  ? "bg-[#60c9b6]/20 text-[#60c9b6] hover:bg-[#60c9b6]/30 hover:text-[#60c9b6]"
                  : "bg-[rgba(16,185,129,0.2)] text-[#10B981] hover:bg-[rgba(16,185,129,0.3)] hover:text-[#10B981]"
            }`}
            title={isWidgetVisible ? "Hide Timer Widget" : "Show Timer Widget"}
          >
            {isWidgetVisible ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            <span className="text-xs">
              {runningEntries.length} Timer
              {runningEntries.length !== 1 ? "s" : ""}
            </span>
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0 cursor-pointer"
            >
              <Avatar className="h-7 w-7 sm:h-9 sm:w-9">
                <AvatarImage
                  src={userInfo.avatarUrl}
                  alt={userInfo.email || "User"}
                />
                <AvatarFallback
                  className={`${THEME_STYLES.logo} text-white font-medium text-sm sm:text-base`}
                >
                  {userInfo.initial}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={`w-56 mt-2 ${getThemeClasses(
              THEME_STYLES.dropdown.dark,
              THEME_STYLES.dropdown.light,
            )} backdrop-blur-md`}
            align="end"
            forceMount
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p
                  className={`text-sm font-medium leading-none ${getThemeClasses("text-white", "text-slate-900")}`}
                >
                  {userInfo.displayName}
                </p>
                <p
                  className={`text-xs leading-none ${getThemeClasses("text-slate-400", "text-slate-500")}`}
                >
                  {userInfo.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator
              className={`${isDark ? "bg-[rgba(255,255,255,0.1)]" : "bg-slate-200"}`}
            />
            <DropdownMenuItem
              onClick={handleLogout}
              className={`cursor-pointer text-red-500 ${isDark ? "hover:bg-red-500/60" : "hover:bg-red-500/10!"}`}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile/Tablet Hamburger Menu */}
        <div className="lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                  isDark
                    ? "hover:bg-[rgba(255,255,255,0.1)] text-[#B4B4B8]"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
                aria-label="Open navigation menu"
              >
                <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              hideClose
              className={`w-[260px] p-3 flex flex-col ${getThemeClasses(
                THEME_STYLES.mobileSheet.dark,
                THEME_STYLES.mobileSheet.light,
              )} backdrop-blur-xl rounded-l-2xl`}
            >
              <SheetHeader
                className={`p-3 mb-2 pb-3 border-b ${isDark ? "border-[rgba(255,255,255,0.1)]" : "border-slate-200"}`}
              >
                <SheetTitle className="flex items-center space-x-2">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2"
                  >
                    <motion.div
                      className={`${THEME_STYLES.logo} h-8 w-8 rounded-lg flex items-center justify-center`}
                    >
                      <span className="text-white font-bold text-base font-['Outfit']">
                        IG
                      </span>
                    </motion.div>
                    <h1 className="text-xl font-semibold tracking-tight font-['Outfit'] text-purple-600">
                      Integral
                    </h1>
                  </Link>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Navigation menu for accessing different sections of the
                  application
                </SheetDescription>
              </SheetHeader>
              <nav className="grow px-2 space-y-1.5 overflow-y-auto scrollbar-hide">
                {navigationItems.map((item) => {
                  const isActive = activeNavId === item.id;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-base ${
                        isActive
                          ? "bg-[rgba(139,92,246,0.2)] text-[#8B5CF6] border border-[rgba(139,92,246,0.3)]"
                          : `text-slate-400 hover:text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.1)] ${
                              isDark ? "text-slate-300" : "text-slate-600"
                            }`
                      }`}
                    >
                      <item.icon
                        className="w-5 h-5 mr-3 transition-colors"
                        style={{ color: item.color }}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                {hasRunningTimers && (
                  <div className="pt-3 mt-2 border-t border-[rgba(255,255,255,0.1)]">
                    <button
                      onClick={() => {
                        toggleWidget();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-colors text-base ${
                        isWidgetVisible
                          ? "bg-[rgba(245,158,11,0.2)] text-[#F59E0B] hover:bg-[rgba(245,158,11,0.3)]"
                          : "bg-[rgba(16,185,129,0.2)] text-[#10B981] hover:bg-[rgba(16,185,129,0.3)]"
                      }`}
                    >
                      {isWidgetVisible ? (
                        <EyeOff className="w-5 h-5 mr-3" />
                      ) : (
                        <Eye className="w-5 h-5 mr-3" />
                      )}
                      <span>
                        {isWidgetVisible ? "Hide" : "Show"} Timer Widget (
                        {runningEntries.length})
                      </span>
                    </button>
                  </div>
                )}
              </nav>
              <div
                className={`px-2 py-3 border-t ${isDark ? "border-[rgba(255,255,255,0.1)]" : "border-slate-200"}`}
              >
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`h-11 w-11 rounded-xl ${
                      isDark
                        ? "bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <PanelRightClose className="h-5 w-5" />
                  </Button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex-1 flex items-center justify-center px-3 py-2.5 rounded-xl transition-colors text-base font-medium ${
                      isDark
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                    }`}
                  >
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
};
