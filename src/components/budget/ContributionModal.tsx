import { useState } from "react";
import { toast } from "sonner";
import { batGlide, treeSceneryCurly } from "@/assets";
import { CategoryPicker } from "@/components/budget/CategoryPicker";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { useTheme } from "@/contexts/ThemeContext";
import { useCreateContribution } from "@/hooks/queries/useContributions";
import { useAccounts } from "@/hooks/useAccounts";
import { useCurrency } from "@/hooks/useCurrency";
import { FinancialGoal } from "@/types/budget";

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: FinancialGoal;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { currency } = useCurrency();
  const { accounts } = useAccounts();
  const { mutateAsync: createContribution, isPending } =
    useCreateContribution();

  const [formData, setFormData] = useState({
    amount: "",
    category_id: "",
    source_account_id: "",
    contributed_at: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await createContribution({
        goal_id: goal.id,
        amount,
        category_id: formData.category_id || null,
        source_account_id: formData.source_account_id || null,
        contributed_at: new Date(formData.contributed_at).toISOString(),
        notes: formData.notes || null,
      });

      // Reset form
      setFormData({
        amount: "",
        category_id: "",
        source_account_id: "",
        contributed_at: new Date().toISOString().split("T")[0],
        notes: "",
      });
      onClose();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Contribution"
      size="lg"
      hideDecorations
    >
      {isHalloweenMode && (
        <>
          <div className="absolute bottom-0 right-0 pointer-events-none z-0">
            <img
              src={treeSceneryCurly}
              alt=""
              className="w-32 h-32 md:w-48 md:h-48 opacity-20"
            />
          </div>
          <div className="absolute -top-4 right-0 pointer-events-none z-0">
            <img
              src={batGlide}
              alt=""
              className="w-24 h-24 md:w-32 md:h-32 opacity-20"
            />
          </div>
        </>
      )}
      <form
        onSubmit={handleSubmit}
        className="space-y-3 md:space-y-4 relative z-10"
      >
        {/* Goal Info (Read-only) */}
        <div
          className={`p-3 rounded-lg border ${
            isHalloweenMode
              ? "bg-[#60c9b6]/10 border-[#60c9b6]/30"
              : isDark
                ? "bg-gray-800/50 border-gray-700"
                : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Contributing to
          </div>
          <div
            className={`font-medium ${isHalloweenMode ? "text-[#60c9b6]" : isDark ? "text-white" : "text-gray-900"}`}
          >
            {goal.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Current: {currency.symbol}
            {goal.current_amount.toLocaleString()} / Target: {currency.symbol}
            {goal.target_amount.toLocaleString()}
          </div>
        </div>

        {/* Amount and Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
              Amount<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isHalloweenMode ? "text-[#60c9b6]/70" : "text-gray-500"
                }`}
              >
                {currency.symbol}
              </span>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className={`w-full pl-8 pr-3 py-2 md:pl-10 md:pr-4 md:py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
                  isHalloweenMode
                    ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:ring-2 focus:ring-[#60c9b6]"
                    : isDark
                      ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white focus:ring-2 focus:ring-[#8B5CF6]"
                      : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#8B5CF6]"
                }`}
                placeholder="0.00"
                required
                autoFocus
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
              Date
            </label>
            <input
              type="date"
              value={formData.contributed_at}
              onChange={(e) =>
                setFormData({ ...formData, contributed_at: e.target.value })
              }
              className={`w-full px-3 py-2 md:px-4 md:py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
                isHalloweenMode
                  ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:ring-2 focus:ring-[#60c9b6] scheme-dark"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white focus:ring-2 focus:ring-[#8B5CF6] scheme-dark"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#8B5CF6]"
              }`}
              required
            />
          </div>
        </div>

        {/* Category and Account */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <CategoryPicker
              label="Source Category (Optional)"
              type="income" // Usually contributions come from income, but could be generic
              value={formData.category_id}
              onChange={(categoryId) =>
                setFormData({ ...formData, category_id: categoryId })
              }
              placeholder="Select source category"
            />
          </div>

          <div>
            <Dropdown
              title="Source Account (Optional)"
              value={formData.source_account_id}
              onValueChange={(value) =>
                setFormData({ ...formData, source_account_id: value })
              }
              options={accounts.map((acc) => ({
                value: acc.id,
                label: (acc as any).name || acc.title,
              }))}
              placeholder="Select account"
            />
          </div>
        </div>

        {/* Notes */}
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
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className={`w-full px-3 py-2 md:px-4 md:py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:ring-2 focus:ring-[#60c9b6]"
                : isDark
                  ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white focus:ring-2 focus:ring-[#8B5CF6]"
                  : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#8B5CF6]"
            }`}
            rows={2}
            placeholder="Add any notes about this contribution"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 md:gap-3 pt-2 md:pt-4">
          <button
            type="submit"
            disabled={isPending || !formData.amount}
            className={`flex-1 px-3 py-1.5 md:px-6 md:py-3 rounded-lg text-xs md:text-base font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isHalloweenMode
                ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                : "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
            }`}
          >
            {isPending ? "Adding..." : "Add Contribution"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className={`flex-1 px-3 py-1.5 md:px-6 md:py-3 rounded-lg text-xs md:text-base font-medium transition-colors cursor-pointer ${
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
