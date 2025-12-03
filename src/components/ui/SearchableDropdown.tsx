import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search } from "lucide-react";
import * as React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

type DropdownPosition = "top" | "bottom";

interface SelectContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedValue: string | undefined;
  setSelectedValue: (value: string, label: React.ReactNode) => void;
  selectedLabel: React.ReactNode;
  placeholder?: string;
  contentPosition: DropdownPosition;
  triggerRect: DOMRect | null;
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
  itemCount: number;
  setItemCount: (count: number) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

const SelectContext = createContext<SelectContextType | null>(null);

const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error(
      "Select components must be used within a <Select> provider",
    );
  }
  return context;
};

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}

const Select = ({
  children,
  value,
  onValueChange,
  placeholder,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{
    value?: string;
    label: React.ReactNode;
  }>({
    value: value,
    label: placeholder,
  });
  const [contentPosition, setContentPosition] =
    useState<DropdownPosition>("bottom");
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < itemCount - 1 ? prev + 1 : prev,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
        case "Tab":
          setIsOpen(false);
          break;
      }
    },
    [isOpen, itemCount],
  );

  const selectRef = useRef<HTMLDivElement>(null);

  const setSelectedValue = useCallback(
    (newValue: string, newLabel: React.ReactNode) => {
      onValueChange?.(newValue);
      setSelectedOption({ value: newValue, label: newLabel });
      setIsOpen(false);
    },
    [onValueChange],
  );

  const findLabel = useCallback(
    (nodes: React.ReactNode, targetValue: string): React.ReactNode => {
      let foundLabel: React.ReactNode = null;

      const searchInChildren = (children: React.ReactNode): React.ReactNode => {
        React.Children.forEach(children, (child) => {
          if (foundLabel) return;

          if (React.isValidElement(child) && child.props) {
            const props = child.props as {
              value?: string;
              children?: React.ReactNode;
            };

            if (props.value === targetValue) {
              foundLabel = props.children;
            } else if (props.children) {
              const nestedLabel = searchInChildren(props.children);
              if (nestedLabel) foundLabel = nestedLabel;
            }
          }
        });
        return foundLabel;
      };

      return searchInChildren(nodes);
    },
    [],
  );

  useEffect(() => {
    if (value !== undefined) {
      const label = findLabel(children, value) || placeholder;
      setSelectedOption({ value, label });
    }
  }, [value, children, placeholder, findLabel]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const calculatePosition = () => {
      if (selectRef.current) {
        const triggerEl = selectRef.current.querySelector("button");
        if (!triggerEl) return;

        const rect = triggerEl.getBoundingClientRect();
        setTriggerRect(rect);

        const viewportHeight = window.innerHeight;
        const contentHeightEstimate = 240;

        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (
          spaceBelow < contentHeightEstimate &&
          spaceAbove > contentHeightEstimate
        ) {
          setContentPosition("top");
        } else {
          setContentPosition("bottom");
        }
      }
    };

    calculatePosition();
    window.addEventListener("scroll", calculatePosition, true);
    window.addEventListener("resize", calculatePosition);

    return () => {
      window.removeEventListener("scroll", calculatePosition, true);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [isOpen]);

  const contextValue = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      selectedValue: value,
      setSelectedValue,
      selectedLabel: selectedOption.label,
      placeholder,
      contentPosition,
      triggerRect,
      highlightedIndex,
      setHighlightedIndex,
      itemCount,
      setItemCount,
      handleKeyDown,
    }),
    [
      isOpen,
      value,
      setSelectedValue,
      selectedOption.label,
      placeholder,
      contentPosition,
      triggerRect,
      highlightedIndex,
      itemCount,
      handleKeyDown,
    ],
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative" ref={selectRef}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { isOpen, setIsOpen, handleKeyDown } = useSelectContext();
  const { isDark, isHalloweenMode } = useTheme();

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "w-full rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-hidden cursor-pointer transition-all duration-200 flex items-center justify-between backdrop-blur-sm",
        isHalloweenMode
          ? "bg-[rgba(96,201,182,0.1)] border border-[rgba(96,201,182,0.3)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.15)] hover:border-[rgba(96,201,182,0.5)] focus:border-[#60c9b6] focus:ring-1 focus:ring-[#60c9b6]"
          : isDark
            ? "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#B4B4B8] hover:text-white hover:border-[rgba(139,92,246,0.5)] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
            : "bg-white border border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]",
        className,
      )}
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          mass: 0.8,
        }}
      >
        <ChevronDown
          className={`h-4 w-4 ${
            isHalloweenMode
              ? "text-[#60c9b6]"
              : isDark
                ? "text-[#B4B4B8]"
                : "text-gray-500"
          }`}
        />
      </motion.div>
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<HTMLSpanElement, { placeholder?: string }>(
  ({ placeholder }, ref) => {
    const { selectedLabel, placeholder: contextPlaceholder } =
      useSelectContext();
    const { isDark, isHalloweenMode } = useTheme();
    const displayLabel = selectedLabel || placeholder || contextPlaceholder;

    return (
      <span
        ref={ref}
        className={cn(
          "flex items-center flex-1",
          !selectedLabel &&
            (isHalloweenMode
              ? "text-[#60c9b6]/60"
              : isDark
                ? "text-[#71717A]"
                : "text-gray-500"),
          selectedLabel &&
            (isHalloweenMode
              ? "text-[#60c9b6]"
              : isDark
                ? "text-white"
                : "text-gray-900"),
        )}
      >
        {displayLabel}
      </span>
    );
  },
);
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  {
    className?: string;
    children: React.ReactNode;
    searchBar?: React.ReactNode;
  }
