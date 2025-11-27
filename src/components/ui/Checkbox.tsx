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
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          onClick={() => !disabled && onChange(!checked)}
          className={`
            w-5 h-5 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center
            ${
              checked
                ? isHalloweenMode
                  ? "bg-[#60c9b6] border-[#60c9b6]"
                  : "bg-[#8B5CF6] border-[#8B5CF6]"
                : isHalloweenMode
                  ? "bg-transparent border-[#60c9b6]/30 hover:border-[#60c9b6]/50"
                  : isDark
                    ? "bg-transparent border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.3)]"
                    : "bg-white border-gray-300 hover:border-gray-400"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${
              !disabled
                ? isHalloweenMode
                  ? "hover:bg-[#60c9b6]/10"
                  : isDark
                    ? "hover:bg-[rgba(139,92,246,0.1)]"
                    : "hover:bg-[rgba(139,92,246,0.05)]"
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
        <label
          htmlFor={id}
          className={`
            text-sm font-medium cursor-pointer select-none
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-[#B4B4B8]"
                  : "text-gray-700"
            }
          `}
          onClick={() => !disabled && onChange(!checked)}
        >
          {label}
        </label>
      )}
    </div>
  );
};
