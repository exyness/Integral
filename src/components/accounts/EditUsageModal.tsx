import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { catWitchHat, treeMonstergrin } from "@/assets";
import { Modal } from "@/components/ui/Modal";
import { useTheme } from "@/contexts/ThemeContext";
import { Account, AccountUsageLog } from "@/types/account";

interface EditUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AccountUsageLog | null;
  account: Account | undefined;
  onUpdateLog: (
    logId: string,
    amount: number,
    description?: string,
  ) => Promise<void>;
}

export const EditUsageModal: React.FC<EditUsageModalProps> = ({
  isOpen,
  onClose,
  log,
  account,
  onUpdateLog,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [amount, setAmount] = useState(1);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (log) {
      setAmount(log.amount);
      setDescription(log.description || "");
    }
  }, [log]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!log || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsLoading(true);
      await onUpdateLog(log.id, amount, description);
      toast.success("Usage log updated successfully");
      onClose();
    } catch (error) {
      console.error("Failed to update usage log:", error);
      toast.error("Failed to update usage log. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!log || !account) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Usage Log"
      size="md"
      className={`relative overflow-hidden ${
        isHalloweenMode
          ? "bg-[rgba(96,201,182,0.15)]! border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]!"
          : ""
      }`}
    >
      {isHalloweenMode && (
        <>
          <div className="absolute top-5 left-1 pointer-events-none z-0">
            <img
              src={catWitchHat}
              alt="Tree"
              className="w-24 h-24 object-contain opacity-10"
            />
          </div>
          <div className="absolute -bottom-2 right-1 pointer-events-none z-0">
            <img
              src={treeMonstergrin}
              alt="Cat"
              className="w-48 h-48 object-contain opacity-10"
            />
          </div>
        </>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-3 md:space-y-4 relative z-10"
      >
        {/* Account Info (Read-only) */}
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
          <div
            className={`w-full px-3 md:px-4 py-2 rounded-lg border text-sm md:text-base ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6]/70"
                : isDark
                  ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-gray-300"
                  : "bg-gray-50 border-gray-200 text-gray-600"
            }`}
          >
            {account.title} ({account.platform})
          </div>
        </div>

        {/* Detailed Usage Card */}
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
              {account.current_usage} / {account.usage_limit || "∞"}
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
              {account.usage_type.charAt(0).toUpperCase() +
                account.usage_type.slice(1).replace("_", " ")}
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
                    (account.current_usage / (account.usage_limit || 1)) * 100,
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
                {account.usage_limit
                  ? `${(
                      (account.current_usage / account.usage_limit) * 100
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
                Limit: {account.usage_limit || "None"}
              </span>
            </div>
          </div>
        </div>

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
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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

        {/* Timestamp Info */}
        <div
          className={`text-xs ${
            isHalloweenMode
              ? "text-[#60c9b6]/50"
              : isDark
                ? "text-[#71717A]"
                : "text-gray-500"
          }`}
        >
          Original timestamp:{" "}
          {new Date(log.timestamp).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 md:pt-4">
          <button
            type="submit"
            disabled={isLoading || amount <= 0}
            className={`w-full sm:flex-1 px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isHalloweenMode
                ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                : "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
            }`}
          >
            {isLoading ? "Updating..." : "Update Usage"}
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
