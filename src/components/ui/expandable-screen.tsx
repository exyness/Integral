"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

// Context
interface ExpandableScreenContextValue {
  isExpanded: boolean;
  expand: () => void;
  collapse: () => void;
  layoutId: string;
  triggerRadius: string;
  contentRadius: string;
  animationDuration: number;
}

const ExpandableScreenContext =
  createContext<ExpandableScreenContextValue | null>(null);

function useExpandableScreen() {
  const context = useContext(ExpandableScreenContext);
  if (!context) {
    throw new Error(
      "useExpandableScreen must be used within an ExpandableScreen",
    );
  }
  return context;
}

// Root Component
interface ExpandableScreenProps {
  children: ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  layoutId?: string;
  triggerRadius?: string;
  contentRadius?: string;
  animationDuration?: number;
  lockScroll?: boolean;
}

export function ExpandableScreen({
  children,
  defaultExpanded = false,
  expanded,
  onExpandChange,
  layoutId = "expandable-card",
  triggerRadius = "100px",
  contentRadius = "24px",
  animationDuration = 0.3,
  lockScroll = true,
}: ExpandableScreenProps) {
  const [isExpandedInternal, setIsExpandedInternal] = useState(defaultExpanded);

  const isExpanded = expanded !== undefined ? expanded : isExpandedInternal;

  const expand = () => {
    if (expanded === undefined) setIsExpandedInternal(true);
    onExpandChange?.(true);
  };

  const collapse = () => {
    if (expanded === undefined) setIsExpandedInternal(false);
    onExpandChange?.(false);
  };

  useEffect(() => {
    if (lockScroll) {
      if (isExpanded) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
    }
  }, [isExpanded, lockScroll]);

  return (
    <ExpandableScreenContext.Provider
      value={{
        isExpanded,
        expand,
        collapse,
        layoutId,
        triggerRadius,
        contentRadius,
        animationDuration,
      }}
    >
      {children}
    </ExpandableScreenContext.Provider>
  );
}

// Trigger Component
interface ExpandableScreenTriggerProps {
  children: ReactNode;
  className?: string;
  childrenClassName?: string;
}

export function ExpandableScreenTrigger({
  children,
  className = "",
  childrenClassName = "",
}: ExpandableScreenTriggerProps) {
  const { isExpanded, expand, layoutId, triggerRadius } = useExpandableScreen();

  return (
    <AnimatePresence initial={false}>
      {!isExpanded && (
        <motion.div className={cn("inline-block relative", className)}>
          {/* Background layer with shared layoutId for morphing */}
          <motion.div
            style={{
              borderRadius: triggerRadius,
            }}
            layout
            layoutId={layoutId}
            className="absolute inset-0 transform-gpu will-change-transform"
          />
          {/* Content layer that fades out on expand */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            exit={{ opacity: 0, scale: 0.8 }}
            layout={false}
            onClick={expand}
            className={cn("relative cursor-pointer", childrenClassName)}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Content Component
interface ExpandableScreenContentProps {
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeButtonClassName?: string;
}

export function ExpandableScreenContent({
  children,
  className = "",
  showCloseButton = true,
  closeButtonClassName = "",
}: ExpandableScreenContentProps) {
  const { isExpanded, collapse, layoutId, contentRadius, animationDuration } =
    useExpandableScreen();
  const { isDark, isHalloweenMode } = useTheme();

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-2">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={collapse}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Morphing background with shared layoutId */}
          <motion.div
            layoutId={layoutId}
            transition={{ duration: animationDuration }}
            style={{
              borderRadius: contentRadius,
            }}
            layout
            className={cn(
              "relative flex h-full w-full overflow-y-auto transform-gpu will-change-transform z-10",
              className,
            )}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="relative z-20 w-full h-full"
            >
              {children}
            </motion.div>

            {showCloseButton && (
              <motion.button
                onClick={collapse}
                className={cn(
                  "absolute right-6 top-6 z-30 flex h-10 w-10 items-center justify-center transition-colors rounded-full cursor-pointer",
                  closeButtonClassName ||
                    (isHalloweenMode
                      ? "text-[#60c9b6] bg-[#60c9b6]/10 hover:bg-[#60c9b6]/20"
                      : isDark
                        ? "text-white bg-white/10 hover:bg-white/20"
                        : "text-gray-600 bg-gray-100 hover:text-gray-900 hover:bg-gray-200"),
                )}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </motion.button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Background Component (optional)
interface ExpandableScreenBackgroundProps {
  trigger?: ReactNode;
  content?: ReactNode;
  className?: string;
}

export function ExpandableScreenBackground({
  trigger,
  content,
  className = "",
}: ExpandableScreenBackgroundProps) {
  const { isExpanded } = useExpandableScreen();

  if (isExpanded && content) {
    return <div className={className}>{content}</div>;
  }

  if (!isExpanded && trigger) {
    return <div className={className}>{trigger}</div>;
  }

  return null;
}

export { useExpandableScreen };