>(({ className, children, searchBar }, ref) => {
  const {
    isOpen,
    contentPosition,
    triggerRect,
    setItemCount,
    highlightedIndex,
    setSelectedValue,
  } = useSelectContext();
  const { isDark, isHalloweenMode } = useTheme();

  const animationVariants = useMemo(
    () => ({
      initial: {
        opacity: 0,
        y: contentPosition === "top" ? 8 : -8,
        scale: 0.92,
      },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: contentPosition === "top" ? 8 : -8, scale: 0.92 },
    }),
    [contentPosition],
  );

  const getPortalStyles = useMemo((): React.CSSProperties => {
    if (!triggerRect) return {};

    const baseStyles: React.CSSProperties = {
      position: "fixed",
      left: triggerRect.left,
      width: triggerRect.width,
      zIndex: 9999,
    };

    return contentPosition === "top"
      ? { ...baseStyles, bottom: window.innerHeight - triggerRect.top + 8 }
      : { ...baseStyles, top: triggerRect.bottom + 8 };
  }, [triggerRect, contentPosition]);

  // Update item count
  useEffect(() => {
    setItemCount(React.Children.count(children));
  }, [children, setItemCount]);

  // Handle Enter key selection
  React.useEffect(() => {
    const handleEnterKey = (e: KeyboardEvent) => {
      if (isOpen && (e.key === "Enter" || e.key === " ")) {
        const childArray = React.Children.toArray(children);
        if (childArray[highlightedIndex]) {
          const child = childArray[highlightedIndex] as React.ReactElement<{
            value: string;
            children: React.ReactNode;
            disabled?: boolean;
          }>;
          if (child.props && !child.props.disabled) {
            setSelectedValue(child.props.value, child.props.children);
          }
        }
      }
    };

    // We attach this to window because the focus is on the trigger
    window.addEventListener("keydown", handleEnterKey);
    return () => window.removeEventListener("keydown", handleEnterKey);
  }, [isOpen, highlightedIndex, children, setSelectedValue]);

  const content = (
    <AnimatePresence>
      {isOpen && triggerRect && (
        <motion.div
          ref={ref}
          role="listbox"
          onMouseDown={(e) => e.stopPropagation()}
          initial={animationVariants.initial}
          animate={animationVariants.animate}
          exit={animationVariants.exit}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            mass: 0.8,
            duration: 0.3,
          }}
          style={getPortalStyles}
          className={cn(
            "flex flex-col min-w-32 rounded-lg shadow-xl backdrop-blur-md overflow-hidden",
            isHalloweenMode
              ? "border border-[rgba(96,201,182,0.3)] bg-[rgba(26,26,31,0.95)] text-[#60c9b6] shadow-[0_0_15px_rgba(96,201,182,0.2)]"
              : isDark
                ? "border border-[rgba(255,255,255,0.1)] bg-[rgba(26,26,31,0.95)] text-[#B4B4B8]"
                : "border border-gray-200 bg-white text-gray-700",
            className,
          )}
        >
          {searchBar && (
            <div
              className={cn(
                "flex-none px-2 pt-2 pb-2 border-b z-10",
                isHalloweenMode
                  ? "bg-[#1a1a1f] border-[#60c9b6]/20"
                  : isDark
                    ? "bg-[#1a1a1f] border-white/10"
                    : "bg-white border-gray-100",
              )}
            >
              {searchBar}
            </div>
          )}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-2 max-h-60">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    duration: 0.15,
                  },
                },
              }}
            >
              {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                  return React.cloneElement(
                    child as React.ReactElement<{
                      index?: number;
                      isHighlighted?: boolean;
                    }>,
                    {
                      index,
                      isHighlighted: index === highlightedIndex,
                    },
                  );
                }
                return child;
              })}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof document !== "undefined"
    ? createPortal(content, document.body)
    : null;
});
SelectContent.displayName = "SelectContent";

