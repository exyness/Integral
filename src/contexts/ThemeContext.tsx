import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  bgBluePumpkins,
  bgSacredCatMoon,
  bgWitchGraveyard,
  themeMusic,
} from "@/assets";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isHalloweenMode: boolean;
  toggleHalloweenMode: () => void;
  halloweenBackground: string;
  isAudioMuted: boolean;
  toggleAudioMute: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const backgrounds = [bgBluePumpkins, bgSacredCatMoon, bgWitchGraveyard];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [isHalloweenMode, setIsHalloweenMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [halloweenBackground, setHalloweenBackground] = useState("");
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");

      if (isHalloweenMode) {
        setIsHalloweenMode(false);
        localStorage.setItem("halloweenMode", "false");
        document.documentElement.classList.remove("halloween");

        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleAudioMute = () => {
    const newMutedState = !isAudioMuted;
    setIsAudioMuted(newMutedState);
    localStorage.setItem("halloweenAudioMuted", String(newMutedState));

    if (audioRef.current) {
      if (newMutedState) {
        audioRef.current.pause();
      } else if (isHalloweenMode) {
        audioRef.current
          .play()
          .catch((err) => console.log("Audio play failed:", err));
      }
    }
  };

  const toggleHalloweenMode = () => {
    const newMode = !isHalloweenMode;
    setIsHalloweenMode(newMode);
    localStorage.setItem("halloweenMode", String(newMode));

    if (newMode) {
      const randomBg =
        backgrounds[Math.floor(Math.random() * backgrounds.length)];
      setHalloweenBackground(randomBg);
      localStorage.setItem("halloweenBackground", randomBg);

      document.documentElement.classList.add("halloween");

      if (!audioRef.current) {
        audioRef.current = new Audio(themeMusic);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.25;
      }
      if (!isAudioMuted) {
        audioRef.current
          .play()
          .catch((err) => console.log("Audio play failed:", err));
      }
    } else {
      setHalloweenBackground("");
      document.documentElement.classList.remove("halloween");

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const savedHalloweenMode = localStorage.getItem("halloweenMode") === "true";
    const savedBackground =
      localStorage.getItem("halloweenBackground") || backgrounds[0];
    const savedAudioMuted =
      localStorage.getItem("halloweenAudioMuted") === "true";
    const initialTheme = savedTheme || "dark";

    document.documentElement.classList.remove("dark", "light");
    setThemeState(initialTheme);
    setIsHalloweenMode(savedHalloweenMode);
    setHalloweenBackground(savedBackground);
    setIsAudioMuted(savedAudioMuted);

    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    if (savedHalloweenMode && initialTheme === "dark") {
      document.documentElement.classList.add("halloween");

      if (!audioRef.current) {
        audioRef.current = new Audio(themeMusic);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.25;
      }
      if (!savedAudioMuted) {
        audioRef.current
          .play()
          .catch((err) => console.log("Audio autoplay blocked:", err));
      }
    } else if (savedHalloweenMode && initialTheme !== "dark") {
      setIsHalloweenMode(false);
      localStorage.setItem("halloweenMode", "false");
    }

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isHalloweenMode && halloweenBackground) {
      document.body.style.setProperty(
        "--halloween-bg",
        `url(${halloweenBackground})`,
      );
    } else {
      document.body.style.removeProperty("--halloween-bg");
    }
  }, [isHalloweenMode, halloweenBackground]);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        toggleTheme,
        setTheme,
        isHalloweenMode,
        toggleHalloweenMode,
        halloweenBackground,
        isAudioMuted,
        toggleAudioMute,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
