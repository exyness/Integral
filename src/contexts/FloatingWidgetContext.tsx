import React, { createContext, ReactNode, useContext, useState } from "react";
import { ExpandableScreen } from "@/components/ui/expandable-screen";

interface FloatingWidgetContextType {
  isWidgetVisible: boolean;
  setWidgetVisible: (visible: boolean) => void;
  toggleWidget: () => void;
  isSearchModalOpen: boolean;
  setSearchModalOpen: (visible: boolean) => void;
  toggleSearchModal: () => void;
  isAIChatOpen: boolean;
  setAIChatOpen: (visible: boolean) => void;
  isTimerExpanded: boolean;
  setTimerExpanded: (expanded: boolean) => void;
}

const FloatingWidgetContext = createContext<
  FloatingWidgetContextType | undefined
>(undefined);

export const useFloatingWidget = () => {
  const context = useContext(FloatingWidgetContext);
  if (context === undefined) {
    throw new Error(
      "useFloatingWidget must be used within a FloatingWidgetProvider",
    );
  }
  return context;
};

interface FloatingWidgetProviderProps {
  children: ReactNode;
}

export const FloatingWidgetProvider: React.FC<FloatingWidgetProviderProps> = ({
  children,
}) => {
  const [isWidgetVisible, setIsWidgetVisible] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpenState] = useState(false);
  const [isTimerExpanded, setIsTimerExpandedState] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const setWidgetVisible = (visible: boolean) => {
    setIsWidgetVisible(visible);
  };

  const toggleWidget = () => {
    setIsWidgetVisible(!isWidgetVisible);
  };

  const setSearchModalOpen = (visible: boolean) => {
    setIsSearchModalOpen(visible);
  };

  const toggleSearchModal = () => {
    setIsSearchModalOpen(!isSearchModalOpen);
  };

  // Mutual exclusivity: when AI chat opens, collapse timer
  const setAIChatOpen = (visible: boolean) => {
    if (visible) {
      setIsTimerExpandedState(false);
    }
    setIsAIChatOpenState(visible);
  };

  // Mutual exclusivity: when timer expands, close AI chat
  const setTimerExpanded = (expanded: boolean) => {
    if (expanded) {
      setIsAIChatOpenState(false);
    }
    setIsTimerExpandedState(expanded);
  };

  return (
    <FloatingWidgetContext.Provider
      value={{
        isWidgetVisible,
        setWidgetVisible,
        toggleWidget,
        isSearchModalOpen,
        setSearchModalOpen,
        toggleSearchModal,
        isAIChatOpen,
        setAIChatOpen,
        isTimerExpanded,
        setTimerExpanded,
      }}
    >
      <ExpandableScreen
        expanded={isSearchModalOpen}
        onExpandChange={setSearchModalOpen}
        layoutId="search-modal-expand"
      >
        {children}
      </ExpandableScreen>
    </FloatingWidgetContext.Provider>
  );
};
