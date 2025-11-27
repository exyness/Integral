/** biome-ignore-all lint/correctness/useExhaustiveDependencies: false positive */
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface ComboBoxOption {
  value: string;
  label: string;
}

interface ComboBoxProps {
  value: string;
  onChange: (value: string) => void;
  options: ComboBoxOption[];
  placeholder?: string;
  title?: string;
  className?: string;
}

export const ComboBox: React.FC<ComboBoxProps> = ({
  value,
  onChange,
  options,
  placeholder = "Type or select...",
  title,
  className,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleOptionSelect = (option: ComboBoxOption) => {
    setInputValue(option.label);
    onChange(option.value);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (filteredOptions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  useEffect(() => {
    if (isOpen && optionsRef.current[highlightedIndex]) {
      optionsRef.current[highlightedIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [highlightedIndex, isOpen]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const portalElement = portalRef.current;
      const containerElement = containerRef.current;

      // Check if click is outside both the container and the portal
      if (
        containerElement &&
        !containerElement.contains(event.target as Node) &&
        portalElement &&
        !portalElement.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const selectedOption = options.find((opt) => opt.value === value);
    if (selectedOption) {
      setInputValue(selectedOption.label);
    } else if (!value) {
      setInputValue("");
    }
  }, [value, options]);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTriggerRect(rect);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setTriggerRect(rect);
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [isOpen]);

  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = portalRef.current;
    if (!element) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.stopPropagation();
    };

    element.addEventListener("mousedown", handleMouseDown);
    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isOpen, filteredOptions.length, triggerRect]);

  const getPortalStyles = useMemo((): React.CSSProperties => {
    if (!triggerRect) return {};
    return {
      position: "fixed",
      left: triggerRect.left,
      top: triggerRect.bottom + 8,
      width: triggerRect.width,
      zIndex: 9999,
    };
  }, [triggerRect]);

  const portalContent = (
    <AnimatePresence>
      {isOpen && filteredOptions.length > 0 && triggerRect && (
        <motion.div
          ref={portalRef}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={getPortalStyles}
          className={`rounded-lg shadow-xl backdrop-blur-md max-h-60 md:max-h-96 overflow-y-auto p-1.5 md:p-2 ${
            isHalloweenMode
              ? "bg-[#1a1a1f]/95 border border-[#60c9b6]/30 shadow-[0_0_15px_rgba(96,201,182,0.2)]"
              : isDark
                ? "bg-[rgba(26,26,31,0.95)] border border-[rgba(255,255,255,0.1)]"
                : "bg-white border border-gray-200"
          }`}
        >
          <div className="p-0">
            {filteredOptions.map((option, index) => (
              <motion.button
                key={option.value}
                ref={(el) => {
                  optionsRef.current[index] = el;
                }}
                type="button"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleOptionSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full text-left px-2.5 md:px-3 py-1.5 md:py-2 text-xs md:text-sm transition-colors rounded-lg mb-1 last:mb-0 cursor-pointer ${
                  index === highlightedIndex
                    ? isHalloweenMode
                      ? "bg-[#60c9b6]/20 text-[#60c9b6]"
                      : isDark
                        ? "bg-[rgba(139,92,246,0.2)] text-white"
                        : "bg-[rgba(139,92,246,0.1)] text-gray-900"
                    : isHalloweenMode
                      ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                      : isDark
                        ? "text-[#B4B4B8] hover:bg-[rgba(139,92,246,0.1)] hover:text-white"
                        : "text-gray-700 hover:bg-[rgba(139,92,246,0.1)] hover:text-gray-900"
                }`}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={cn("", className)} ref={containerRef}>
      {title && (
        <label
          className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
            isHalloweenMode
              ? "text-[#60c9b6]"
              : isDark
                ? "text-[#B4B4B8]"
                : "text-gray-700"
          }`}
        >
          {title}
        </label>
      )}
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            className={`w-full rounded-lg px-3 py-2 pr-10 text-xs md:text-sm focus:outline-hidden transition-colors ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                : isDark
                  ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:border-[#3B82F6]"
                  : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#3B82F6]"
            }`}
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors cursor-pointer ${
              isHalloweenMode
                ? "hover:bg-[#60c9b6]/10 text-[#60c9b6]"
                : isDark
                  ? "hover:bg-[rgba(255,255,255,0.05)]"
                  : "hover:bg-gray-100"
            }`}
          >
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown
                className={`h-3.5 md:h-4 w-3.5 md:w-4 ${
                  isDark ? "text-[#B4B4B8]" : "text-gray-600"
                }`}
              />
            </motion.div>
          </button>
        </div>
        {typeof document !== "undefined" &&
          createPortal(portalContent, document.body)}
      </div>
    </div>
  );
};
