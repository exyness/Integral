import { motion } from "framer-motion";
import { Edit2, Trash2 } from "lucide-react";
import React from "react";
import { ghostScare, pumpkinSneaky } from "@/assets";
import { IconRenderer } from "@/contexts/IconPickerContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCurrency } from "@/hooks/useCurrency";
import { Liability } from "@/types/budget";

interface LiabilityCardProps {
  liability: Liability;
  onEdit: (liability: Liability) => void;
  onDelete: (id: string) => void;
}

export const LiabilityCard: React.FC<LiabilityCardProps> = ({
  liability,
  onEdit,
  onDelete,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { formatAmount } = useCurrency();

  return (
    <div
      className={`relative p-3 md:p-4 rounded-xl border transition-all overflow-hidden w-full max-w-md ${
        isHalloweenMode
          ? "bg-[#1a1a1f] hover:shadow-[0_0_15px_rgba(96,201,182,0.2)]"
          : isDark
            ? "bg-white/5 hover:bg-white/10"
            : "bg-white hover:shadow-md"
      }`}
      style={{
        borderColor: isHalloweenMode
          ? `${liability.color}`
          : isDark
            ? `${liability.color}40`
            : undefined,
        boxShadow: isHalloweenMode
          ? `0 0 10px ${liability.color}30`
          : undefined,
      }}
    >
      {/* Halloween Decorations */}
      {isHalloweenMode && (
        <>
          <div
            className="absolute inset-0 pointer-events-none opacity-5 z-0"
            style={{
              backgroundImage: `url(${pumpkinSneaky})`,
              backgroundSize: "contain",
              backgroundPosition: "bottom right",
              backgroundRepeat: "no-repeat",
            }}
          />
          <motion.img
            src={ghostScare}
            alt=""
            className="absolute top-1 right-1 w-8 h-8 md:w-10 md:h-10 opacity-30 pointer-events-none z-0"
            animate={{
              y: [0, -3, 0],
              opacity: [0.3, 0.4, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </>
      )}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${liability.color}20`,
              color: liability.color,
            }}
          >
            <IconRenderer
              icon={liability.icon}
              className="w-5 h-5 md:w-6 md:h-6"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className="font-semibold text-sm md:text-base truncate"
              style={{ color: liability.color }}
            >
              {liability.name}
            </h4>
            <p className="text-xs text-gray-500 capitalize truncate">
              {liability.type.replace("_", " ")}
            </p>
          </div>
        </div>

        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onEdit(liability)}
            className={`p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? "hover:bg-white/10 text-gray-400"
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
          <button
            onClick={() => onDelete(liability.id)}
            className={`p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? "hover:bg-red-500/20 text-red-400"
                : "hover:bg-red-100 text-red-500"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 md:mt-4 space-y-1 md:space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm text-gray-500">Outstanding:</span>
          <span
            className={`text-base md:text-lg font-bold ${liability.color}`}
            style={{ color: liability.color }}
          >
            {formatAmount(liability.amount)}
          </span>
        </div>

        {/* Details hidden on mobile to reduce bulk */}
        <div className="hidden md:block space-y-2">
          {liability.interest_rate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Interest Rate:</span>
              <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                {liability.interest_rate}%
              </span>
            </div>
          )}

          {liability.minimum_payment && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Min Payment:</span>
              <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                {formatAmount(liability.minimum_payment)}
              </span>
            </div>
          )}

          {liability.due_date && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Due Date:</span>
              <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                {new Date(liability.due_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {!liability.is_active && (
        <div className="mt-2">
          <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-500">
            Inactive
          </span>
        </div>
      )}
    </div>
  );
};
