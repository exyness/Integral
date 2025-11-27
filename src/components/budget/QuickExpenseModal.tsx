import React, { useState } from "react";
import { ghostScare, pumpkinScary } from "@/assets";
import { Calendar } from "@/components/ui/Calendar.tsx";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { useTheme } from "@/contexts/ThemeContext";
import { BudgetCategory } from "@/types/budget";

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    description: string;
    category: string;
    transaction_date: string;
    budget_id: null;
  }) => Promise<void>;
  isLoading?: boolean;
}

const CATEGORIES: { value: BudgetCategory; label: string }[] = [
  { value: "food", label: "Food" },
  { value: "transport", label: "Transport" },
  { value: "entertainment", label: "Entertainment" },
  { value: "utilities", label: "Utilities" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "shopping", label: "Shopping" },
  { value: "savings", label: "Savings" },
  { value: "other", label: "Other" },
];

export const QuickExpenseModal: React.FC<QuickExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<BudgetCategory>("other");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    await onSubmit({
      amount: numAmount,
      description: description || "Quick expense",
      category,
      transaction_date: date,
      budget_id: null,
    });

    setAmount("");
    setDescription("");
    setCategory("other");
    setDate(new Date().toISOString().split("T")[0]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Expense"
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
              src={ghostScare}
              alt=""
              className="w-48 h-48 -rotate-12 opacity-10"
            />
          </div>
          <div className="absolute -top-10 -right-10 pointer-events-none z-0">
            <img
              src={pumpkinScary}
              alt=""
              className="w-48 h-48 rotate-12 opacity-10"
            />
          </div>
        </>
      )}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 md:space-y-6 relative z-10"
      >
        {/* Amount Input */}
        <div>
          <label
            className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            Amount <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            className={`w-full px-3 py-2 md:px-4 md:py-3 rounded-lg border text-base md:text-lg font-semibold ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                : isDark
                  ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:ring-2 focus:ring-[#8B5CF6]"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6]"
            } focus:outline-none`}
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
                  : "text-gray-900"
            }`}
          >
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you spend on?"
            className={`w-full px-3 py-2 md:px-4 md:py-2 rounded-lg border text-sm md:text-base ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                : isDark
                  ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8]"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
            } focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]`}
          />
        </div>

        {/* Category Selection */}
        <div>
          <label
            className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            Category <span className="text-red-500">*</span>
          </label>
          <Dropdown
            placeholder="Select Category"
            value={category}
            onValueChange={(value) => setCategory(value as BudgetCategory)}
            options={CATEGORIES.map((cat) => ({
              value: cat.value,
              label: cat.label,
            }))}
          />
        </div>

        {/* Date */}
        <div>
          <label
            className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            Date <span className="text-red-500">*</span>
          </label>
          <Calendar
            value={date}
            onChange={setDate}
            placeholder="Select transaction date"
          />
        </div>

        {/* Submit Button */}
        <div className="flex space-x-2 md:space-x-3 pt-2 md:pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`flex-1 px-3 py-2 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-medium transition-colors cursor-pointer ${
              isHalloweenMode
                ? "bg-[#60c9b6]/10 text-[#60c9b6] hover:bg-[#60c9b6]/20"
                : isDark
                  ? "bg-[rgba(255,255,255,0.05)] text-white hover:bg-[rgba(255,255,255,0.1)]"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className={`flex-1 px-3 py-2 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
              isHalloweenMode
                ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                : "bg-[#10B981] text-white hover:bg-[#059669]"
            }`}
          >
            <span>{isLoading ? "Recording..." : "Record Expense"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
