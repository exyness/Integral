import { Eye, EyeOff, Globe, Plus, Shield, Tag, User, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { batSwoop, spiderSharpHanging } from "@/assets";
import { Button } from "@/components/ui/Button.tsx";
import { Checkbox } from "@/components/ui/Checkbox";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { useTheme } from "@/contexts/ThemeContext";
import { addTagToArray, removeTagFromArray } from "@/lib/tagUtils";
import {
  Account,
  PREDEFINED_PLATFORMS,
  RESET_PERIODS,
  UpdateAccountData,
  USAGE_TYPES,
} from "@/types/account";

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onUpdateAccount: (
    accountId: string,
    data: UpdateAccountData,
  ) => Promise<void>;
}

export const EditAccountModal: React.FC<EditAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onUpdateAccount,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [formData, setFormData] = useState<UpdateAccountData>({
    title: "",
    platform: "",
    email_username: "",
    password: "",
    usage_type: "custom",
    usage_limit: undefined,
    reset_period: "monthly",
    description: "",
    tags: [],
    is_active: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [customPlatform, setCustomPlatform] = useState("");
  const [isCustomPlatform, setIsCustomPlatform] = useState(false);
  const [currentTag, setCurrentTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (account && isOpen) {
      const isCustom = !(PREDEFINED_PLATFORMS as readonly string[]).includes(
        account.platform,
      );
      setIsCustomPlatform(isCustom);
      setCustomPlatform(isCustom ? account.platform : "");

      setFormData({
        title: account.title,
        platform: isCustom ? "" : account.platform,
        email_username: account.email_username,
        password: account.password,
        usage_type: account.usage_type,
        usage_limit: account.usage_limit,
        reset_period: account.reset_period,
        description: account.description || "",
        tags: [...account.tags],
        is_active: account.is_active,
      });
    }
  }, [account, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !account ||
      !formData.title?.trim() ||
      !formData.email_username?.trim() ||
      !formData.password?.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const finalPlatform = isCustomPlatform ? customPlatform : formData.platform;
    if (!finalPlatform?.trim()) {
      toast.error("Please select or enter a platform");
      return;
    }

    try {
      setIsLoading(true);
      await onUpdateAccount(account.id, {
        ...formData,
        platform: finalPlatform,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update account:", error);
      toast.error("Failed to update account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    addTagToArray(
      currentTag,
      formData.tags,
      (tags) => setFormData({ ...formData, tags }),
      () => setCurrentTag(""),
    );
  };

  const removeTag = (tagToRemove: string) => {
    removeTagFromArray(tagToRemove, formData.tags, (tags) =>
      setFormData({ ...formData, tags }),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  if (!account) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Account"
      size="lg"
      className={`relative overflow-hidden ${
        isHalloweenMode
          ? "bg-[rgba(96,201,182,0.15)]! border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]!"
          : ""
      }`}
    >
      {isHalloweenMode && (
        <>
          <div className="absolute top-2 left-2 pointer-events-none z-0">
            <img
              src={spiderSharpHanging}
              alt="Spider"
              className="w-20 h-20 object-contain opacity-10 animate-bounce-slow"
            />
          </div>
          <div className="absolute bottom-2 right-2 pointer-events-none z-0">
            <img
              src={batSwoop}
              alt="Bat"
              className="w-24 h-24 object-contain opacity-10 animate-float-slow"
            />
          </div>
        </>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 md:space-y-6 relative z-10"
      >
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label
              className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-700"
              }`}
            >
              Account Title <span className="text-red-500">*</span>
            </label>
            <input
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Gmail Work"
              className={`w-full px-3 md:px-4 py-2 rounded-lg border text-sm md:text-base focus:outline-none transition-all duration-200 ${
                isHalloweenMode
                  ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:ring-2 focus:ring-[#8B5CF6]"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6]"
              }`}
              autoFocus
            />
          </div>

          <div>
            <label
              className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-700"
              }`}
            >
              Platform <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <div
                className={`flex items-center space-x-6 p-3 rounded-lg border ${
                  isHalloweenMode
                    ? "bg-[#1a1a1f] border-[#60c9b6]/30"
                    : isDark
                      ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]"
                      : "bg-gray-50 border-gray-200"
                }`}
              >
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!isCustomPlatform}
                    onChange={() => setIsCustomPlatform(false)}
                    className={`w-4 h-4 border-gray-300 focus:ring-2 ${
                      isHalloweenMode
                        ? "text-[#60c9b6] focus:ring-[#60c9b6] accent-[#60c9b6]"
                        : "text-[#8B5CF6] focus:ring-[#8B5CF6]"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isHalloweenMode
                        ? "text-[#60c9b6]"
                        : isDark
                          ? "text-[#B4B4B8]"
                          : "text-gray-700"
                    }`}
                  >
                    Select from list
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={isCustomPlatform}
                    onChange={() => setIsCustomPlatform(true)}
                    className={`w-4 h-4 border-gray-300 focus:ring-2 ${
                      isHalloweenMode
                        ? "text-[#60c9b6] focus:ring-[#60c9b6] accent-[#60c9b6]"
                        : "text-[#8B5CF6] focus:ring-[#8B5CF6]"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isHalloweenMode
                        ? "text-[#60c9b6]"
                        : isDark
                          ? "text-[#B4B4B8]"
                          : "text-gray-700"
                    }`}
                  >
                    Custom platform
                  </span>
                </label>
              </div>

              {isCustomPlatform ? (
                <div className="relative">
                  <Globe
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                      isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]"
                    }`}
                  />
                  <input
                    value={customPlatform}
                    onChange={(e) => setCustomPlatform(e.target.value)}
                    placeholder="Enter custom platform name"
                    className={`w-full pl-10 pr-3 md:pr-4 py-2 rounded-lg border text-sm md:text-base focus:outline-none transition-all duration-200 ${
                      isHalloweenMode
                        ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                        : isDark
                          ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:ring-2 focus:ring-[#8B5CF6]"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6]"
                    }`}
                  />
                </div>
              ) : (
                <Dropdown
                  value={formData.platform || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, platform: value })
                  }
                  options={PREDEFINED_PLATFORMS.map((platform) => ({
                    value: platform,
                    label: platform,
                  }))}
                  placeholder="Select a platform"
                />
              )}
            </div>
          </div>
        </div>

        {/* Credentials */}
        <div className="space-y-4">
          <div>
            <label
              className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-700"
              }`}
            >
              Email/Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]"
                }`}
              />
              <input
                type="text"
                value={formData.email_username || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email_username: e.target.value,
                  })
                }
                placeholder="user@example.com or username"
                className={`w-full pl-10 pr-3 md:pr-4 py-2 rounded-lg border text-sm md:text-base focus:outline-none transition-all duration-200 ${
                  isHalloweenMode
                    ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                    : isDark
                      ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:ring-2 focus:ring-[#8B5CF6]"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6]"
                }`}
              />
            </div>
          </div>

          <div>
            <label
              className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-700"
              }`}
            >
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Shield
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]"
                }`}
              />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password || ""}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Password"
                className={`w-full pl-10 pr-12 py-2 rounded-lg border text-sm md:text-base focus:outline-none transition-all duration-200 ${
                  isHalloweenMode
                    ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                    : isDark
                      ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:ring-2 focus:ring-[#8B5CF6]"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 p-1 rounded h-8 ${
                  isHalloweenMode
                    ? "text-[#60c9b6] hover:text-[#60c9b6]/80"
                    : isDark
                      ? "text-[#71717A] hover:text-[#8B5CF6]"
                      : "text-gray-500 hover:text-[#8B5CF6]"
                }`}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Usage Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-700"
              }`}
            >
              Usage Type
            </label>
            <Dropdown
              value={formData.usage_type || "custom"}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  usage_type: value as UpdateAccountData["usage_type"],
                })
              }
              options={USAGE_TYPES.map((type) => ({
                value: type.value,
                label: type.label,
              }))}
            />
          </div>

          <div>
            <label
              className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-700"
              }`}
            >
              Usage Limit (Optional)
            </label>
            <input
              type="number"
              value={formData.usage_limit || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  usage_limit: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              placeholder="1000"
              className={`w-full px-3 md:px-4 py-2 rounded-lg border text-sm md:text-base focus:outline-none transition-all duration-200 ${
                isHalloweenMode
                  ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:ring-2 focus:ring-[#8B5CF6]"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6]"
              }`}
            />
          </div>
        </div>

        <div>
          <label
            className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-white"
                  : "text-gray-700"
            }`}
          >
            Reset Period
          </label>
          <Dropdown
            value={formData.reset_period || "monthly"}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                reset_period: value as UpdateAccountData["reset_period"],
              })
            }
            options={RESET_PERIODS.map((period) => ({
              value: period.value,
              label: period.label,
            }))}
          />
          <p
            className={`text-xs mt-1 ${
              isHalloweenMode
                ? "text-[#60c9b6]/60"
                : isDark
                  ? "text-[#71717A]"
                  : "text-gray-500"
            }`}
          >
            Usage will automatically reset based on this period
          </p>
        </div>

        {/* Manual Reset */}
        {account.current_usage > 0 && (
          <div
            className={`p-4 rounded-lg border ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30"
                : isDark
                  ? "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)]"
                  : "bg-amber-50 border-amber-200"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h6
                  className={`text-sm font-medium mb-1 ${
                    isHalloweenMode
                      ? "text-[#60c9b6]"
                      : isDark
                        ? "text-[#F59E0B]"
                        : "text-amber-700"
                  }`}
                >
                  Manual Usage Reset
                </h6>
                <p
                  className={`text-xs ${
                    isHalloweenMode
                      ? "text-[#60c9b6]/80"
                      : isDark
                        ? "text-[#B4B4B8]"
                        : "text-gray-600"
                  }`}
                >
                  Current usage:{" "}
                  <span className="font-semibold">{account.current_usage}</span>
                  {account.usage_limit && ` / ${account.usage_limit}`}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    isHalloweenMode
                      ? "text-[#60c9b6]/60"
                      : isDark
                        ? "text-[#71717A]"
                        : "text-gray-500"
                  }`}
                >
                  Reset the usage counter to 0 manually
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (
                    window.confirm(
                      "Are you sure you want to reset the usage counter to 0?",
                    )
                  ) {
                    try {
                      await onUpdateAccount(account.id, {
                        current_usage: 0,
                      });
                      toast.success("Usage counter reset successfully");
                    } catch (error) {
                      toast.error("Failed to reset usage counter");
                    }
                  }
                }}
                className={`text-xs px-3 py-1.5 ${
                  isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.2)] border-[rgba(96,201,182,0.3)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)]"
                    : isDark
                      ? "bg-[rgba(245,158,11,0.2)] border-[rgba(245,158,11,0.3)] text-[#F59E0B] hover:bg-[rgba(245,158,11,0.3)]"
                      : "bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-200"
                }`}
              >
                Reset Now
              </Button>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div>
          <label
            className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-white"
                  : "text-gray-700"
            }`}
          >
            Description (Optional)
          </label>
          <textarea
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value,
              })
            }
            placeholder="Additional notes about this account..."
            className={`w-full p-4 rounded-lg focus:outline-none resize-none transition-all duration-200 border ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                : isDark
                  ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#71717A] focus:ring-2 focus:ring-[#8B5CF6]"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#8B5CF6]"
            }`}
            rows={3}
          />
        </div>

        <div>
          <label
            className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-white"
                  : "text-gray-700"
            }`}
          >
            Tags (Optional)
          </label>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Tag
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isHalloweenMode ? "text-[#60c9b6]" : "text-[#8B5CF6]"
                  }`}
                />
                <input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add a tag"
                  className={`w-full pl-10 pr-3 md:pr-4 py-2 rounded-lg border text-sm md:text-base focus:outline-none transition-all duration-200 ${
                    isHalloweenMode
                      ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                      : isDark
                        ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:ring-2 focus:ring-[#8B5CF6]"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6]"
                  }`}
                />
              </div>
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                size="sm"
                disabled={!currentTag.trim()}
                className={`px-3 py-1.5 transition-all duration-200 text-sm ${
                  isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.1)] border-[rgba(96,201,182,0.3)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.2)]"
                    : "bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.3)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.2)]"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                      isHalloweenMode
                        ? "bg-[rgba(96,201,182,0.2)] border border-[rgba(96,201,182,0.3)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)]"
                        : "bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.3)]"
                    }`}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className={`ml-2 transition-colors duration-200 p-0.5 rounded ${
                        isHalloweenMode
                          ? "text-[#60c9b6] hover:text-[#60c9b6]/80 hover:bg-[rgba(96,201,182,0.2)]"
                          : "text-[#8B5CF6] hover:text-[#7C3AED] hover:bg-[rgba(139,92,246,0.2)]"
                      }`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label
            className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-white"
                  : "text-gray-700"
            }`}
          >
            Status
          </label>
          <div
            className={`p-3 rounded-lg border ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30"
                : isDark
                  ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]"
                  : "bg-gray-50 border-gray-200"
            }`}
          >
            <Checkbox
              id="is_active"
              checked={formData.is_active || false}
              onChange={(checked) =>
                setFormData({
                  ...formData,
                  is_active: checked,
                })
              }
              label="Account is active"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 md:pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full sm:flex-1 px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isHalloweenMode
                ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                : "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
            }`}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`w-full sm:flex-1 px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium transition-colors cursor-pointer ${
              isHalloweenMode
                ? "bg-[#60c9b6]/10 text-[#60c9b6] hover:bg-[#60c9b6]/20"
                : isDark
                  ? "bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.15)]"
                  : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            }`}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};
