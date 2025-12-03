import { useEffect, useState } from "react";
import { toast } from "sonner";
import { catWitchHat, webCornerLeft } from "@/assets";
import { CategoryPicker } from "@/components/budget/CategoryPicker";
import { Calendar } from "@/components/ui/Calendar.tsx";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { useTheme } from "@/contexts/ThemeContext";
import { useCategoriesQuery } from "@/hooks/queries/useCategories";
import { Budget, BudgetPeriod } from "@/types/budget";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget?: Budget;
  onSubmit: (
    data: Omit<
      Budget,
      "id" | "user_id" | "created_at" | "updated_at" | "spent"
    >,
  ) => Promise<void>;
  isLoading?: boolean;
}

const PERIODS: BudgetPeriod[] = ["weekly", "monthly", "quarterly", "yearly"];

const COLORS = [
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
];

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  budget,
  onSubmit,
  isLoading = false,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: 0,
    category: "other",
    period: "monthly" as BudgetPeriod,
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    color: COLORS[0],
    icon: "",
  });

  const { data: categories } = useCategoriesQuery();

  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name,
        description: budget.description || "",
        amount: budget.amount,
        category: budget.category,
        period: budget.period,
        start_date: budget.start_date,
        end_date: budget.end_date,
        color: budget.color,
        icon: budget.icon || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        amount: 0,
        category: "other",
        period: "monthly",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        color: COLORS[0],
        icon: "",
      });
    }
  }, [budget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a budget name");
      return;
    }

    if (formData.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      toast.error("Please select a valid date range");
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error handled by parent (Don't Remove)
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budget ? "Edit Budget" : "Create Budget"}
      size="lg"
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
              src={catWitchHat}
              alt=""
              className="w-48 h-48 -rotate-12 opacity-10"
            />
          </div>
          <div className="absolute -top-10 -right-10 pointer-events-none z-0">
            <img
              src={webCornerLeft}
              alt=""
              className="w-48 h-48 rotate-180 opacity-10"
            />
          </div>
        </>
      )}
      <form
        onSubmit={handleSubmit}
        className="space-y-3 md:space-y-4 relative z-10"
      >
        {/* Budget Name */}
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
            Budget Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-2 md:px-4 md:py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                : isDark
                  ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white focus:ring-2 focus:ring-[#8B5CF6]"
                  : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#8B5CF6]"
            }`}
            placeholder="Enter budget name"
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
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className={`w-full px-3 py-2 md:px-4 md:py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                : isDark
                  ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white focus:ring-2 focus:ring-[#8B5CF6]"
                  : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#8B5CF6]"
            }`}
            rows={2}
            placeholder="Enter budget description"
          />
        </div>

        {/* Amount and Period */}
        <div className="grid grid-cols-5 gap-3 md:gap-4">
          <div className="col-span-3">
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
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: parseFloat(e.target.value) || 0,
                })
              }
              className={`w-full px-3 py-2 md:px-4 md:py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
                isHalloweenMode
                  ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:shadow-[0_0_10px_rgba(96,201,182,0.2)] focus:ring-2 focus:ring-[#60c9b6]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white focus:ring-2 focus:ring-[#8B5CF6]"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#8B5CF6]"
              }`}
              required
            />
          </div>

          <div className="col-span-2">
            <Dropdown
              title="Period"
              value={formData.period}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  period: value as BudgetPeriod,
                })
              }
              options={PERIODS.map((period) => ({
                value: period,
                label: period.charAt(0).toUpperCase() + period.slice(1),
              }))}
              placeholder="Select period"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <CategoryPicker
            label="Category"
            value={formData.category}
            onChange={(categoryId) => {
              const category = categories?.find((c) => c.id === categoryId);
              setFormData({
                ...formData,
                category: categoryId,
                icon: category?.icon || "",
              });
            }}
            placeholder="Select category"
          />
        </div>

        {/* Budget Period */}
        <Calendar
          mode="range"
          label="Budget Period"
          startDate={formData.start_date}
          endDate={formData.end_date}
          onStartDateChange={(date) =>
            setFormData({ ...formData, start_date: date })
          }
          onEndDateChange={(date) =>
            setFormData({ ...formData, end_date: date })
          }
          placeholder="Select budget period"
          onChange={() => {
            // Required prop but not used in range mode (Don't Remove)
          }}
        />

        {/* Color Picker */}
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
            Budget Color
          </label>
          <div className="grid grid-cols-4 gap-1.5 md:flex md:gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-full h-12 md:aspect-auto md:w-10 md:h-10 rounded-lg transition-transform ${
                  formData.color === color
                    ? "ring-2 ring-white md:scale-110"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 md:gap-3 pt-2 md:pt-4">
          <button
            type="submit"
            disabled={
              isLoading || !formData.name.trim() || formData.amount <= 0
            }
            className={`flex-1 px-3 py-1.5 md:px-6 md:py-3 rounded-lg text-xs md:text-base font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isHalloweenMode
                ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                : "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
            }`}
          >
            {isLoading
              ? "Saving..."
              : budget
                ? "Update Budget"
                : "Create Budget"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
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
