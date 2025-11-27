import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { spiderHairyCrawling, treeSceneryCurly } from "@/assets";
import { ComboBox } from "@/components/ui/ComboBox";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { useTheme } from "@/contexts/ThemeContext";
import { useFolders } from "@/hooks/useFolders";
import { Account, LogUsageData } from "@/types/account";

interface LogUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onLogUsage: (data: LogUsageData) => Promise<void>;
}

export const LogUsageModal: React.FC<LogUsageModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onLogUsage,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { folders } = useFolders("account");
  const [formData, setFormData] = useState<LogUsageData>({
    account_id: "",
    amount: 1,
    description: "",
  });
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      if (!acc.is_active) return false;
      if (selectedFolder === "all") return true;
      return acc.folder_id === selectedFolder;
    });
  }, [accounts, selectedFolder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.account_id || formData.amount <= 0) {
      toast.error("Please select an account and enter a valid amount");
      return;
    }

    try {
      setIsLoading(true);
      await onLogUsage(formData);

      setFormData({
        account_id: "",
        amount: 1,
        description: "",
      });
      setSelectedFolder("all");

      toast.success(
        `Successfully logged ${formData.amount} usage for ${selectedAccount?.title}`,
      );
      onClose();
    } catch (error) {
      console.error("Failed to log usage:", error);
      toast.error("Failed to log usage. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAccount = accounts.find(
    (acc) => acc.id === formData.account_id,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Usage"
      size="lg"
      className={`relative overflow-hidden ${
        isHalloweenMode
          ? "bg-[rgba(96,201,182,0.15)]! border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]!"
          : ""
      }`}
    >
      {isHalloweenMode && (
        <>
          <div className="absolute -top-3 -left-5 pointer-events-none z-0">
            <img
              src={spiderHairyCrawling}
              alt="Spider"
              className="w-48 h-48 rotate-300 opacity-10"
            />
          </div>
          <div className="absolute -bottom-10 -right-1 pointer-events-none z-0">
            <img
              src={treeSceneryCurly}
              alt="Tree"
              className="w-48 h-48 opacity-10"
            />
          </div>
        </>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-3 md:space-y-4 relative z-10"
      >
        {/* Account Selection Row */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
          {/* Folder Filter */}
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
              Filter by Folder
            </label>
            <Dropdown
              value={selectedFolder}
              onValueChange={(value) => {
                setSelectedFolder(value);
                // Reset account selection if the selected account is not in the new folder
                if (
                  formData.account_id &&
                  value !== "all" &&
                  selectedAccount?.folder_id !== value
                ) {
                  setFormData((prev) => ({ ...prev, account_id: "" }));
                }
              }}
              options={[
                { value: "all", label: "All Folders" },
                ...folders.map((folder) => ({
                  value: folder.id,
                  label: folder.name,
                })),
              ]}
              placeholder="Filter by folder"
            />
          </div>

          {/* Account ComboBox */}
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
              Account
            </label>
            <ComboBox
              value={formData.account_id}
              onChange={(value) =>
                setFormData({ ...formData, account_id: value })
              }
              options={filteredAccounts.map((account) => ({
                value: account.id,
                label: `${account.title} (${account.platform})`,
              }))}
              placeholder={
                filteredAccounts.length > 0
                  ? "Search and select account..."
                  : "No accounts found in this folder"
              }
            />
          </div>
        </div>

        {/* Current Usage Overview */}
        {selectedAccount && (
          <div
            className={`p-4 rounded-xl border ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30"
                : isDark
                  ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]"
                  : "bg-gray-50 border-gray-200"
            }`}
          >
            {/* Progress Row */}
            <div className="flex items-center justify-between mb-4">
              <span
                className={`text-sm font-medium ${
                  isHalloweenMode
                    ? "text-[#60c9b6]/70"
                    : isDark
                      ? "text-gray-400"
                      : "text-gray-500"
                }`}
              >
                Progress:
              </span>
              <span
                className={`text-lg font-bold ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                {selectedAccount.current_usage} /{" "}
                {selectedAccount.usage_limit || "∞"}
              </span>
            </div>

            {/* Type Row */}
            <div className="flex items-center justify-between mb-6">
              <span
                className={`text-sm font-medium ${
                  isHalloweenMode
                    ? "text-[#60c9b6]/70"
                    : isDark
                      ? "text-gray-400"
                      : "text-gray-500"
                }`}
              >
                Type:
              </span>
              <span
                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/20 text-[#60c9b6] border border-[#60c9b6]/30"
                    : isDark
                      ? "bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30"
                      : "bg-purple-100 text-purple-700 border border-purple-200"
                }`}
              >
                {selectedAccount.usage_type.charAt(0).toUpperCase() +
                  selectedAccount.usage_type.slice(1).replace("_", " ")}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div
                className={`w-full h-3 rounded-full overflow-hidden ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/10"
                    : isDark
                      ? "bg-[rgba(255,255,255,0.1)]"
                      : "bg-gray-200"
                }`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHalloweenMode
                      ? "bg-[#60c9b6] shadow-[0_0_10px_rgba(96,201,182,0.4)]"
                      : "bg-[#8B5CF6] shadow-[0_0_10px_rgba(139,92,246,0.4)]"
                  }`}
                  style={{
                    width: `${Math.min(
                      (selectedAccount.current_usage /
                        (selectedAccount.usage_limit || 1)) *
                        100,
                      100,
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span
                  className={
                    isHalloweenMode
                      ? "text-[#60c9b6]/70"
                      : isDark
                        ? "text-gray-400"
                        : "text-gray-500"
                  }
                >
                  {selectedAccount.usage_limit
                    ? `${(
                        (selectedAccount.current_usage /
                          selectedAccount.usage_limit) *
                          100
                      ).toFixed(1)}% used`
                    : "0% used"}
                </span>
                <span
                  className={
                    isHalloweenMode
                      ? "text-[#60c9b6]/70"
                      : isDark
                        ? "text-gray-400"
                        : "text-gray-500"
                  }
                >
                  Limit: {selectedAccount.usage_limit || "None"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Amount */}
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
            Amount
          </label>
          <input
            type="number"
            min="1"
            value={formData.amount}
            onChange={(e) =>
              setFormData({
                ...formData,
                amount: parseInt(e.target.value) || 1,
              })
            }
            className={`w-full px-3 md:px-4 py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                : isDark
                  ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:ring-2 focus:ring-[#8B5CF6]"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6]"
            }`}
            placeholder="Enter amount"
            required
          />
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
          <input
            type="text"
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className={`w-full px-3 md:px-4 py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                : isDark
                  ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:ring-2 focus:ring-[#8B5CF6]"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6]"
            }`}
            placeholder="Add a note about this usage..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 md:pt-4">
          <button
            type="submit"
            disabled={isLoading || !formData.account_id || formData.amount <= 0}
            className={`w-full sm:flex-1 px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed ${
              isHalloweenMode
                ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                : "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
            }`}
          >
            {isLoading ? "Logging..." : "Log Usage"}
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
