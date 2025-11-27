import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { ghostScare, pumpkinScary } from "@/assets";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { useTheme } from "@/contexts/ThemeContext";
import { addTagToArray, removeTagFromArray } from "@/lib/tagUtils";
import { CreateAccountData, RESET_PERIODS, USAGE_TYPES } from "@/types/account";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAccount: (data: CreateAccountData) => Promise<void>;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  onCreateAccount,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [formData, setFormData] = useState<CreateAccountData>({
    title: "",
    platform: "",
    email_username: "",
    password: "",
    usage_type: "custom",
    usage_limit: undefined,
    reset_period: "monthly",
    description: "",
    tags: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTag, setCurrentTag] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title.trim() ||
      !formData.platform.trim() ||
      !formData.email_username.trim() ||
      !formData.password.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      await onCreateAccount(formData);

      setFormData({
        title: "",
        platform: "",
        email_username: "",
        password: "",
        usage_type: "custom",
        usage_limit: undefined,
        reset_period: "monthly",
        description: "",
        tags: [],
      });
      setCurrentTag("");
      toast.success(`Account "${formData.title}" created successfully`);
      onClose();
    } catch (error) {
      console.error("Failed to create account:", error);
      toast.error("Failed to create account. Please try again.");
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Account"
      size="lg"
      className={`relative overflow-hidden ${
        isHalloweenMode
          ? "bg-[rgba(96,201,182,0.15)]! border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]!"
          : ""
      }`}
    >
      {isHalloweenMode && (
        <>
          <div className="absolute top-1 right-1 pointer-events-none z-0">
            <img
              src={ghostScare}
              alt="Ghost"
              className="w-48 h-48 object-contain opacity-10 animate-float-slow"
            />
          </div>
          <div className="absolute bottom-1 left-1 pointer-events-none z-0">
            <img
              src={pumpkinScary}
              alt="Pumpkin"
              className="w-48 h-48 object-contain opacity-10 rotate-12"
            />
          </div>
        </>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 md:space-y-5 relative z-10"
      >
        {/* Title */}
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
            type="text"
            value={formData.title || ""}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="My Gmail Account"
            className={`w-full px-3 md:px-4 py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                : isDark
                  ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:ring-2 focus:ring-[#8B5CF6]"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6]"
            }`}
            autoFocus
          />
        </div>

        {/* Platform */}
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
          <input
            type="text"
            value={formData.platform || ""}
            onChange={(e) =>
              setFormData({ ...formData, platform: e.target.value })
            }
            placeholder="e.g., Google, Microsoft, GitHub, OpenAI"
            className={`w-full px-3 md:px-4 py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                : isDark
                  ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:ring-2 focus:ring-[#8B5CF6]"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6]"
            }`}
          />
        </div>

        {/* Email/Username */}
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
          <input
            type="text"
            value={formData.email_username || ""}
            onChange={(e) =>
              setFormData({ ...formData, email_username: e.target.value })
            }
            placeholder="user@example.com or username"
            className={`w-full px-3 md:px-4 py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                : isDark
                  ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:ring-2 focus:ring-[#8B5CF6]"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6]"
            }`}
          />
        </div>

        {/* Password */}
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
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password || ""}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Password"
              className={`w-full px-3 md:px-4 py-2 rounded-lg border text-sm md:text-base focus:outline-none pr-10 ${
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
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors p-1 rounded ${
                isHalloweenMode
                  ? "text-[#60c9b6] hover:text-[#60c9b6]/80"
                  : isDark
                    ? "text-[#71717A] hover:text-white"
                    : "text-gray-500 hover:text-gray-700"
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

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {/* Usage Type */}
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
                  usage_type: value as CreateAccountData["usage_type"],
                })
              }
              options={USAGE_TYPES.map((type) => ({
                value: type.value,
                label: type.label,
              }))}
              placeholder="Select usage type"
            />
          </div>

          {/* Usage Limit */}
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
              className={`w-full px-3 md:px-4 py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
                isHalloweenMode
                  ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:ring-2 focus:ring-[#8B5CF6]"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6]"
              }`}
            />
          </div>

          {/* Reset Period */}
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
                  reset_period: value as CreateAccountData["reset_period"],
                })
              }
              options={RESET_PERIODS.map((period) => ({
                value: period.value,
                label: period.label,
              }))}
              placeholder="Select reset period"
            />
          </div>
        </div>

        {/* Description */}
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
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Additional notes about this account..."
            className={`w-full px-3 md:px-4 py-2 rounded-lg border text-sm md:text-base focus:outline-none resize-none ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                : isDark
                  ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:ring-2 focus:ring-[#8B5CF6]"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6]"
            }`}
            rows={3}
          />
        </div>

        {/* Tags */}
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
              <input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Add a tag"
                className={`flex-1 px-3 md:px-4 py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
                  isHalloweenMode
                    ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                    : isDark
                      ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:ring-2 focus:ring-[#8B5CF6]"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6]"
                }`}
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!currentTag.trim()}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/10 text-[#60c9b6] border border-[#60c9b6]/30 hover:bg-[#60c9b6]/20"
                    : isDark
                      ? "bg-[rgba(139,92,246,0.1)] text-[#8B5CF6] border border-[rgba(139,92,246,0.3)] hover:bg-[rgba(139,92,246,0.2)]"
                      : "bg-purple-100 text-[#8B5CF6] border border-purple-200 hover:bg-purple-200"
                }`}
              >
                Add
              </button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center px-2 py-1 text-xs rounded font-medium ${
                      isHalloweenMode
                        ? "text-[#60c9b6] bg-[rgba(96,201,182,0.2)] border border-[rgba(96,201,182,0.3)]"
                        : isDark
                          ? "text-[#8B5CF6] bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)]"
                          : "text-[#8B5CF6] bg-purple-100 border border-purple-200"
                    }`}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className={`ml-1 transition-colors p-0.5 rounded ${
                        isHalloweenMode
                          ? "text-[#60c9b6] hover:text-[#60c9b6]/80"
                          : "text-[#8B5CF6] hover:text-[#7C3AED]"
                      }`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 md:pt-6">
          <button
            type="button"
            onClick={onClose}
            className={`w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium transition-colors cursor-pointer ${
              isHalloweenMode
                ? "bg-[#60c9b6]/10 text-[#60c9b6] hover:bg-[#60c9b6]/20"
                : isDark
                  ? "bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.15)]"
                  : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              isLoading ||
              !formData.title?.trim() ||
              !formData.platform?.trim() ||
              !formData.email_username?.trim() ||
              !formData.password?.trim()
            }
            className={`w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isHalloweenMode
                ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                : "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
            }`}
          >
            {isLoading ? "Creating..." : "Create Account"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
