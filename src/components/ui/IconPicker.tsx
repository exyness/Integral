import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { VirtuosoGrid } from "react-virtuoso";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/Sheet";
import { IconRenderer, useIconPicker } from "@/contexts/IconPickerContext";
import { useTheme } from "@/contexts/ThemeContext";

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onChange,
  placeholder = "Select icon",
  label,
  disabled = false,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const { icons, searchTerm, setSearchTerm } = useIconPicker();
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Local search state for debouncing
  const [localSearch, setLocalSearch] = useState(searchTerm);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchTerm]);

  // Sync local search when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setLocalSearch("");
    } else {
      setLocalSearch(searchTerm);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // State for dropdown positioning
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    showAbove: false,
  });

  // State for compact view (mobile)
  const [compactView, setCompactView] = useState(() => {
    return typeof window !== "undefined" && window.innerWidth < 768;
  });

  // State for tooltip
  const [hoveredIcon, setHoveredIcon] = useState<{
    name: string;
    friendlyName: string;
    rect: DOMRect;
  } | null>(null);

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const dropdownHeight = compactView ? 300 : 400;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      setDropdownPosition({
        top: showAbove ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        showAbove,
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setLocalSearch("");
    setHoveredIcon(null);
  };

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    handleClose();
  };

  const handleIconHover = (
    e: React.MouseEvent<HTMLButtonElement>,
    icon: { name: string; friendlyName: string },
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredIcon({
      name: icon.name,
      friendlyName: icon.friendlyName,
      rect,
    });
  };

  const handleIconLeave = () => {
    setHoveredIcon(null);
  };

  const selectedIcon = icons.find((icon) => icon.name === value);

  // Update position on scroll and resize (like Calendar)
  React.useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const dropdownHeight = compactView ? 300 : 400;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const showAbove =
          spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

        setDropdownPosition({
          top: showAbove ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
          left: rect.left,
          width: rect.width,
          showAbove,
        });
      }
    };

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, compactView]);

  // Virtuoso Grid Components
  const GridList = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
  >((props, ref) => (
    <div
      ref={ref}
      {...props}
      className={`grid gap-${compactView ? "1.5" : "2"} ${compactView ? "grid-cols-6" : "grid-cols-6"} ${compactView ? "p-2" : "p-3"}`}
    />
  ));
  GridList.displayName = "GridList";

  const GridItem = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
  >((props, ref) => (
    <div ref={ref} {...props} className="aspect-square overflow-visible" />
  ));
  GridItem.displayName = "GridItem";

  // Render content for both Sheet and Dropdown
  const renderPickerContent = () => (
    <div className="flex flex-col h-full">
      {/* Search Input */}
      <div
        className={`border-b border-gray-700/50 ${compactView ? "px-3 pb-2" : "p-3"} shrink-0`}
      >
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${compactView ? "w-3 h-3" : "w-4 h-4"} ${
              isHalloweenMode
                ? "text-[#60c9b6]/50"
                : isDark
                  ? "text-gray-400"
                  : "text-gray-500"
            }`}
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search icons..."
            autoFocus
            className={`w-full ${compactView ? "pl-8 pr-3 py-1.5 text-xs" : "pl-10 pr-4 py-2"} rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
              isHalloweenMode
                ? "bg-[#0f0f13] border-[#60c9b6]/20 text-[#60c9b6] placeholder-[#60c9b6]/40 focus:border-[#60c9b6] focus:ring-[#60c9b6]/50"
                : isDark
                  ? "bg-[rgba(26,26,31,0.6)] border-[rgba(255,255,255,0.1)] text-white placeholder-gray-500 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/50"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/50"
            }`}
          />
        </div>
      </div>

      {/* Icons Grid with Virtualization */}
      <div className="flex-1 min-h-0 pt-2">
        {icons.length === 0 ? (
          <div
            className={`py-12 text-center ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No icons found</p>
          </div>
        ) : (
          <VirtuosoGrid
            style={{ height: "100%" }}
            totalCount={icons.length}
            components={{
              List: GridList,
              Item: GridItem,
            }}
            itemContent={(index) => {
              const icon = icons[index];
              return (
                <button
                  key={icon.name}
                  onClick={() => handleSelect(icon.name)}
                  onMouseEnter={(e) => handleIconHover(e, icon)}
                  onMouseLeave={handleIconLeave}
                  className={`group w-full h-full flex items-center justify-center rounded-lg border transition-transform transition-colors duration-200 hover:scale-110 hover:z-10 relative cursor-pointer focus:outline-none focus:ring-2 ${
                    value === icon.name
                      ? isHalloweenMode
                        ? "bg-[#60c9b6]/20 border-[#60c9b6]/50 focus:ring-[#60c9b6]/50"
                        : isDark
                          ? "bg-[#8B5CF6]/20 border-[#8B5CF6]/50 focus:ring-[#8B5CF6]/50"
                          : "bg-[#8B5CF6]/10 border-[#8B5CF6]/50 focus:ring-[#8B5CF6]/50"
                      : isHalloweenMode
                        ? "border-[#60c9b6]/10 hover:bg-[#60c9b6]/10 hover:border-[#60c9b6]/30 focus:ring-[#60c9b6]/50"
                        : isDark
                          ? "border-[rgba(255,255,255,0.05)] hover:bg-white/10 hover:border-[rgba(255,255,255,0.1)] focus:ring-white/20"
                          : "border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-[#8B5CF6]/50"
                  }`}
                >
                  {React.createElement(
                    icon.Component as React.ComponentType<{
                      className?: string;
                    }>,
                    {
                      className: `${compactView ? "w-4 h-4" : "w-5 h-5"} ${
                        value === icon.name
                          ? isHalloweenMode
                            ? "text-[#60c9b6]"
                            : "text-[#8B5CF6]"
                          : isHalloweenMode
                            ? "text-[#60c9b6]/70 group-hover:text-[#60c9b6]"
                            : isDark
                              ? "text-gray-400 group-hover:text-white"
                              : "text-gray-600 group-hover:text-gray-900"
                      }`,
                    },
                  )}
                </button>
              );
            }}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {label && (
        <label
          className={`block text-sm font-medium mb-1.5 ${
            isHalloweenMode
              ? "text-[#60c9b6]"
              : isDark
                ? "text-gray-300"
                : "text-gray-700"
          }`}
        >
          {label}
        </label>
      )}
      <div className="relative" ref={pickerRef}>
        <div className="relative">
          {selectedIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <IconRenderer
                icon={selectedIcon.name}
                className={`w-5 h-5 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              />
            </div>
          )}
          <input
            ref={inputRef}
            type="text"
            readOnly
            value={selectedIcon?.friendlyName || ""}
            placeholder={placeholder}
            onClick={handleOpen}
            disabled={disabled}
            className={`w-full px-4 py-2 rounded-lg border transition-colors cursor-pointer focus:outline-none focus:ring-2 ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-opacity-80"
            } ${selectedIcon ? "pl-10" : ""} ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:ring-[#60c9b6]/50"
                : isDark
                  ? "bg-[rgba(40,40,45,0.6)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/50"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/50"
            }`}
          />
          {value && !disabled && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                isHalloweenMode
                  ? "hover:bg-[#60c9b6]/20 text-[#60c9b6]/50 hover:text-[#60c9b6]"
                  : isDark
                    ? "hover:bg-white/10 text-gray-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sheet */}
      {compactView && (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent
            side="bottom"
            className={`h-[80vh] p-0 flex flex-col rounded-t-2xl ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30"
                : isDark
                  ? "bg-[#1A1A1F] border-gray-800"
                  : "bg-white border-gray-200"
            }`}
          >
            <div
              className={`p-4 border-b ${
                isHalloweenMode
                  ? "border-[#60c9b6]/20"
                  : isDark
                    ? "border-gray-700/50"
                    : "border-gray-200"
              }`}
            >
              <SheetTitle
                className={`text-lg font-semibold ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                Select Icon
              </SheetTitle>
              <SheetDescription className="sr-only">
                Search and select an icon from the list
              </SheetDescription>
            </div>
            {renderPickerContent()}
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop Dropdown Portal */}
      {!compactView &&
        isOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              onClick={handleClose}
            >
              <motion.div
                initial={{
                  opacity: 0,
                  y: dropdownPosition.showAbove ? 10 : -10,
                }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: dropdownPosition.showAbove ? 10 : -10 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute",
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${Math.max(dropdownPosition.width, 320)}px`,
                  height: "400px",
                }}
                onClick={(e) => e.stopPropagation()}
                className={`rounded-lg border shadow-xl overflow-hidden flex flex-col ${
                  isHalloweenMode
                    ? "bg-[#1a1a1f] border-[#60c9b6]/30 shadow-[0_0_20px_rgba(96,201,182,0.2)]"
                    : isDark
                      ? "bg-[rgba(40,40,45,0.98)] border-[rgba(255,255,255,0.1)] backdrop-blur-xl"
                      : "bg-white border-gray-200"
                }`}
              >
                {renderPickerContent()}
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )}

      {/* Tooltip Portal */}
      {hoveredIcon &&
        isOpen &&
        createPortal(
          <div
            className={`fixed z-[100] px-2 py-1 rounded ${compactView ? "text-[10px]" : "text-xs"} whitespace-nowrap pointer-events-none transition-opacity shadow-lg animate-in fade-in-0 zoom-in-95 duration-200 ${
              isDark ? "bg-white text-gray-900" : "bg-gray-900 text-white"
            }`}
            style={{
              top: dropdownPosition.showAbove
                ? hoveredIcon.rect.top + hoveredIcon.rect.height + 8
                : hoveredIcon.rect.top - 10,
              left: hoveredIcon.rect.left + hoveredIcon.rect.width / 2,
              transform: dropdownPosition.showAbove
                ? "translate(-50%, 0)"
                : "translate(-50%, -100%)",
            }}
          >
            {hoveredIcon.friendlyName}
            <div
              className={`absolute w-2 h-2 rotate-45 left-1/2 -translate-x-1/2 ${
                isDark ? "bg-white" : "bg-gray-900"
              } ${dropdownPosition.showAbove ? "-top-1" : "-bottom-1"}`}
            />
          </div>,
          document.body,
        )}
    </div>
  );
};
