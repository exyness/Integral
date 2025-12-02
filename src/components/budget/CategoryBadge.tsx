import React from "react";
import { IconRenderer } from "@/contexts/IconPickerContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Category } from "@/types/budget";

interface CategoryBadgeProps {
  category: Category;
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = "sm",
  className,
  showIcon = true,
}) => {
  const { isHalloweenMode } = useTheme();
  const sizeClasses = {
    sm: "text-xs gap-1.5",
    md: "text-sm gap-2",
    lg: "text-base gap-2.5",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div
      className={cn(
        "flex items-center font-medium",
        sizeClasses[size],
        className,
      )}
    >
      {showIcon && (
        <div
          className="flex items-center justify-center rounded-full bg-opacity-10"
          style={{
            color: isHalloweenMode ? "#60c9b6" : category.color,
          }}
        >
          <IconRenderer icon={category.icon} className={iconSizes[size]} />
        </div>
      )}
      <span style={{ color: isHalloweenMode ? "#60c9b6" : category.color }}>
        {category.name}
      </span>
    </div>
  );
};