// Create a wrapper to track open/close state
const SelectContentWithOpenTracking = React.forwardRef<
  HTMLDivElement,
  {
    className?: string;
    children: React.ReactNode;
    searchBar?: React.ReactNode;
    onOpenChange?: (open: boolean) => void;
  }
>(({ onOpenChange, ...props }, ref) => {
  const { isOpen } = useSelectContext();
  const prevOpenRef = useRef(isOpen);

  useEffect(() => {
    if (prevOpenRef.current !== isOpen) {
      onOpenChange?.(isOpen);
      prevOpenRef.current = isOpen;
    }
  }, [isOpen, onOpenChange]);

  return <SelectContent ref={ref} {...props} />;
});
SelectContentWithOpenTracking.displayName = "SelectContentWithOpenTracking";

const SelectItem = React.forwardRef<
  HTMLDivElement,
  {
    className?: string;
    children: React.ReactNode;
    value: string;
    disabled?: boolean;
    index?: number;
    isHighlighted?: boolean;
  }
>(({ className, children, value, disabled, index, isHighlighted }, ref) => {
  const { selectedValue, setSelectedValue } = useSelectContext();
  const { isDark, isHalloweenMode } = useTheme();
  const isSelected = selectedValue === value;

  const hoverStyles = isHalloweenMode
    ? {
        backgroundColor: "rgba(96,201,182,0.15)",
        color: "#60c9b6",
        transition: { duration: 0.2, ease: "easeOut" as const },
      }
    : isDark
      ? {
          backgroundColor: "rgba(139,92,246,0.1)",
          color: "#ffffff",
          transition: { duration: 0.2, ease: "easeOut" as const },
        }
      : {
          backgroundColor: "rgba(139,92,246,0.1)",
          color: "#1f2937",
          transition: { duration: 0.2, ease: "easeOut" as const },
        };

  const tapStyles = isHalloweenMode
    ? {
        backgroundColor: "rgba(96,201,182,0.25)",
        transition: { duration: 0.1, ease: "easeOut" as const },
      }
    : isDark
      ? {
          backgroundColor: "rgba(139,92,246,0.2)",
          transition: { duration: 0.1, ease: "easeOut" as const },
        }
      : {
          backgroundColor: "rgba(139,92,246,0.15)",
          transition: { duration: 0.1, ease: "easeOut" as const },
        };

  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHighlighted && itemRef.current) {
      itemRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [isHighlighted]);

  const combinedRef = useCallback(
    (node: HTMLDivElement) => {
      itemRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref],
  );

  return (
    <motion.div
      ref={combinedRef}
      role="option"
      aria-selected={isSelected}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
      whileHover={!disabled ? hoverStyles : undefined}
      whileTap={!disabled ? tapStyles : undefined}
      onClick={() => !disabled && setSelectedValue(value, children)}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg py-2.5 px-3 mb-1 text-[10px] md:text-xs outline-hidden border border-transparent transition-colors duration-200 ease-out",
        isHalloweenMode
          ? "text-[#60c9b6]"
          : isDark
            ? "text-[#B4B4B8]"
            : "text-gray-700",
        isSelected &&
          (isHalloweenMode
            ? "bg-[rgba(96,201,182,0.2)]! text-[#60c9b6]! border-[rgba(96,201,182,0.5)]!"
            : isDark
              ? "bg-[rgba(139,92,246,0.2)]! text-white! border-[rgba(139,92,246,0.5)]!"
              : "bg-[rgba(139,92,246,0.15)]! text-gray-900! border-[rgba(139,92,246,0.3)]!"),
        isHighlighted &&
          (isHalloweenMode
            ? "bg-[rgba(96,201,182,0.15)] text-[#60c9b6]"
            : isDark
              ? "bg-[rgba(139,92,246,0.1)] text-white"
              : "bg-[rgba(139,92,246,0.1)] text-gray-900"),
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      {children}
      <span className="flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 25,
              mass: 0.4,
              delay: 0.1,
            }}
          >
            <Check className="h-4 w-4" />
          </motion.div>
        )}
      </span>
    </motion.div>
  );
});
SelectItem.displayName = "SelectItem";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface SearchableDropdownProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  options: DropdownOption[];
  title?: string;
  disabled?: boolean;
}

