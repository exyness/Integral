import React, { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  animated?: boolean;
}

function Skeleton({ className, animated = true, ...props }: SkeletonProps) {
  const { isDark, isHalloweenMode } = useTheme();
  const [colorIndex, setColorIndex] = useState(0);

  // Halloween teal/cyan colors
  const halloweenColors = [
    "rgba(96, 201, 182, 0.15)",
    "rgba(72, 187, 168, 0.15)",
    "rgba(120, 215, 196, 0.15)",
    "rgba(64, 224, 208, 0.15)",
  ];

  const halloweenBorderColors = [
    "rgba(96, 201, 182, 0.3)",
    "rgba(72, 187, 168, 0.3)",
    "rgba(120, 215, 196, 0.3)",
    "rgba(64, 224, 208, 0.3)",
  ];

  // Regular rainbow colors
  const regularColors = [
    "rgba(16, 185, 129, 0.15)",
    "rgba(139, 92, 246, 0.15)",
    "rgba(245, 158, 11, 0.15)",
    "rgba(59, 130, 246, 0.15)",
    "rgba(236, 72, 153, 0.15)",
  ];

  const regularBorderColors = [
    "rgba(16, 185, 129, 0.3)",
    "rgba(139, 92, 246, 0.3)",
    "rgba(245, 158, 11, 0.3)",
    "rgba(59, 130, 246, 0.3)",
    "rgba(236, 72, 153, 0.3)",
  ];

  const colors = isHalloweenMode ? halloweenColors : regularColors;
  const borderColors = isHalloweenMode
    ? halloweenBorderColors
    : regularBorderColors;

  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colors.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [animated, colors.length]);

  return (
    <div
      className={cn(
        "rounded-md transition-all duration-700 border",
        animated && "animate-pulse",
        className,
      )}
      style={{
        backgroundColor: animated
          ? colors[colorIndex]
          : isDark
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.05)",
        borderColor: animated
          ? borderColors[colorIndex]
          : isDark
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)",
        animationDuration: animated ? "3s" : undefined,
      }}
      {...props}
    />
  );
}

export { Skeleton };
