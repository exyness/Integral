import { motion } from "framer-motion";
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  className = "",
}) => {
  const { isHalloweenMode, isDark } = useTheme();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
        ${
          checked
            ? isHalloweenMode
              ? "bg-[#60c9b6]"
              : isDark
                ? "bg-purple-600"
                : "bg-blue-600"
            : isDark
              ? "bg-gray-700"
              : "bg-gray-200"
        }
        ${className}
      `}
    >
      <motion.span
        layout
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30,
        }}
        className={`
          pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform
          ${checked ? "translate-x-5" : "translate-x-0"}
          ${isHalloweenMode && checked ? "bg-black" : "bg-white"}
        `}
      />
    </button>
  );
};
