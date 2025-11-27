import React, { createContext, ReactNode, useContext, useState } from "react";

interface FloatingWidgetContextType {
  isWidgetVisible: boolean;
  setWidgetVisible: (visible: boolean) => void;
  toggleWidget: () => void;
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

  const setWidgetVisible = (visible: boolean) => {
    setIsWidgetVisible(visible);
  };

  const toggleWidget = () => {
    setIsWidgetVisible(!isWidgetVisible);
  };

  return (
    <FloatingWidgetContext.Provider
      value={{ isWidgetVisible, setWidgetVisible, toggleWidget }}
    >
      {children}
    </FloatingWidgetContext.Provider>
  );
};
