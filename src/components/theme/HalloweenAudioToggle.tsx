import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface HalloweenAudioToggleProps {
  className?: string;
}

export const HalloweenAudioToggle = ({
  className = "",
}: HalloweenAudioToggleProps) => {
  const { isHalloweenMode, isAudioMuted, toggleAudioMute } = useTheme();

  // Only show when Halloween mode is active
  if (!isHalloweenMode) {
    return null;
  }

  return (
    <motion.button
      type="button"
      className={cn(
        "flex items-center justify-center cursor-pointer rounded-full transition-all duration-200 active:scale-95 border w-7 h-7 will-change-transform",
        "bg-[rgba(249,115,22,0.2)] border-[rgba(249,115,22,0.3)] hover:bg-[rgba(249,115,22,0.3)] hover:scale-105",
        className,
      )}
      onClick={toggleAudioMute}
      title={isAudioMuted ? "Unmute Halloween Audio" : "Mute Halloween Audio"}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      {isAudioMuted ? (
        <VolumeX className="w-4 h-4 text-orange-400" />
      ) : (
        <Volume2 className="w-4 h-4 text-orange-400" />
      )}
    </motion.button>
  );
};
