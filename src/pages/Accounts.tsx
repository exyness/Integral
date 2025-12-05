import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  ChevronDown,
  Eye,
  EyeOff,
  Folder as FolderIcon,
  FolderPlus,
  Grid,
  KeyRound,
  List,
  Plus,
  Search,
} from "lucide-react";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Virtuoso, VirtuosoGrid } from "react-virtuoso";
import { toast } from "sonner";
import {
  batSwoop,
  cardPumpkinsStaring,
  clCartoonManor,
  ghostScare,
  pumpkinSneaky,
  pumpkinWitchhat,
  spiderCuteHanging,
  webNormal,
} from "../assets";
import { AccountUsageCalendar } from "../components/accounts/AccountUsageCalendar";
import { CreateAccountModal } from "../components/accounts/CreateAccountModal";
import { DeleteAccountModal } from "../components/accounts/DeleteAccountModal";
import { EditAccountModal } from "../components/accounts/EditAccountModal";
import { LogUsageModal } from "../components/accounts/LogUsageModal";
import { UsageActivityView } from "../components/accounts/UsageActivityView";
import { ViewAccountModal } from "../components/accounts/ViewAccountModal";
import { CreateFolderModal } from "../components/folders/CreateFolderModal";
import { FolderSidebar } from "../components/folders/FolderSidebar";
import { GlassCard } from "../components/GlassCard";
import { AccountsPageSkeleton } from "../components/skeletons/AccountSkeletons";
import { Button } from "../components/ui/Button.tsx";
import { ConfirmationModal } from "../components/ui/ConfirmationModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/DropdownMenu.tsx";
import { useTheme } from "../contexts/ThemeContext";
import { useAccounts } from "../hooks/useAccounts";
import { Folder, useFolders } from "../hooks/useFolders";
import {
  Account,
  CreateAccountData,
  LogUsageData,
  UpdateAccountData,
} from "../types/account";

type TabType = "accounts" | "activity" | "calendar";

// Define Virtuoso components outside the main component to prevent re-renders
const VirtuosoGridList = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ style, children, ...props }, ref) => (
  <div
    ref={ref}
    {...props}
    style={style}
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3"
  >
    {children}
  </div>
));
VirtuosoGridList.displayName = "VirtuosoGridList";

const VirtuosoGridItem: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...props
}) => (
  <div {...props} className="min-w-0">
    {children}
  </div>
);

