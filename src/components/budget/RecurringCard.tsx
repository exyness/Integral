import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Edit,
  MoreVertical,
  Repeat,
  Trash,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  bgBluePumpkins,
  catFluffy,
  schoolhouseSteeple,
  webLeftHanging,
} from "@/assets";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useTheme } from "@/contexts/ThemeContext";
import { useCurrency } from "@/hooks/useCurrency";
import { RecurringTransaction } from "@/types/budget";

interface RecurringCardProps {
  transaction: RecurringTransaction;
  onEdit: (transaction: RecurringTransaction) => void;
  onDelete: (id: string) => void;
  onToggleActive: (transaction: RecurringTransaction) => void;
  getAccountName: (id: string | undefined) => string;
  getCategoryName: (id: string | undefined) => string;
}

export const RecurringCard: React.FC<RecurringCardProps> = ({
  transaction,
  onEdit,
  onDelete,
  onToggleActive,
  getAccountName,
  getCategoryName,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { formatAmount } = useCurrency();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuButtonRef.current &&
        !menuButtonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setShowMenu(false);
      }
    };

    const handleScroll = () => {
      setShowMenu(false);
    };

    if (showMenu) {
      // Small delay to prevent immediate closing
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
      document.addEventListener("scroll", handleScroll, true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [showMenu]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 160, // 160 is menu width (w-40)
      });
    }
    setShowMenu(!showMenu);
  };

  const isOverdue = new Date(transaction.next_run_date) <= new Date();

  return (
    <motion.div
      className={`relative p-3 sm:p-4 rounded-xl border transition-all cursor-pointer group overflow-visible ${
        isHalloweenMode
          ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.2)] hover:border-[rgba(96,201,182,0.4)]"
          : isDark
            ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
            : "bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Halloween Decorations */}
      {isHalloweenMode && (
        <>
          <div className="absolute top-1 right-1 rotate-270 pointer-events-none z-0">
            <img src={webLeftHanging} alt="" className="w-24 h-24" />
          </div>
          <div
            className="absolute inset-0 pointer-events-none z-0 opacity-20"
            style={{
              backgroundImage: `url(${bgBluePumpkins})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "grayscale(100%)",
            }}
          />
          <div className="absolute -bottom-1 -right-1 pointer-events-none z-0 opacity-30">
            <img src={schoolhouseSteeple} alt="" className="w-16 h-16" />
          </div>
          <div className="absolute -bottom-2 -left-2 pointer-events-none z-0 opacity-20">
            <img src={catFluffy} alt="" className="w-14 h-14" />
          </div>
        </>
      )}

      {/* Header */}
      <div className="relative z-10 mb-3 sm:mb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Icon */}
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
                isHalloweenMode
                  ? "bg-[#60c9b6]/20 text-[#60c9b6]"
                  : transaction.type === "expense"
                    ? "bg-red-500/10 text-red-500"
                    : transaction.type === "income"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-blue-500/10 text-blue-500"
              }`}
            >
              <Repeat className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            {/* Transaction Info */}
            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold text-sm truncate ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                {transaction.description}
              </h3>
              <p
                className={`text-xs capitalize ${
                  isHalloweenMode
                    ? "text-[#60c9b6]/70"
                    : isDark
                      ? "text-gray-400"
                      : "text-gray-600"
                }`}
              >
                {transaction.interval}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Menu Button */}
            <button
              ref={menuButtonRef}
              onClick={handleMenuClick}
              className={`p-1.5 rounded-lg transition-colors ${
                showMenu
                  ? "opacity-100"
                  : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
              } ${
                isHalloweenMode
                  ? "hover:bg-[rgba(96,201,182,0.2)]"
                  : isDark
                    ? "hover:bg-white/10"
                    : "hover:bg-gray-100"
              }`}
            >
              <MoreVertical
                className={`w-4 h-4 ${isHalloweenMode ? "text-[#60c9b6]" : ""}`}
              />
            </button>

            {/* Dropdown Menu - Portal */}
            {showMenu &&
              createPortal(
                <div
                  ref={menuRef}
                  className={`fixed w-40 rounded-lg shadow-xl border z-[9999] ${
                    isHalloweenMode
                      ? "bg-[#1a1a1f] border-[rgba(96,201,182,0.3)]"
                      : isDark
                        ? "bg-[#1a1a1f] border-gray-700"
                        : "bg-white border-gray-200"
                  }`}
                  style={{
                    top: menuPosition.top,
                    left: menuPosition.left,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleActive(transaction);
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors cursor-pointer rounded-t-lg ${
                      transaction.active
                        ? isHalloweenMode
                          ? "text-[#60c9b6] hover:bg-[rgba(96,201,182,0.1)]"
                          : "text-green-500 hover:bg-green-500/10"
                        : "text-gray-400 hover:bg-gray-500/10"
                    }`}
                  >
                    {transaction.active ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Inactive
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(transaction);
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors cursor-pointer ${
                      isHalloweenMode
                        ? "text-[#60c9b6] hover:bg-[rgba(96,201,182,0.1)]"
                        : isDark
                          ? "text-white hover:bg-white/10"
                          : "text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(true);
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors cursor-pointer rounded-b-lg ${
                      isHalloweenMode
                        ? "text-red-400 hover:bg-red-500/10"
                        : "text-red-500 hover:bg-red-500/10"
                    }`}
                  >
                    <Trash className="w-4 h-4" />
                    Delete
                  </button>
                </div>,
                document.body,
              )}
          </div>
        </div>

        {/* Amount - Below Header */}
        <div className="text-right mb-3 sm:mb-4 relative z-10">
          <p
            className={`text-2xl sm:text-3xl font-bold ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : transaction.type === "expense"
                  ? "text-red-500"
                  : transaction.type === "income"
                    ? "text-[#10B981]"
                    : "text-blue-500"
            }`}
          >
            {transaction.type === "expense" ? "-" : "+"}
            {formatAmount(transaction.amount)}
          </p>
        </div>
      </div>

      {/* Details Section */}
      <div className="relative z-10">
        {/* Category & Status Badges */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          {/* Category Badge */}
          {transaction.type !== "transfer" && (
            <div
              className={`text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-medium ${
                isHalloweenMode
                  ? "bg-[#60c9b6]/10 text-[#60c9b6]"
                  : isDark
                    ? "bg-white/5 text-gray-300"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              {getCategoryName(transaction.category_id)}
            </div>
          )}

          {/* Active Status Badge */}
          {!transaction.active && (
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-xs font-medium ${
                isHalloweenMode
                  ? "bg-[#60c9b6]/10 text-[#60c9b6]/70"
                  : "bg-gray-500/10 text-gray-500"
              }`}
            >
              <XCircle className="w-3 h-3" />
              Inactive
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="mb-3">
          <p
            className={`text-xs font-medium mb-1 ${
              isHalloweenMode
                ? "text-[#60c9b6]/70"
                : isDark
                  ? "text-gray-400"
                  : "text-gray-600"
            }`}
          >
            Account
          </p>
          <div
            className={`flex items-center gap-1.5 text-sm font-medium ${
              isHalloweenMode
                ? "text-[#60c9b6]/90"
                : isDark
                  ? "text-gray-300"
                  : "text-gray-700"
            }`}
          >
            <Wallet className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {getAccountName(transaction.account_id)}
            </span>
            {transaction.type === "transfer" && (
              <>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {getAccountName(transaction.to_account_id)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Next Payment Date */}
        <div
          className={`flex items-center gap-1 sm:gap-1.5 text-xs font-medium pt-2 sm:pt-2.5 mt-2 sm:mt-2.5 border-t ${
            isDark ? "border-white/10" : "border-gray-200"
          } ${
            isOverdue
              ? isHalloweenMode
                ? "text-[#60c9b6]"
                : "text-amber-500"
              : isHalloweenMode
                ? "text-[#60c9b6]/70"
                : isDark
                  ? "text-gray-400"
                  : "text-gray-600"
          }`}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            Next Payment:{" "}
            {new Date(transaction.next_run_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onDelete(transaction.id);
          setShowDeleteConfirm(false);
        }}
        title="Delete Recurring Transaction"
        description="Are you sure you want to delete this recurring transaction?"
        itemTitle={transaction.description}
        itemDescription={`${transaction.interval} • ${formatAmount(transaction.amount)}`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </motion.div>
  );
};
