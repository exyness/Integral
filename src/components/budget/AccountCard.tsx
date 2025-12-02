import { motion } from "framer-motion";
import { Edit, MoreVertical, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ghostScare, treeSceneryCurly } from "@/assets";
import { IconRenderer } from "@/contexts/IconPickerContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCurrency } from "@/hooks/useCurrency";
import { Account } from "@/types/budget";

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onEdit,
  onDelete,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { formatAmount } = useCurrency();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <motion.div
      className={`relative p-4 rounded-xl border transition-all cursor-pointer group overflow-visible ${
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
          <div className="absolute -bottom-1 -right-1 pointer-events-none z-0 opacity-30">
            <img src={treeSceneryCurly} alt="" className="w-16 h-16" />
          </div>
          <div className="absolute -top-2 -right-2 pointer-events-none z-0 opacity-20">
            <img src={ghostScare} alt="" className="w-14 h-14" />
          </div>
        </>
      )}
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: isHalloweenMode
                ? "rgba(96, 201, 182, 0.2)"
                : `${account.color}20`,
            }}
          >
            <IconRenderer
              icon={account.icon}
              className={`w-6 h-6 ${isHalloweenMode ? "text-[#60c9b6]" : ""}`}
            />
          </div>

          {/* Account Info */}
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-sm md:text-base truncate ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-900"
              }`}
            >
              {account.name}
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
              {account.type?.replace("_", " ") || "Account"}
            </p>
          </div>
        </div>

        {/* Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`p-1.5 rounded-lg transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 ${
              showMenu ? "opacity-100" : ""
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

          {/* Dropdown Menu */}
          {showMenu && (
            <div
              className={`absolute right-0 mt-2 w-40 rounded-lg shadow-xl border z-[9999] ${
                isHalloweenMode
                  ? "bg-[#1a1a1f] border-[rgba(96,201,182,0.3)]"
                  : isDark
                    ? "bg-[#1a1a1f] border-gray-700"
                    : "bg-white border-gray-200"
              }`}
            >
              <button
                onClick={() => {
                  onEdit(account);
                  setShowMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors cursor-pointer rounded-t-lg ${
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
                onClick={() => {
                  onDelete(account.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer rounded-b-lg"
              >
                <Trash className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Balance */}
      <div>
        <p
          className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          Current Balance
        </p>
        <p
          className={`text-2xl font-bold ${
            isHalloweenMode
              ? "text-[#60c9b6]"
              : account.balance >= 0
                ? "text-[#10B981]"
                : "text-red-500"
          }`}
        >
          {formatAmount(account.balance)}
        </p>
      </div>

      {/* Notes (if any) */}
      {account.notes && (
        <p
          className={`mt-3 text-xs line-clamp-2 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {account.notes}
        </p>
      )}
    </motion.div>
  );
};
