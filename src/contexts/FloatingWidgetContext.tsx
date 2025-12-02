import React, { createContext, ReactNode, useContext, useState } from "react";
import { ExpandableScreen } from "@/components/ui/expandable-screen";

interface FloatingWidgetContextType {
  isWidgetVisible: boolean;
  setWidgetVisible: (visible: boolean) => void;
  toggleWidget: () => void;
  isSearchModalOpen: boolean;
  setSearchModalOpen: (visible: boolean) => void;
  toggleSearchModal: () => void;
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

  return (
    <FloatingWidgetContext.Provider
      value={{
        isWidgetVisible,
        setWidgetVisible,
        toggleWidget,
        isSearchModalOpen,
        setSearchModalOpen,
        toggleSearchModal,
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
