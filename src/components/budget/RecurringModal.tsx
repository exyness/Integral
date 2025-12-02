import {
  ArrowLeftRight,
  CalendarIcon,
  DollarSign,
  Repeat,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { batSwoop, spiderHairyCrawling } from "@/assets";
import { CategoryPicker } from "@/components/budget/CategoryPicker";
import { Calendar } from "@/components/ui/Calendar";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { useTheme } from "@/contexts/ThemeContext";
import {
  useAccountsQuery,
  useCategoriesQuery,
} from "@/hooks/queries/useBudgetsQuery";
import { useCurrency } from "@/hooks/useCurrency";
import {
  CategoryType,
  RecurringInterval,
  RecurringTransaction,
} from "@/types/budget";

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<
      RecurringTransaction,
      "id" | "user_id" | "created_at" | "updated_at" | "last_run_date"
    >,
  ) => Promise<void>;
  isLoading?: boolean;
  transaction?: RecurringTransaction | null;
}

export const RecurringModal: React.FC<RecurringModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  transaction,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { currency } = useCurrency();
  const { data: accounts = [] } = useAccountsQuery();
  const { data: categories = [] } = useCategoriesQuery();

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense" as "expense" | "income" | "transfer",
    category_id: "",
    account_id: "",
    to_account_id: "",
    interval: "monthly" as RecurringInterval,
    start_date: new Date().toISOString().split("T")[0],
    active: true,
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description,
        amount: transaction.amount.toString(),
        type: transaction.type,
        category_id: transaction.category_id || "",
        account_id: transaction.account_id || "",
        to_account_id: transaction.to_account_id || "",
        interval: transaction.interval,
        start_date: transaction.start_date,
        active: transaction.active,
      });
    } else {
      setFormData({
        description: "",
        amount: "",
        type: "expense",
        category_id: "",
        account_id: "",
        to_account_id: "",
        interval: "monthly",
        start_date: new Date().toISOString().split("T")[0],
        active: true,
      });
    }
  }, [transaction]);

  // Get placeholder text based on transaction type
  const getPlaceholder = () => {
    switch (formData.type) {
      case "income":
        return "e.g., Monthly Salary";
      case "transfer":
        return "e.g., Savings Transfer";
      case "expense":
      default:
        return "e.g., Netflix Subscription";
    }
  };

  // Get icon based on transaction type
  const getAmountIcon = () => {
    switch (formData.type) {
      case "income":
        return TrendingUp;
      case "transfer":
        return ArrowLeftRight;
      case "expense":
      default:
        return TrendingDown;
    }
  };

  const AmountIcon = getAmountIcon();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category_id: formData.category_id || undefined,
      account_id: formData.account_id || undefined,
      to_account_id: formData.to_account_id || undefined,
      interval: formData.interval,
      start_date: formData.start_date,
      next_run_date: formData.start_date, // Initial next run is start date
      active: formData.active,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? "Edit Recurring Rule" : "Add Recurring Rule"}
      size="md"
      className={`relative overflow-hidden ${
        isHalloweenMode
          ? "bg-[rgba(96,201,182,0.15)]! border-[rgba(96,201,182,0.3)]! shadow-[0_0_10px_rgba(96,201,182,0.2)]!"
          : ""
      }`}
    >
      {isHalloweenMode && (
        <>
          <div className="absolute -bottom-10 -right-10 pointer-events-none z-0">
            <img
              src={batSwoop}
              alt=""
              className="w-48 h-48 -rotate-12 opacity-10"
            />
          </div>
          <div className="absolute -top-10 -left-10 pointer-events-none z-0">
            <img
              src={spiderHairyCrawling}
              alt=""
              className="w-48 h-48 rotate-320 opacity-10"
            />
          </div>
        </>
      )}
      <form
        onSubmit={handleSubmit}
        className="space-y-3 md:space-y-4 relative z-10"
      >
        {/* Type Selection */}
        <div
          className="flex p-1 rounded-lg bg-gray-100 dark:bg-white/5"
          role="group"
          aria-label="Transaction type"
        >
          {(["expense", "income", "transfer"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFormData({ ...formData, type: t })}
              aria-pressed={formData.type === t}
              className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-all ${
                formData.type === t
                  ? isHalloweenMode
                    ? "bg-[#60c9b6] text-black shadow-sm"
                    : "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
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
          <div className="relative">
            <input
              id="description"
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
                isHalloweenMode
                  ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:ring-2 focus:ring-[#60c9b6]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:ring-2 focus:ring-[#8B5CF6]"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6]"
              }`}
              placeholder={getPlaceholder()}
              required
            />
            <Repeat
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-[#B4B4B8]"
                    : "text-gray-500"
              }`}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Amount */}
        <div>
          <label
            htmlFor="amount"
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
          <div className="relative">
            <div
              className={`absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-[#B4B4B8]"
                    : "text-gray-500"
              }`}
            >
              <span className="text-sm font-semibold">{currency.symbol}</span>
              <AmountIcon className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className={`w-full pl-14 pr-4 py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
                isHalloweenMode
                  ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:ring-2 focus:ring-[#60c9b6]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:ring-2 focus:ring-[#8B5CF6]"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6]"
              }`}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Accounts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dropdown
            title={formData.type === "transfer" ? "From Account" : "Account"}
            value={formData.account_id}
            onValueChange={(value) =>
              setFormData({ ...formData, account_id: value })
            }
            options={accounts.map((acc) => ({
              value: acc.id,
              label: acc.name,
            }))}
            placeholder="Select account"
          />

          {formData.type === "transfer" && (
            <Dropdown
              title="To Account"
              value={formData.to_account_id}
              onValueChange={(value) =>
                setFormData({ ...formData, to_account_id: value })
              }
              options={accounts
                .filter((acc) => acc.id !== formData.account_id)
                .map((acc) => ({
                  value: acc.id,
                  label: acc.name,
                }))}
              placeholder="Select destination"
            />
          )}
        </div>

        {/* Category & Interval */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.type !== "transfer" && (
            <CategoryPicker
              label="Category"
              type={formData.type as CategoryType}
              value={formData.category_id}
              onChange={(categoryId) =>
                setFormData({ ...formData, category_id: categoryId })
              }
              placeholder="Select category"
            />
          )}

          <Dropdown
            title="Interval"
            value={formData.interval}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                interval: value as RecurringInterval,
              })
            }
            options={[
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ]}
            placeholder="Select interval"
          />
        </div>

        {/* Start Date */}
        <Calendar
          label="Start Date"
          value={formData.start_date}
          onChange={(date) => setFormData({ ...formData, start_date: date })}
          placeholder="Select start date"
        />

        <div style={{ display: "none" }}>
          <label
            htmlFor="start-date"
            className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-white"
                  : "text-gray-700"
            }`}
          >
            Start Date
          </label>
          <div className="relative">
            <input
              id="start-date"
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
                isHalloweenMode
                  ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] focus:border-[#60c9b6] focus:ring-2 focus:ring-[#60c9b6]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white focus:ring-2 focus:ring-[#8B5CF6]"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#8B5CF6]"
              }`}
              required
            />
            <CalendarIcon
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-[#B4B4B8]"
                    : "text-gray-500"
              }`}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isHalloweenMode
                ? "bg-[#60c9b6] hover:bg-[#4db8a5] text-black shadow-[0_0_15px_rgba(96,201,182,0.3)]"
                : "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-lg shadow-purple-500/30"
            } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading ? (
              <>
                <div
                  className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
                <span className="sr-only">Saving...</span>
              </>
            ) : (
              <>{transaction ? "Update Rule" : "Create Rule"}</>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
