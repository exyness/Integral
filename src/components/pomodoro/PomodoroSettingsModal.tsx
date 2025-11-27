import React, { useState } from "react";
import { ghostDroopy, treeSceneryCurly } from "@/assets";
import { Checkbox } from "@/components/ui/Checkbox";
import { Modal } from "@/components/ui/Modal";
import { useTheme } from "@/contexts/ThemeContext";
import {
  PomodoroSettings as PomodoroSettingsType,
  usePomodoro,
} from "@/hooks/usePomodoro";

interface PomodoroSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PomodoroSettingsModal: React.FC<PomodoroSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { settings, updateSettings } = usePomodoro();
  const [localSettings, setLocalSettings] =
    useState<PomodoroSettingsType>(settings);

  const handleSave = async () => {
    await updateSettings(localSettings);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onClose();
  };

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Timer Settings"
      size="xl"
      className={`relative overflow-hidden ${
        isHalloweenMode
          ? "bg-[rgba(96,201,182,0.15)]! border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]!"
          : ""
      }`}
    >
      {isHalloweenMode && (
        <>
          <div className="absolute -bottom-4 -left-4 pointer-events-none z-0">
            <img
              src={treeSceneryCurly}
              alt=""
              className="w-32 h-32 opacity-10"
            />
          </div>
          <div className="absolute top-10 right-0 pointer-events-none z-0">
            <img
              src={ghostDroopy}
              alt=""
              className="w-24 h-24 rotate-12 opacity-10"
            />
          </div>
        </>
      )}
      <div className="space-y-4 md:space-y-6 relative z-10">
        {/* Duration Settings */}
        <div className="space-y-3 md:space-y-6">
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            <div>
              <label
                className={`block text-xs md:text-sm mb-1.5 md:mb-2 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-[#B4B4B8]"
                      : "text-gray-700"
                }`}
              >
                Focus Duration
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={localSettings.work_duration}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      work_duration: parseInt(e.target.value) || 25,
                    })
                  }
                  className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg focus:outline-hidden text-sm md:text-lg ${
                    isHalloweenMode
                      ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                      : isDark
                        ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white focus:border-[#8B5CF6]"
                        : "bg-white border border-gray-300 text-gray-900 focus:border-[#8B5CF6]"
                  }`}
                />
                <span
                  className={`absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-xs md:text-sm ${
                    isHalloweenMode
                      ? "text-[#60c9b6]/50"
                      : isDark
                        ? "text-slate-500"
                        : "text-slate-400"
                  }`}
                >
                  min
                </span>
              </div>
            </div>
            <div>
              <label
                className={`block text-xs md:text-sm mb-1.5 md:mb-2 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-[#B4B4B8]"
                      : "text-gray-700"
                }`}
              >
                Short Break
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={localSettings.short_break_duration}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      short_break_duration: parseInt(e.target.value) || 5,
                    })
                  }
                  className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg focus:outline-hidden text-sm md:text-lg ${
                    isHalloweenMode
                      ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                      : isDark
                        ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white focus:border-[#10B981]"
                        : "bg-white border border-gray-300 text-gray-900 focus:border-[#10B981]"
                  }`}
                />
                <span
                  className={`absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-xs md:text-sm ${
                    isHalloweenMode
                      ? "text-[#60c9b6]/50"
                      : isDark
                        ? "text-slate-500"
                        : "text-slate-400"
                  }`}
                >
                  min
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 md:gap-6">
            <div className="flex-[0.6]">
              <label
                className={`block text-xs md:text-sm mb-1.5 md:mb-2 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-[#B4B4B8]"
                      : "text-gray-700"
                }`}
              >
                Sessions Until Long Break
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={localSettings.sessions_until_long_break}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      sessions_until_long_break: parseInt(e.target.value) || 4,
                    })
                  }
                  className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg focus:outline-hidden text-sm md:text-lg ${
                    isHalloweenMode
                      ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                      : isDark
                        ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white focus:border-[#F59E0B]"
                        : "bg-white border border-gray-300 text-gray-900 focus:border-[#F59E0B]"
                  }`}
                />
                <span
                  className={`absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-xs md:text-sm ${
                    isHalloweenMode
                      ? "text-[#60c9b6]/50"
                      : isDark
                        ? "text-slate-500"
                        : "text-slate-400"
                  }`}
                >
                  sessions
                </span>
              </div>
            </div>
            <div className="flex-[0.4]">
              <label
                className={`block text-xs md:text-sm mb-1.5 md:mb-2 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-[#B4B4B8]"
                      : "text-gray-700"
                }`}
              >
                Long Break
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={localSettings.long_break_duration}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      long_break_duration: parseInt(e.target.value) || 15,
                    })
                  }
                  className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg focus:outline-hidden text-sm md:text-lg ${
                    isHalloweenMode
                      ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)]"
                      : isDark
                        ? "bg-[rgba(40,40,45,0.6)] border border-[rgba(255,255,255,0.1)] text-white focus:border-[#3B82F6]"
                        : "bg-white border border-gray-300 text-gray-900 focus:border-[#3B82F6]"
                  }`}
                />
                <span
                  className={`absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-xs md:text-sm ${
                    isHalloweenMode
                      ? "text-[#60c9b6]/50"
                      : isDark
                        ? "text-slate-500"
                        : "text-slate-400"
                  }`}
                >
                  min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Automation Settings */}
        <div className="space-y-2 md:space-y-3">
          <Checkbox
            checked={localSettings.auto_start_breaks}
            onChange={(checked) =>
              setLocalSettings({
                ...localSettings,
                auto_start_breaks: checked,
              })
            }
            label="Auto-start breaks after work sessions"
            className="[&_label]:text-xs [&_label]:md:text-sm"
          />
          <Checkbox
            checked={localSettings.auto_start_work}
            onChange={(checked) =>
              setLocalSettings({
                ...localSettings,
                auto_start_work: checked,
              })
            }
            label="Auto-start work sessions after breaks"
            className="[&_label]:text-xs [&_label]:md:text-sm"
          />
          <Checkbox
            checked={localSettings.sound_enabled}
            onChange={(checked) =>
              setLocalSettings({
                ...localSettings,
                sound_enabled: checked,
              })
            }
            label="Enable sound notifications"
            className="[&_label]:text-xs [&_label]:md:text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div
          className={`flex items-center justify-end space-x-2 md:space-x-3 pt-4 md:pt-6 border-t ${
            isHalloweenMode
              ? "border-[#60c9b6]/20"
              : isDark
                ? "border-[rgba(255,255,255,0.1)]"
                : "border-gray-200"
          }`}
        >
          <button
            type="button"
            onClick={handleCancel}
            className={`px-4 md:px-6 py-2 rounded-lg transition-colors text-sm md:text-base cursor-pointer ${
              isHalloweenMode
                ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                : isDark
                  ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`px-4 md:px-6 py-2 rounded-lg transition-colors font-medium text-sm md:text-base cursor-pointer ${
              isHalloweenMode
                ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5] shadow-[0_0_10px_rgba(96,201,182,0.3)]"
                : "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
            }`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};
