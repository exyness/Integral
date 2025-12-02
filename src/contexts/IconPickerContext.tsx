import React, { createContext, useContext, useMemo, useState } from "react";
import * as FA6Icons from "react-icons/fa6";

export type IconInfo = {
  name: string;
  friendlyName: string;
  Component: React.ComponentType<{ className?: string }>;
};

interface IconPickerContextType {
  icons: IconInfo[];
  allIcons: IconInfo[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const IconPickerContext = createContext<IconPickerContextType | undefined>(
  undefined,
);

export const IconPickerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const allIcons: IconInfo[] = useMemo(
    () =>
      Object.entries(FA6Icons)
        .filter(([name]) => name.startsWith("Fa"))
        .map(([iconName, IconComponent]) => ({
          name: iconName,
          friendlyName:
            iconName
              .replace(/^Fa/, "")
              .match(/[A-Z][a-z]+/g)
              ?.join(" ") ?? iconName,
          Component: IconComponent as React.ComponentType<{
            className?: string;
          }>,
        })),
    [],
  );

  const filteredIcons = useMemo(() => {
    if (!searchTerm.trim()) {
      return allIcons;
    }
    const search = searchTerm.toLowerCase();
    return allIcons.filter(
      (icon) =>
        icon.name.toLowerCase().includes(search) ||
        icon.friendlyName.toLowerCase().includes(search),
    );
  }, [allIcons, searchTerm]);

  return (
    <IconPickerContext.Provider
      value={{
        icons: filteredIcons,
        allIcons,
        searchTerm,
        setSearchTerm,
      }}
    >
      {children}
    </IconPickerContext.Provider>
  );
};

export const useIconPicker = () => {
  const context = useContext(IconPickerContext);
  if (!context) {
    throw new Error("useIconPicker must be used within IconPickerProvider");
  }
  return context;
};

// Utility component to render an icon by name
export const IconRenderer = ({
  icon,
  className = "",
}: {
  icon: string;
  className?: string;
}) => {
  if (!icon) {
    return null;
  }

  let IconComponent = FA6Icons[
    icon as keyof typeof FA6Icons
  ] as React.ComponentType<{ className?: string }>;

  // Fallback: Try prepending "Fa" if not found and doesn't start with "Fa"
  if (!IconComponent && !icon.startsWith("Fa")) {
    IconComponent = FA6Icons[
      `Fa${icon}` as keyof typeof FA6Icons
    ] as React.ComponentType<{ className?: string }>;
  }

  if (!IconComponent) {
    // console.warn(`Icon not found: ${icon}`);
    // Final fallback to FaTag
    IconComponent = FA6Icons["FaTag"] as React.ComponentType<{
      className?: string;
    }>;
  }

  if (!IconComponent) {
    return null;
  }

  return <IconComponent className={className} />;
};
