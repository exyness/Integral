import React, { useEffect, useState } from "react";
import { batSwoop, spiderHairyCrawling } from "@/assets";
import { Calendar as CalendarPicker } from "@/components/ui/Calendar";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { useTheme } from "@/contexts/ThemeContext";
import { Budget, BudgetTransaction } from "@/types/budget";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetId?: string;
  budgets?: Budget[];
  transaction?: BudgetTransaction | null;
  onSubmit: (
    data: Omit<BudgetTransaction, "id" | "user_id" | "created_at">,
  ) => Promise<void>;
  isLoading?: boolean;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  budgetId,
  budgets = [],
  transaction,
  onSubmit,
  isLoading = false,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [formData, setFormData] = useState({
    budget_id: budgetId || "",
    amount: 0,
    description: "",
    category: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        budget_id: transaction.budget_id || "",
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        transaction_date: transaction.transaction_date,
      });
    } else if (budgetId) {
      setFormData((prev) => ({ ...prev, budget_id: budgetId }));
    }
  }, [transaction, budgetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0 || !formData.description.trim()) return;

    try {
      await onSubmit({
        budget_id: formData.budget_id || null,
        amount: formData.amount,
        description: formData.description,
        category: formData.category,
        transaction_date: formData.transaction_date,
      });

      setFormData({
        budget_id: budgetId || "",
        amount: 0,
        description: "",
        category: "",
        transaction_date: new Date().toISOString().split("T")[0],
      });
      onClose();
    } catch (error) {
      // Error handled by parent (Don't Remove)
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? "Edit Transaction" : "Add Transaction"}
      size="md"
      className={`relative overflow-hidden ${
        isHalloweenMode
          ? "bg-[rgba(96,201,182,0.15)]! border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]!"
          : ""
      }`}
    >
      {isHalloweenMode && (
        <>
          <div className="absolute -bottom-10 -left-10 pointer-events-none z-0">
            <img
              src={batSwoop}
              alt=""
              className="w-48 h-48 -rotate-12 opacity-10"
            />
          </div>
          <div className="absolute -top-10 -right-10 pointer-events-none z-0">
            <img
              src={spiderHairyCrawling}
              alt=""
              className="w-48 h-48 rotate-12 opacity-10"
            />
          </div>
        </>
      )}
      <form
        onSubmit={handleSubmit}
        className="space-y-3 md:space-y-4 relative z-10"
      >
        {/* Budget Selection - Always show when not tied to specific budget */}
        {!budgetId && (
          <Dropdown
            title="Assign to"
            value={formData.budget_id || "quick"}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                budget_id: value === "quick" ? null : value,
              })
            }
            options={[
              { value: "quick", label: "Quick Expense (No Budget)" },
              ...budgets.map((budget) => ({
                value: budget.id,
                label: budget.name,
              })),
            ]}
            placeholder="Select budget or quick expense"
          />
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
            step="0.01"
            min="0"
            value={formData.amount || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                amount: parseFloat(e.target.value) || 0,
              })
            }
            className={`w-full px-3 md:px-4 py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                : isDark
                  ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:ring-2 focus:ring-[#8B5CF6]"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6]"
            }`}
            placeholder="0.00"
            required
            autoFocus
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
            Description
          </label>
          <input
            type="text"
            value={formData.description}
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
            placeholder="Enter transaction description"
            required
          />
        </div>

        {/* Category */}
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
            Category
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className={`w-full px-3 md:px-4 py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                : isDark
                  ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:ring-2 focus:ring-[#8B5CF6]"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6]"
            }`}
            placeholder="e.g., groceries, gas, utilities"
            required
          />
        </div>

        {/* Date */}
        <CalendarPicker
          label="Date"
          value={formData.transaction_date}
          onChange={(date) =>
            setFormData({ ...formData, transaction_date: date })
          }
          placeholder="Select transaction date"
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 md:pt-4">
          <button
            type="submit"
            disabled={
              isLoading ||
              formData.amount <= 0 ||
              !formData.description.trim() ||
              !formData.category.trim()
            }
            className={`w-full sm:flex-1 px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isHalloweenMode
                ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                : "bg-[#10B981] text-white hover:bg-[#059669]"
            }`}
          >
            {isLoading
              ? transaction
                ? "Updating..."
                : "Adding..."
              : transaction
                ? "Update Transaction"
                : "Add Transaction"}
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
