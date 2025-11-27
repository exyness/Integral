import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "tertiary";
  hover?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  variant = "primary",
  hover = false,
  onClick,
  ...props
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const baseClasses = "rounded-lg border transition-all duration-300";

  const darkVariantClasses = {
    primary:
      "bg-[rgba(25,25,30,0.85)] backdrop-blur-[20px] border-[rgba(255,255,255,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
    secondary:
      "bg-[rgba(35,35,40,0.75)] backdrop-blur-lg border-[rgba(255,255,255,0.12)] shadow-[0_4px_24px_rgba(0,0,0,0.25)]",
    tertiary:
      "bg-[rgba(45,45,50,0.65)] backdrop-blur-md border-[rgba(255,255,255,0.1)] shadow-[0_2px_16px_rgba(0,0,0,0.2)]",
  };

  const lightVariantClasses = {
    primary:
      "bg-white/90 backdrop-blur-[20px] border-gray-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.1)]",
    secondary:
      "bg-white/80 backdrop-blur-lg border-gray-200/50 shadow-[0_4px_24px_rgba(0,0,0,0.08)]",
    tertiary:
      "bg-white/70 backdrop-blur-md border-gray-200/40 shadow-[0_2px_16px_rgba(0,0,0,0.06)]",
  };

  const variantClasses = isDark ? darkVariantClasses : lightVariantClasses;

  const darkHoverClasses = hover
    ? "hover:bg-[rgba(50,50,55,0.7)] hover:border-[rgba(255,255,255,0.2)] hover:transform hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
    : "";

  const lightHoverClasses = hover
    ? "hover:bg-white/85 hover:border-gray-300/70 hover:transform hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]"
    : "";

  const hoverClasses = isDark ? darkHoverClasses : lightHoverClasses;
  const clickableClasses = onClick ? "cursor-pointer" : "";

  // Halloween specific overrides
  const halloweenClasses = isHalloweenMode
    ? "border-[rgba(96,201,182,0.2)] shadow-[0_0_20px_rgba(96,201,182,0.15)]"
    : "";

  const halloweenHoverClasses =
    isHalloweenMode && hover
      ? "hover:border-[rgba(96,201,182,0.4)] hover:shadow-[0_0_25px_rgba(96,201,182,0.25)]"
      : "";

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${halloweenClasses} ${halloweenHoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};