export const SearchableDropdown = React.memo(
  ({
    value,
    onValueChange,
    placeholder = "Select an option",
    className,
    options,
    title,
    disabled = false,
  }: SearchableDropdownProps) => {
    const { isDark, isHalloweenMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
      }, 150);
      return () => clearTimeout(timer);
    }, [searchTerm]);

    const filteredOptions = useMemo(() => {
      if (!debouncedSearchTerm) return options;
      return options.filter((option) =>
        option.label.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
      );
    }, [options, debouncedSearchTerm]);

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle navigation keys
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); // Prevent cursor movement in input
        // Allow event to bubble to Select's handleKeyDown for navigation
        return;
      }
      if (e.key === "Enter" || e.key === "Escape" || e.key === "Tab") {
        // Allow these to bubble to Select
        return;
      }
      // Stop propagation for typing to prevent triggering Select's keyboard handlers
      e.stopPropagation();
    };

    const handleValueChange = (newValue: string) => {
      onValueChange?.(newValue);
      setSearchTerm(""); // Clear search on selection
    };

    return (
      <div className={cn("", className)}>
        {title && (
          <label
            className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-[#B4B4B8]"
                  : "text-gray-600"
            }`}
          >
            {title}
          </label>
        )}
        <Select
          value={value}
          onValueChange={handleValueChange}
          placeholder={placeholder}
        >
          <SelectTrigger
            className={disabled ? "opacity-50 cursor-not-allowed" : ""}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContentWithOpenTracking
            onOpenChange={(open) => {
              if (open) {
                setTimeout(() => searchInputRef.current?.focus(), 100);
              } else {
                setSearchTerm("");
              }
            }}
            searchBar={
              <div className="relative">
                <Search
                  className={`absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${
                    isHalloweenMode
                      ? "text-[#60c9b6]/50"
                      : isDark
                        ? "text-gray-500"
                        : "text-gray-400"
                  }`}
                />
                <input
                  ref={searchInputRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search..."
                  className={`w-full pl-8 pr-3 py-1.5 text-[10px] md:text-xs rounded-md outline-none transition-colors ${
                    isHalloweenMode
                      ? "bg-[#60c9b6]/10 text-[#60c9b6] placeholder-[#60c9b6]/40 focus:bg-[#60c9b6]/20"
                      : isDark
                        ? "bg-white/5 text-gray-200 placeholder-gray-500 focus:bg-white/10"
                        : "bg-gray-100 text-gray-900 placeholder-gray-500 focus:bg-gray-200"
                  }`}
                />
              </div>
            }
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  <div className="flex items-center space-x-2">
                    {option.icon && <span>{option.icon}</span>}
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))
            ) : (
              <div
                className={`px-3 py-2 text-xs text-center ${
                  isHalloweenMode
                    ? "text-[#60c9b6]/50"
                    : isDark
                      ? "text-gray-500"
                      : "text-gray-400"
                }`}
              >
                No results found
              </div>
            )}
          </SelectContentWithOpenTracking>
        </Select>
      </div>
    );
  },
);

SearchableDropdown.displayName = "SearchableDropdown";