export const Accounts: React.FC = () => {
  const { isDark, isHalloweenMode } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = (searchParams.get("tab") as TabType) || "accounts";
  const [activeTab, setActiveTab] = useState<TabType>(tabFromUrl);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [showDeleteFolder, setShowDeleteFolder] = useState(false);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showViewAccount, setShowViewAccount] = useState(false);
  const [showEditAccount, setShowEditAccount] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showLogUsage, setShowLogUsage] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const tabsRef = useRef<HTMLDivElement>(null);
  const accountsTabRef = useRef<HTMLButtonElement>(null);
  const activityTabRef = useRef<HTMLButtonElement>(null);
  const calendarTabRef = useRef<HTMLButtonElement>(null);
  const [tabPosition, setTabPosition] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[placeholder*="Search"]',
        ) as HTMLInputElement;
        searchInput?.focus();
      }

      if (e.key === "Escape" && searchQuery) {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement?.tagName === "INPUT") {
          setSearchQuery("");
          activeElement.blur();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery]);

  const { folders, createFolder, deleteFolder, updateFolder } =
    useFolders("account");
  const {
    accounts,
    usageLogs,
    loading,
    createAccount,
    updateAccount,
    deleteAccount,
    logUsage,
    updateUsageLog,
    deleteUsageLog,
    getAccountUsagePercentage,
  } = useAccounts();

  useEffect(() => {
    const initializeTabPosition = () => {
      const currentTab = accountsTabRef.current;
      if (currentTab && tabsRef.current) {
        const tabsRect = tabsRef.current.getBoundingClientRect();
        const activeRect = currentTab.getBoundingClientRect();
        setTabPosition({
          left: activeRect.left - tabsRect.left,
          width: activeRect.width,
        });
      }
    };

    const timer = setTimeout(initializeTabPosition, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateTabPosition = () => {
      let currentTab: HTMLButtonElement | null;
      switch (activeTab) {
        case "accounts":
          currentTab = accountsTabRef.current;
          break;
        case "activity":
          currentTab = activityTabRef.current;
          break;
        case "calendar":
          currentTab = calendarTabRef.current;
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
        });
      }
    };

    const timer1 = setTimeout(updateTabPosition, 50);
    const timer2 = setTimeout(updateTabPosition, 100);
    const timer3 = setTimeout(updateTabPosition, 200);

    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateTabPosition();
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
  }, [activeTab]);

  const handleCreateFolder = async (name: string, color: string) => {
    try {
      await createFolder(name, color);
      toast.success(`Folder "${name}" created successfully`);
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast.error("Failed to create folder. Please try again.");
    }
  };

  const handleEditFolder = async (name: string, color: string) => {
    if (!editingFolder) return;

    try {
      await updateFolder(editingFolder.id, { name, color });
      toast.success(`Folder "${name}" updated successfully`);
      setEditingFolder(null);
    } catch (error) {
      console.error("Failed to update folder:", error);
      toast.error("Failed to update folder. Please try again.");
    }
  };

  const handleDeleteFolder = async () => {
    if (selectedFolder) {
      const folderName = selectedFolderData?.name || "folder";
      setIsDeletingFolder(true);
      try {
        await deleteFolder(selectedFolder);
        toast.success(`Folder "${folderName}" deleted successfully`);
        setShowDeleteFolder(false);
        setSelectedFolder(null);
      } catch (error) {
        console.error("Failed to delete folder:", error);
        toast.error("Failed to delete folder. Please try again.");
      } finally {
        setIsDeletingFolder(false);
      }
    }
  };

  const handleCreateAccount = async (accountData: CreateAccountData) => {
    try {
      await createAccount({
        ...accountData,
        folder_id: selectedFolder || undefined,
      });
      toast.success(`Account "${accountData.title}" created successfully`);
    } catch (error) {
      console.error("Failed to create account:", error);
      toast.error("Failed to create account. Please try again.");
    }
  };

  const handleViewAccount = (account: Account) => {
    setSelectedAccount(account);
    setShowViewAccount(true);
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setShowViewAccount(false);
    setShowEditAccount(true);
  };

  const handleUpdateAccount = async (
    accountId: string,
    data: UpdateAccountData,
  ) => {
    try {
      await updateAccount(accountId, data);
      const accountTitle =
        accounts.find((acc) => acc.id === accountId)?.title || "Account";
      toast.success(`Account "${accountTitle}" updated successfully`);
      setShowEditAccount(false);
    } catch (error) {
      console.error("Failed to update account:", error);
      toast.error("Failed to update account. Please try again.");
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId);
    if (account) {
      setSelectedAccount(account);
      setShowDeleteAccount(true);
    }
  };

  const confirmDeleteAccount = async () => {
    if (!selectedAccount) return;

    try {
      await deleteAccount(selectedAccount.id);
      toast.success(`Account "${selectedAccount.title}" deleted successfully`);
      setShowDeleteAccount(false);
      setShowViewAccount(false);
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account. Please try again.");
    }
  };

  const handleLogUsage = async (usageData: LogUsageData) => {
    try {
      await logUsage(usageData);
    } catch (error) {
      console.error("Failed to log usage:", error);
    }
  };

  const foldersWithCount = folders.map((folder) => ({
    id: folder.id,
    name: folder.name,
    color: folder.color,
    count: accounts.filter((account) => account.folder_id === folder.id).length,
  }));

  const selectedFolderData = foldersWithCount.find(
    (f) => f.id === selectedFolder,
  );

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.platform?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email_username
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      account.tags?.some((tag) =>
        tag?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    const matchesFolder =
      !selectedFolder || account.folder_id === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const maskEmail = (email: string) => {
    if (!showSensitiveInfo) {
      if (email.includes("@")) {
        const [username, domain] = email.split("@");
        if (username && domain) {
          const maskedUsername =
            username.slice(0, 2) +
            "*".repeat(Math.max(0, username.length - 4)) +
            username.slice(-2);
          return `${maskedUsername}@${domain}`;
        }
      }
      if (email.length > 4) {
        return (
          email.slice(0, 2) +
          "*".repeat(Math.max(0, email.length - 4)) +
          email.slice(-2)
        );
      }
      return "*".repeat(email.length);
    }
    return email;
  };

  const getUsageColor = (account: Account) => {
    const percentage = getAccountUsagePercentage(account);
    if (percentage >= 90) return "text-red-400";
    if (percentage >= 70) return "text-yellow-400";
    return "text-green-400";
  };

  const getActiveFolderColor = () => {
    if (isHalloweenMode) return "#60c9b6";
    if (!selectedFolder) {
      return "#8B5CF6";
    }
    const activeFolder = folders.find((f) => f.id === selectedFolder);
    return activeFolder?.color || "#8B5CF6";
  };

  const getLogUsageColor = () => {
    if (isHalloweenMode) return "#60c9b6";
    const folderColor = getActiveFolderColor();
    if (folderColor === "#8B5CF6") return "#10B981";
    if (folderColor === "#EF4444") return "#F59E0B";
    if (folderColor === "#F59E0B") return "#3B82F6";
    if (folderColor === "#10B981") return "#EF4444";
    if (folderColor === "#3B82F6") return "#EC4899";
    if (folderColor === "#EC4899") return "#10B981";
    return "#10B981";
  };

  const activeFolderColor = getActiveFolderColor();
  const logUsageColor = getLogUsageColor();

  const getTabDescription = () => {
    switch (activeTab) {
      case "accounts":
        return "Manage and track all your accounts in one place";
      case "activity":
        return "View and analyze your account usage history";
      case "calendar":
        return "Visualize your account usage patterns over time";
      default:
        return "Manage and track all your accounts in one place";
    }
  };

  if (loading && accounts.length === 0) {
    return <AccountsPageSkeleton viewMode={viewMode} activeTab={activeTab} />;
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <div className="mb-6 pt-4 md:pt-0">
        <div
          className={`relative overflow-hidden md:p-6 md:rounded-xl md:backdrop-blur-xl md:border ${
            isDark
              ? "md:bg-[rgba(26,26,31,0.6)] md:border-[rgba(255,255,255,0.1)]"
              : "md:bg-white/90 md:border-gray-200/60 md:shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
          } ${
            isHalloweenMode
              ? "md:border-[rgba(96,201,182,0.2)] md:shadow-[0_0_20px_rgba(96,201,182,0.15)]"
              : ""
          } group`}
        >
          {isHalloweenMode && (
            <>
              {/* Background Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-5 z-0"
                style={{
                  backgroundImage: `url(${clCartoonManor})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "grayscale(100%)",
                }}
              />

              {/* Flying Bat Animation */}
              <motion.img
                src={batSwoop}
                alt=""
                className="absolute w-12 h-12 md:w-16 md:h-16 opacity-60 pointer-events-none z-0"
                initial={{ x: "-10%", y: "20%", rotate: -10 }}
                animate={{
                  x: ["-10%", "110%"],
                  y: ["20%", "40%", "10%"],
                  rotate: [-10, 10, -5],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 2,
                }}
              />

              {/* Peeking Pumpkin */}
              <motion.img
                src={pumpkinWitchhat}
                alt=""
                className="absolute -bottom-4 -right-2 w-16 h-16 md:w-20 md:h-20 opacity-80 pointer-events-none z-10"
                initial={{ y: 20, rotate: 10 }}
                animate={{
                  y: [20, 0, 20],
                  rotate: [10, 0, 10],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Spider Web */}
              <img
                src={webNormal}
                alt=""
                className="absolute left-1/2 top-8 -translate-x-1/2 -translate-y-1/3 w-24 h-24 md:w-36 md:h-36 opacity-30 pointer-events-none"
              />

              {/* Spider web thread */}
              <motion.div
                className="absolute left-1/2 top-1 -translate-x-1/2 -translate-y-1/2 w-px bg-[#60c9b6] opacity-30 pointer-events-none"
                initial={{ top: "0%", height: "0%" }}
                animate={{ top: "0%", height: "30%" }}
                transition={{ duration: 2, ease: "easeOut" }}
              />

              {/* Cute Spider Hanging */}
              <motion.img
                src={spiderCuteHanging}
                alt=""
                className="absolute left-1/2 top-1 -translate-x-1/2 -translate-y-1/2 right-20 w-8 md:w-10 opacity-60 pointer-events-none z-10"
                initial={{ top: "0%", opacity: 0 }}
                animate={{
                  top: "30%",
                  opacity: 0.6,
                  y: [0, 5, 0],
                }}
                transition={{
                  top: { duration: 2, ease: "easeOut" },
                  opacity: { duration: 1 },
                  y: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                  },
                }}
              />
            </>
          )}
          <div className="relative z-10 flex items-start justify-between gap-3 mb-1.5">
            {/* Ghost appearing on hover */}
            {isHalloweenMode && (
              <motion.img
                src={ghostScare}
                alt=""
                className="absolute -top-6 -left-6 w-10 h-10 opacity-0 transition-opacity duration-300 group-hover:opacity-60 pointer-events-none rotate-12"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            <h1
              className={`text-xl md:text-2xl font-bold ${
                isHalloweenMode
                  ? "font-creepster tracking-wider text-[#60c9b6] drop-shadow-[0_2px_4px_rgba(96,201,182,0.3)]"
                  : activeTab === "accounts"
                    ? "text-[#8B5CF6]"
                    : activeTab === "activity"
                      ? "text-[#10B981]"
                      : "text-[#F59E0B]"
              }`}
            >
              Account Manager
            </h1>
            {/* Desktop Action Buttons */}
            {(activeTab === "accounts" || activeTab === "activity") && (
              <div className="hidden lg:flex items-center gap-2">
                {activeTab === "activity" ? (
                  <motion.button
                    onClick={() => setShowLogUsage(true)}
                    className="flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium shrink-0"
                    disabled={accounts.length === 0}
                    style={{
                      backgroundColor: `${logUsageColor}20`,
                      borderColor: `${logUsageColor}50`,
                      color: logUsageColor,
                      border: `1px solid ${logUsageColor}50`,
                    }}
                    onMouseEnter={(e) => {
                      if (accounts.length !== 0) {
                        e.currentTarget.style.backgroundColor = `${logUsageColor}30`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = `${logUsageColor}20`;
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Log</span>
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      onClick={() => setShowLogUsage(true)}
                      className="flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium shrink-0"
                      disabled={accounts.length === 0}
                      style={{
                        backgroundColor: `${logUsageColor}20`,
                        borderColor: `${logUsageColor}50`,
                        color: logUsageColor,
                        border: `1px solid ${logUsageColor}50`,
                      }}
                      onMouseEnter={(e) => {
                        if (accounts.length !== 0) {
                          e.currentTarget.style.backgroundColor = `${logUsageColor}30`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${logUsageColor}20`;
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log Usage</span>
                    </motion.button>
                    <motion.button
                      onClick={() => setShowCreateAccount(true)}
                      className="flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0"
                      style={{
                        backgroundColor: `${activeFolderColor}20`,
                        borderColor: `${activeFolderColor}50`,
                        color: activeFolderColor,
                        border: `1px solid ${activeFolderColor}50`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${activeFolderColor}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${activeFolderColor}20`;
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Account</span>
                    </motion.button>
                  </>
                )}
              </div>
            )}
          </div>
          <p
            className={`text-xs ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
          >
            {getTabDescription()}
          </p>

          {/* Mobile Action Buttons - Below Description */}
          {(activeTab === "accounts" || activeTab === "activity") && (
            <div className="flex lg:hidden items-center gap-2 mt-3">
              {activeTab === "activity" ? (
                <motion.button
                  onClick={() => setShowLogUsage(true)}
                  className="flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium shrink-0"
                  disabled={accounts.length === 0}
                  style={{
                    backgroundColor: `${logUsageColor}20`,
                    borderColor: `${logUsageColor}50`,
                    color: logUsageColor,
                    border: `1px solid ${logUsageColor}50`,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Log</span>
                </motion.button>
              ) : (
                <>
                  <motion.button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0"
                    style={{
                      backgroundColor: `${activeFolderColor}20`,
                      borderColor: `${activeFolderColor}50`,
                      color: activeFolderColor,
                      border: `1px solid ${activeFolderColor}50`,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FolderIcon className="w-3.5 h-3.5" />
                    <span>Show Folders</span>
                  </motion.button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        className="flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0"
                        style={{
                          backgroundColor: `${activeFolderColor}20`,
                          borderColor: `${activeFolderColor}50`,
                          color: activeFolderColor,
                          border: `1px solid ${activeFolderColor}50`,
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>New</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className={`${isDark ? "bg-[rgba(26,26,31,0.95)] border-[rgba(255,255,255,0.1)]" : "bg-white border-gray-200"} backdrop-blur-md`}
                    >
                      <DropdownMenuItem
                        onClick={() => setShowCreateAccount(true)}
                        className={`cursor-pointer ${isDark ? "hover:bg-[rgba(255,255,255,0.05)]" : "hover:bg-gray-100"}`}
                      >
                        <KeyRound
                          className="w-4 h-4 mr-2"
                          style={{ color: activeFolderColor }}
                        />
                        <span>New Account</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowLogUsage(true)}
                        disabled={accounts.length === 0}
                        className={`cursor-pointer ${isDark ? "hover:bg-[rgba(255,255,255,0.05)]" : "hover:bg-gray-100"}`}
                      >
                        <Activity
                          className="w-4 h-4 mr-2"
                          style={{ color: logUsageColor }}
                        />
                        <span>Log Usage</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowCreateFolder(true)}
                        className={`cursor-pointer ${isDark ? "hover:bg-[rgba(255,255,255,0.05)]" : "hover:bg-gray-100"}`}
                      >
                        <FolderPlus
                          className="w-4 h-4 mr-2"
                          style={{ color: activeFolderColor }}
                        />
                        <span>New Folder</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 md:mb-8">
        <div ref={tabsRef} className="relative flex space-x-1 sm:space-x-2">
          <motion.div
            className="absolute top-0 bottom-0 rounded-lg border"
            animate={{
              left: tabPosition.left,
              width: tabPosition.width,
              backgroundColor: isHalloweenMode
                ? "rgba(96,201,182,0.2)"
                : activeTab === "accounts"
                  ? "rgba(139,92,246,0.2)"
                  : activeTab === "activity"
                    ? "rgba(16,185,129,0.2)"
                    : "rgba(245,158,11,0.2)",
              borderColor: isHalloweenMode
                ? "rgba(96,201,182,0.3)"
                : activeTab === "accounts"
                  ? "rgba(139,92,246,0.3)"
                  : activeTab === "activity"
                    ? "rgba(16,185,129,0.3)"
                    : "rgba(245,158,11,0.3)",
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          />

          <button
            ref={accountsTabRef}
            onClick={() => handleTabChange("accounts")}
            className={`relative z-10 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
              activeTab === "accounts"
                ? isHalloweenMode
                  ? "text-[#60c9b6]"
                  : "text-[#8B5CF6]"
                : isDark
                  ? isHalloweenMode
                    ? "text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                    : "text-[#B4B4B8] hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8B5CF6]"
                  : isHalloweenMode
                    ? "text-gray-600 hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                    : "text-gray-600 hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8B5CF6]"
            }`}
          >
            <KeyRound className="w-4 h-4 inline mr-1 sm:mr-2" />
            Accounts
          </button>
          <button
            ref={activityTabRef}
            onClick={() => handleTabChange("activity")}
            className={`relative z-10 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
              activeTab === "activity"
                ? isHalloweenMode
                  ? "text-[#60c9b6]"
                  : "text-[#10B981]"
                : isDark
                  ? isHalloweenMode
                    ? "text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                    : "text-[#B4B4B8] hover:bg-[rgba(16,185,129,0.1)] hover:text-[#10B981]"
                  : isHalloweenMode
                    ? "text-gray-600 hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                    : "text-gray-600 hover:bg-[rgba(16,185,129,0.1)] hover:text-[#10B981]"
            }`}
          >
            <Activity className="w-4 h-4 inline mr-1 sm:mr-2" />
            Activity
          </button>
          <button
            ref={calendarTabRef}
            onClick={() => handleTabChange("calendar")}
            className={`relative z-10 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
              activeTab === "calendar"
                ? isHalloweenMode
                  ? "text-[#60c9b6]"
                  : "text-[#F59E0B]"
                : isDark
                  ? isHalloweenMode
                    ? "text-[#B4B4B8] hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                    : "text-[#B4B4B8] hover:bg-[rgba(245,158,11,0.1)] hover:text-[#F59E0B]"
                  : isHalloweenMode
                    ? "text-gray-600 hover:bg-[rgba(96,201,182,0.1)] hover:text-[#60c9b6]"
                    : "text-gray-600 hover:bg-[rgba(245,158,11,0.1)] hover:text-[#F59E0B]"
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-1 sm:mr-2" />
            Calendar
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "activity" ? (
        <UsageActivityView
          usageLogs={usageLogs}
          accounts={accounts}
          onDeleteLog={(logId) => setLogToDelete(logId)}
          onUpdateLog={async (logId, amount, description) => {
            await updateUsageLog(logId, { amount, description });
          }}
        />
      ) : activeTab === "calendar" ? (
        <GlassCard variant="secondary" className="overflow-hidden">
          <AccountUsageCalendar
            accounts={accounts}
            usageLogs={usageLogs}
            onAccountClick={handleViewAccount}
            onLogClick={(log) => {
              const account = accounts.find((a) => a.id === log.account_id);
              if (account) {
                handleViewAccount(account);
              }
            }}
            onDateClick={(dateKey) => {
              handleTabChange("activity");
            }}
          />
        </GlassCard>
      ) : (
        <div className="flex h-[calc(100vh-120px)] lg:h-[calc(100vh-280px)] relative">
          {/* Mobile Sidebar Overlay */}
          {isMobileSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          {/* Sidebar - Hidden on mobile, slides in when opened */}
          <div
            className={`
              ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
              lg:translate-x-0 lg:relative
              fixed left-0 top-0 h-full z-50 lg:-mt-3 lg:z-auto
              transition-transform duration-300 ease-in-out
              lg:block
            `}
          >
            <FolderSidebar
              folders={foldersWithCount}
              selectedFolder={selectedFolder}
              onFolderSelect={(folderId) => {
                setSelectedFolder(folderId);
                setIsMobileSidebarOpen(false);
              }}
              onCreateFolder={() => setShowCreateFolder(true)}
              onEditFolder={() => {
                const folderToEdit = folders.find(
                  (f) => f.id === selectedFolder,
                );
                if (folderToEdit) {
                  setEditingFolder(folderToEdit);
                  setShowCreateFolder(true);
                }
              }}
              onDeleteFolder={() => setShowDeleteFolder(true)}
              totalCount={accounts.length}
              type="accounts"
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          </div>

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Search Bar Section - Full Width */}
            <motion.div
              className="lg:px-4 pt-1 pb-3 lg:py-3 mb-2 lg:-mt-3 space-y-2"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Row 1: Search + View Mode (Desktop has Eye icon too) */}
              <div className="flex items-center gap-2">
                {/* Search bar - wider on mobile */}
                <div className="relative flex-1">
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${searchQuery ? activeFolderColor : isDark ? "text-[#71717A]" : "text-gray-500"}`}
                    style={
                      searchQuery ? { color: activeFolderColor } : undefined
                    }
                  />
                  <input
                    type="text"
                    placeholder="Search accounts, platforms, emails... (Ctrl+K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 pr-10 py-1.5 lg:py-2 rounded-lg w-full text-sm focus:outline-hidden transition-colors ${isDark ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A]" : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"}`}
                    style={
                      {
                        "--tw-ring-color": activeFolderColor,
                      } as React.CSSProperties
                    }
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = activeFolderColor;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgb(209, 213, 219)";
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md transition-all hover:scale-110 active:scale-95 ${isDark ? "hover:bg-[rgba(255,255,255,0.1)]" : "hover:bg-gray-100"}`}
                      style={{ color: activeFolderColor }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Eye toggle button - Desktop only */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                  className={`hidden lg:flex h-8 px-3 text-sm transition-colors rounded-lg ${showSensitiveInfo ? "" : `${isDark ? "text-[#B4B4B8] hover:text-white" : "text-gray-600 hover:text-gray-900"}`}`}
                  style={{
                    backgroundColor: showSensitiveInfo
                      ? `${activeFolderColor}30`
                      : "transparent",
                    color: showSensitiveInfo ? activeFolderColor : undefined,
                  }}
                  title={
                    showSensitiveInfo
                      ? "Hide sensitive info"
                      : "Show sensitive info"
                  }
                >
                  {showSensitiveInfo ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>

                {/* View mode toggle - smaller on mobile */}
                <div
                  className={`flex rounded-lg p-0.5 lg:p-1 ${isDark ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)]" : "bg-gray-100 border border-gray-200"}`}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`h-7 lg:h-8 px-2 lg:px-3 transition-colors rounded ${viewMode === "grid" ? "" : `${isDark ? "text-[#B4B4B8] hover:text-white" : "text-gray-600 hover:text-gray-900"}`}`}
                    style={{
                      backgroundColor:
                        viewMode === "grid"
                          ? `${activeFolderColor}30`
                          : "transparent",
                      color:
                        viewMode === "grid" ? activeFolderColor : undefined,
                    }}
                  >
                    <Grid className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`h-7 lg:h-8 px-2 lg:px-3 transition-colors rounded ${viewMode === "list" ? "" : `${isDark ? "text-[#B4B4B8] hover:text-white" : "text-gray-600 hover:text-gray-900"}`}`}
                    style={{
                      backgroundColor:
                        viewMode === "list"
                          ? `${activeFolderColor}30`
                          : "transparent",
                      color:
                        viewMode === "list" ? activeFolderColor : undefined,
                    }}
                  >
                    <List className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </div>
              </div>

              {/* Row 2: Show/Hide pill - Mobile only */}
              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                  className={`h-6 px-2.5 text-[10px] transition-colors rounded-full ${showSensitiveInfo ? "" : `${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}`}
                  style={{
                    backgroundColor: showSensitiveInfo
                      ? `${activeFolderColor}20`
                      : isDark
                        ? "rgba(40,40,45,0.6)"
                        : "rgb(243, 244, 246)",
                    color: showSensitiveInfo ? activeFolderColor : undefined,
                    border: `1px solid ${showSensitiveInfo ? `${activeFolderColor}50` : isDark ? "rgba(255,255,255,0.1)" : "rgb(229, 231, 235)"}`,
                  }}
                >
                  {showSensitiveInfo ? (
                    <>
                      <EyeOff className="w-3 h-3 mr-1" />
                      <span>Hide Info</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3 mr-1" />
                      <span>Show Info</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>

            <div className="flex-1 min-h-0">
              {filteredAccounts.length === 0 ? (
                <div className="relative overflow-hidden rounded-xl min-h-[400px] flex items-center justify-center p-8">
                  {isHalloweenMode && (
                    <>
                      <motion.img
                        src={ghostScare}
                        alt=""
                        className="absolute top-8 left-8 w-16 md:w-20 opacity-12 pointer-events-none z-0"
                        style={{
                          filter:
                            "drop-shadow(0 0 20px rgba(96, 201, 182, 0.4))",
                        }}
                        animate={{
                          y: [0, -10, 0],
                          opacity: [0.12, 0.18, 0.12],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <motion.img
                        src={spiderCuteHanging}
                        alt=""
                        className="absolute top-8 right-8 w-14 md:w-16 opacity-15 pointer-events-none z-0"
                        style={{
                          filter:
                            "drop-shadow(0 0 15px rgba(245, 158, 11, 0.4))",
                        }}
                        animate={{
                          rotate: [-5, 5, -5],
                          y: [0, 5, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </>
                  )}
                  <motion.div
                    className="relative z-10 text-center max-w-md mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {isHalloweenMode ? (
                      <motion.img
                        src={pumpkinWitchhat}
                        alt=""
                        className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-5 opacity-80"
                        style={{
                          filter:
                            "drop-shadow(0 0 30px rgba(245, 158, 11, 0.5))",
                        }}
                        animate={{
                          y: [0, -8, 0],
                          rotate: [-3, 3, -3],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    ) : (
                      <div
                        className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-5 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: `${activeFolderColor}10`,
                          borderWidth: "2px",
                          borderStyle: "solid",
                          borderColor: `${activeFolderColor}30`,
                        }}
                      >
                        <KeyRound
                          className="w-10 h-10 md:w-12 md:h-12"
                          style={{ color: activeFolderColor }}
                        />
                      </div>
                    )}
                    <h3
                      className={`text-lg md:text-xl font-bold mb-2 ${
                        isHalloweenMode
                          ? "text-[#60c9b6] font-creepster tracking-wide"
                          : isDark
                            ? "text-white"
                            : "text-gray-900"
                      }`}
                    >
                      {searchQuery
                        ? isHalloweenMode
                          ? "No Enchanted Vaults Found"
                          : "No accounts found"
                        : isHalloweenMode
                          ? "No Cursed Credentials"
                          : "No accounts yet"}
                    </h3>
                    <p
                      className={`mb-5 text-xs md:text-sm ${
                        isHalloweenMode
                          ? "text-[#60c9b6]/70"
                          : isDark
                            ? "text-[#B4B4B8]"
                            : "text-gray-600"
                      }`}
                    >
                      {searchQuery
                        ? isHalloweenMode
                          ? "The mystical search through the enchanted vaults yields no results. Try different incantations."
                          : "Try adjusting your search terms"
                        : isHalloweenMode
                          ? "Your mystical key ring lies empty. Create your first enchanted account to unlock the realm of possibilities."
                          : "Create your first account to get started"}
                    </p>
                    {!searchQuery && (
                      <motion.button
                        onClick={() => setShowCreateAccount(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-lg transition-colors text-sm mx-auto shadow-lg"
                        style={{
                          backgroundColor: `${activeFolderColor}20`,
                          borderColor: `${activeFolderColor}50`,
                          color: activeFolderColor,
                          border: `1px solid ${activeFolderColor}50`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${activeFolderColor}30`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = `${activeFolderColor}20`;
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        <span>
                          {isHalloweenMode
                            ? "Conjure Account"
                            : "Create Account"}
                        </span>
                      </motion.button>
                    )}
                  </motion.div>
                </div>
              ) : viewMode === "grid" ? (
                <VirtuosoGrid
                  style={{ height: "100%" }}
                  data={filteredAccounts}
                  components={{
                    List: VirtuosoGridList,
                    Item: VirtuosoGridItem,
                  }}
                  itemContent={(index, account) => (
                    <motion.div
                      key={account.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 }}
                    >
                      <GlassCard
                        variant="primary"
                        hover
                        className={`p-3 cursor-pointer transition-all duration-200 relative overflow-hidden group ${
                          isHalloweenMode
                            ? "border-[rgba(96,201,182,0.4)]! shadow-[0_0_15px_rgba(96,201,182,0.15)]! hover:border-[rgba(96,201,182,0.6)]!"
                            : ""
                        }`}
                        onClick={() => handleViewAccount(account)}
                      >
                        {isHalloweenMode && (
                          <>
                            <div
                              className="absolute inset-0 pointer-events-none opacity-5 z-0"
                              style={{
                                backgroundImage: `url(${cardPumpkinsStaring})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                filter: "grayscale(100%)",
                              }}
                            />
                            <motion.img
                              src={pumpkinSneaky}
                              alt=""
                              className="absolute -bottom-2 -right-2 w-12 opacity-20 group-hover:opacity-40 transition-opacity duration-300 z-0"
                              animate={{ rotate: [0, 5, 0] }}
                              transition={{ duration: 4, repeat: Infinity }}
                            />
                          </>
                        )}
                        <div className="flex items-start justify-between mb-2 relative z-10">
                          <h3
                            className={`font-bold text-md mb-1 font-sans transition-colors duration-200 ${
                              isHalloweenMode
                                ? "font-creepster tracking-wider text-[#60c9b6]"
                                : ""
                            }`}
                            style={{
                              color: isHalloweenMode
                                ? "#60c9b6"
                                : activeFolderColor,
                            }}
                          >
                            {account.title}
                          </h3>
                          {!account.is_active && (
                            <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                              Inactive
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 mb-3 relative z-10">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs ${
                                isHalloweenMode
                                  ? "text-[#60c9b6]/70"
                                  : isDark
                                    ? "text-[#71717A]"
                                    : "text-gray-500"
                              }`}
                            >
                              Platform:
                            </span>
                            <span
                              className={`text-xs ${
                                isHalloweenMode
                                  ? "text-[#60c9b6]"
                                  : isDark
                                    ? "text-[#B4B4B8]"
                                    : "text-gray-600"
                              }`}
                            >
                              {account.platform}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs ${
                                isHalloweenMode
                                  ? "text-[#60c9b6]/70"
                                  : isDark
                                    ? "text-[#71717A]"
                                    : "text-gray-500"
                              }`}
                            >
                              Email:
                            </span>
                            <span
                              className={`text-xs truncate ml-2 ${
                                isHalloweenMode
                                  ? "text-[#60c9b6]"
                                  : isDark
                                    ? "text-[#B4B4B8]"
                                    : "text-gray-600"
                              }`}
                            >
                              {maskEmail(account.email_username)}
                            </span>
                          </div>
                          {account.usage_limit && (
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs ${
                                  isHalloweenMode
                                    ? "text-[#60c9b6]/70"
                                    : isDark
                                      ? "text-[#71717A]"
                                      : "text-gray-500"
                                }`}
                              >
                                Usage:
                              </span>
                              <span
                                className={`text-xs font-medium ${
                                  isHalloweenMode
                                    ? "text-[#60c9b6]"
                                    : getUsageColor(account)
                                }`}
                              >
                                {account.current_usage} / {account.usage_limit}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between relative z-10">
                          <span
                            className="px-2 py-0.5 text-xs rounded transition-all duration-200"
                            style={{
                              backgroundColor: isHalloweenMode
                                ? "rgba(96,201,182,0.1)"
                                : `${activeFolderColor}30`,
                              color: isHalloweenMode
                                ? "#60c9b6"
                                : activeFolderColor,
                              border: `1px solid ${isHalloweenMode ? "rgba(96,201,182,0.3)" : `${activeFolderColor}50`}`,
                            }}
                          >
                            {account.usage_type.replace("_", " ")}
                          </span>
                          <span
                            className={`text-xs ${
                              isHalloweenMode
                                ? "text-[#60c9b6]/60"
                                : isDark
                                  ? "text-[#71717A]"
                                  : "text-gray-500"
                            }`}
                          >
                            {new Date(account.updated_at).toLocaleDateString()}
                          </span>
                        </div>

                        {account.usage_limit && (
                          <div className="mt-2 relative z-10">
                            <div
                              className={`w-full rounded-full h-1 ${isHalloweenMode ? "bg-[rgba(96,201,182,0.1)]" : "bg-[rgba(255,255,255,0.1)]"}`}
                            >
                              <div
                                className="h-1 rounded-full transition-all duration-300"
                                style={{
                                  backgroundColor: isHalloweenMode
                                    ? "#60c9b6"
                                    : getAccountUsagePercentage(account) >= 90
                                      ? "#EF4444"
                                      : getAccountUsagePercentage(account) >= 70
                                        ? "#F59E0B"
                                        : activeFolderColor,
                                  width: `${Math.min(getAccountUsagePercentage(account), 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </GlassCard>
                    </motion.div>
                  )}
                />
              ) : (
                <Virtuoso
                  style={{ height: "100%" }}
                  data={filteredAccounts}
                  itemContent={(index, account) => (
                    <div className="px-3 pb-2 first:pt-2">
                      <motion.div
                        key={account.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.05 }}
                      >
                        <GlassCard
                          variant="primary"
                          hover
                          className={`p-2.5 sm:p-3 cursor-pointer transition-all duration-200 relative overflow-hidden group ${
                            isHalloweenMode
                              ? "border-[rgba(96,201,182,0.4)]! shadow-[0_0_15px_rgba(96,201,182,0.15)]! hover:border-[rgba(96,201,182,0.6)]!"
                              : ""
                          }`}
                          onClick={() => handleViewAccount(account)}
                        >
                          {isHalloweenMode && (
                            <div
                              className="absolute inset-0 pointer-events-none opacity-10 z-0"
                              style={{
                                backgroundImage: `url(${cardPumpkinsStaring})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                filter: "grayscale(100%)",
                              }}
                            />
                          )}
                          {/* Mobile Layout */}
                          <div className="sm:hidden relative z-10">
                            <div className="flex items-start gap-2 mb-2">
                              <KeyRound
                                className="w-4 h-4 mt-0.5 shrink-0"
                                style={{ color: activeFolderColor }}
                              />
                              <div className="flex-1 min-w-0">
                                <h3
                                  className="font-semibold text-sm mb-1 truncate"
                                  style={{ color: activeFolderColor }}
                                >
                                  {account.title}
                                </h3>
                                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                  <span
                                    className="px-1.5 py-0.5 text-[10px] rounded font-medium"
                                    style={{
                                      backgroundColor: `${activeFolderColor}20`,
                                      color: activeFolderColor,
                                      border: `1px solid ${activeFolderColor}30`,
                                    }}
                                  >
                                    {account.platform}
                                  </span>
                                  {!account.is_active && (
                                    <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded font-medium">
                                      Inactive
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`text-[11px] space-y-1 ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={
                                    isDark ? "text-[#71717A]" : "text-gray-500"
                                  }
                                >
                                  Email:
                                </span>
                                <span className="font-medium truncate ml-2">
                                  {maskEmail(account.email_username)}
                                </span>
                              </div>
                              {account.usage_limit && (
                                <div className="flex items-center justify-between">
                                  <span
                                    className={
                                      isDark
                                        ? "text-[#71717A]"
                                        : "text-gray-500"
                                    }
                                  >
                                    Usage:
                                  </span>
                                  <span
                                    className={`font-semibold ${getUsageColor(account)}`}
                                  >
                                    {account.current_usage} /{" "}
                                    {account.usage_limit}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <span
                                  className={
                                    isDark ? "text-[#71717A]" : "text-gray-500"
                                  }
                                >
                                  Type:
                                </span>
                                <span className="capitalize">
                                  {account.usage_type.replace("_", " ")}
                                </span>
                              </div>
                              <div
                                className="flex items-center justify-between pt-1 border-t"
                                style={{
                                  borderColor: isDark
                                    ? "rgba(255,255,255,0.05)"
                                    : "rgba(0,0,0,0.05)",
                                }}
                              >
                                <span
                                  className={
                                    isDark ? "text-[#71717A]" : "text-gray-500"
                                  }
                                >
                                  Updated:
                                </span>
                                <span>
                                  {new Date(
                                    account.updated_at,
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Desktop/Tablet Layout */}
                          <div className="hidden sm:flex items-center justify-between relative z-10">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <KeyRound
                                  className={`w-3 h-3 ${isDark ? "text-[#B4B4B8]" : "text-gray-500"}`}
                                />
                                <h3
                                  className="font-medium text-sm transition-colors duration-200"
                                  style={{ color: activeFolderColor }}
                                >
                                  {account.title}
                                </h3>
                                <span
                                  className="px-2 py-0.5 text-xs rounded transition-all duration-200"
                                  style={{
                                    backgroundColor: `${activeFolderColor}30`,
                                    color: activeFolderColor,
                                    border: `1px solid ${activeFolderColor}50`,
                                  }}
                                >
                                  {account.platform}
                                </span>
                                {!account.is_active && (
                                  <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                                    Inactive
                                  </span>
                                )}
                              </div>
                              <div
                                className={`flex items-center space-x-4 text-xs pl-5 ${isDark ? "text-[#B4B4B8]" : "text-gray-600"}`}
                              >
                                <span>{maskEmail(account.email_username)}</span>
                                {account.usage_limit && (
                                  <span
                                    className={`font-medium ${getUsageColor(account)}`}
                                  >
                                    {account.current_usage} /{" "}
                                    {account.usage_limit}
                                  </span>
                                )}
                                <span className="capitalize">
                                  {account.usage_type.replace("_", " ")}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`text-xs ml-3 ${isDark ? "text-[#71717A]" : "text-gray-500"}`}
                            >
                              {new Date(
                                account.updated_at,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </GlassCard>
                      </motion.div>
                    </div>
                  )}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateFolderModal
        isOpen={showCreateFolder || !!editingFolder}
        onClose={() => {
          setShowCreateFolder(false);
          setEditingFolder(null);
        }}
        onCreateFolder={editingFolder ? handleEditFolder : handleCreateFolder}
        type="accounts"
        folderToEdit={editingFolder}
      />

      <ConfirmationModal
        isOpen={showDeleteFolder}
        onClose={() => setShowDeleteFolder(false)}
        onConfirm={handleDeleteFolder}
        title="Delete Folder"
        description={`Are you sure you want to delete the folder "${selectedFolderData?.name || ""}"? This action cannot be undone. All prompts in this folder will be moved to "All Prompts".`}
        confirmText="Delete Folder"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeletingFolder}
      />

      <CreateAccountModal
        isOpen={showCreateAccount}
        onClose={() => setShowCreateAccount(false)}
        onCreateAccount={handleCreateAccount}
      />

      <ViewAccountModal
        isOpen={showViewAccount}
        onClose={() => setShowViewAccount(false)}
        account={selectedAccount}
        onEdit={handleEditAccount}
        onDelete={handleDeleteAccount}
      />

      <EditAccountModal
        isOpen={showEditAccount}
        onClose={() => setShowEditAccount(false)}
        account={selectedAccount}
        onUpdateAccount={handleUpdateAccount}
      />

      <DeleteAccountModal
        isOpen={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
        onDeleteAccount={confirmDeleteAccount}
        accountTitle={selectedAccount?.title || ""}
      />

      <LogUsageModal
        isOpen={showLogUsage}
        onClose={() => setShowLogUsage(false)}
        accounts={accounts.filter((acc) => acc.is_active)}
        onLogUsage={handleLogUsage}
      />

      <ConfirmationModal
        isOpen={!!logToDelete}
        onClose={() => setLogToDelete(null)}
        onConfirm={async () => {
          if (logToDelete) {
            try {
              await deleteUsageLog(logToDelete);
              toast.success("Usage log deleted successfully");
              setLogToDelete(null);
            } catch (error) {
              console.error("Failed to delete usage log:", error);
              toast.error("Failed to delete usage log");
            }
          }
        }}
        title="Delete Usage Log"
        description="Are you sure you want to delete this usage log? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </motion.div>
  );
};
