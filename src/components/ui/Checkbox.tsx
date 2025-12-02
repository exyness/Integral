import { Check } from "lucide-react";
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface CheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
}) => {
  const { isDark, isHalloweenMode } = useTheme();

  return (
    <label
      className={`group flex items-center space-x-3 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`
            w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center
            ${
              checked
                ? isHalloweenMode
                  ? "bg-[#60c9b6] border-[#60c9b6]"
                  : "bg-[#8B5CF6] border-[#8B5CF6]"
                : isHalloweenMode
                  ? "bg-transparent border-[#60c9b6]/30 group-hover:border-[#60c9b6]/50"
                  : isDark
                    ? "bg-transparent border-[rgba(255,255,255,0.2)] group-hover:border-[rgba(255,255,255,0.3)]"
                    : "bg-white border-gray-300 group-hover:border-gray-400"
            }
            ${
              !disabled
                ? isHalloweenMode
                  ? "group-hover:bg-[#60c9b6]/10"
                  : isDark
                    ? "group-hover:bg-[rgba(139,92,246,0.1)]"
                    : "group-hover:bg-[rgba(139,92,246,0.05)]"
                : ""
            }
          `}
        >
          {checked && (
            <Check
              className={`w-3 h-3 stroke-3 ${
                isHalloweenMode ? "text-black" : "text-white"
              }`}
            />
          )}
        </div>
      </div>
      {label && (
        <span
          className={`
            text-sm font-medium select-none
            ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-[#B4B4B8]"
                  : "text-gray-700"
            }
          `}
        >
          {label}
        </span>
      )}
    </label>
  );
};
