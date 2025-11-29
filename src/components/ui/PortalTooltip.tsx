import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/contexts/ThemeContext";

interface PortalTooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "bottom";
  className?: string;
}

export const PortalTooltip: React.FC<PortalTooltipProps> = ({
  content,
  children,
  side = "bottom", // Default to bottom as requested for SearchModal header buttons usually
  className = "",
}) => {
  const { isDark } = useTheme();
  const [coords, setCoords] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords(rect);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const child = React.Children.only(children) as React.ReactElement<
    React.HTMLAttributes<HTMLElement>
  >;

  return (
    <>
      {React.cloneElement(child, {
        onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
          handleMouseEnter(e);
          child.props.onMouseEnter?.(e);
        },
        onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
          handleMouseLeave();
          child.props.onMouseLeave?.(e);
        },
      })}
      {isVisible &&
        coords &&
        createPortal(
          <div
            className={`fixed z-100 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none transition-opacity shadow-lg animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 duration-200 ${
              isDark ? "bg-white text-gray-900" : "bg-gray-900 text-white"
            } ${className}`}
            data-side={side}
            style={{
              top: side === "bottom" ? coords.bottom + 8 : coords.top - 8,
              left: coords.left + coords.width / 2,
              transform:
                side === "bottom"
                  ? "translateX(-50%)"
                  : "translate(-50%, -100%)",
            }}
          >
            {content}
            <div
              className={`absolute w-2 h-2 rotate-45 left-1/2 -translate-x-1/2 ${
                isDark ? "bg-white" : "bg-gray-900"
              } ${side === "bottom" ? "-top-1" : "-bottom-1"}`}
            />
          </div>,
          document.body,
        )}
    </>
  );
};
