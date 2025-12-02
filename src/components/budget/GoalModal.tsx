import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CategoryPicker } from "@/components/budget/CategoryPicker";
import { Calendar } from "@/components/ui/Calendar";
import { Dropdown } from "@/components/ui/Dropdown";
import { IconPicker } from "@/components/ui/IconPicker";
import { Modal } from "@/components/ui/Modal";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccountsQuery } from "@/hooks/queries/useBudgetsQuery";
import { FinancialGoal } from "@/types/budget";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<FinancialGoal>) => void;
  initialData?: FinancialGoal;
}

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

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { data: accounts = [] } = useAccountsQuery();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    target_amount: 0,
    current_amount: 0,
    target_date: "",
    linked_account_id: "",
    category_id: "",
    icon: "Target",
    color: COLORS[0],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || "",
        target_amount: initialData.target_amount,
        current_amount: initialData.current_amount,
        target_date: initialData.target_date || "",
        linked_account_id: initialData.linked_account_id || "",
        category_id: initialData.category_id || "",
        icon: initialData.icon,
        color: initialData.color,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        target_amount: 0,
        current_amount: 0,
        target_date: "",
        linked_account_id: "",
        category_id: "",
        icon: "Target",
        color: COLORS[0],
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a goal name");
      return;
    }

    if (formData.target_amount <= 0) {
      toast.error("Target amount must be greater than 0");
      return;
    }

    onSave({
      ...formData,
      target_amount: Number(formData.target_amount),
      current_amount: Number(formData.current_amount),
      target_date: formData.target_date || undefined,
      linked_account_id: formData.linked_account_id || undefined,
      category_id: formData.category_id || undefined,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Goal" : "Create Goal"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
        {/* Goal Name */}
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
            Goal Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-2 md:px-4 md:py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:ring-2 focus:ring-[#60c9b6]"
                : isDark
                  ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white focus:ring-2 focus:ring-[#8B5CF6]"
                  : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#8B5CF6]"
            }`}
            placeholder="e.g., Emergency Fund"
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
            rows={2}
            className={`w-full px-3 py-2 md:px-4 md:py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:ring-2 focus:ring-[#60c9b6]"
                : isDark
                  ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white focus:ring-2 focus:ring-[#8B5CF6]"
                  : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#8B5CF6]"
            }`}
            placeholder="Add any notes about this goal"
          />
        </div>

        {/* Amount Fields */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
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
              Target Amount<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.target_amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  target_amount: parseFloat(e.target.value) || 0,
                })
              }
              className={`w-full px-3 py-2 md:px-4 md:py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
                isHalloweenMode
                  ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:ring-2 focus:ring-[#60c9b6]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white focus:ring-2 focus:ring-[#8B5CF6]"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#8B5CF6]"
              }`}
              required
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
              Current Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.current_amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  current_amount: parseFloat(e.target.value) || 0,
                })
              }
              className={`w-full px-3 py-2 md:px-4 md:py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
                isHalloweenMode
                  ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:ring-2 focus:ring-[#60c9b6]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white focus:ring-2 focus:ring-[#8B5CF6]"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#8B5CF6]"
              }`}
            />
          </div>
        </div>

        {/* Target Date */}
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
            Target Date (Optional)
          </label>
          <Calendar
            value={formData.target_date}
            onChange={(date) =>
              setFormData({
                ...formData,
                target_date: date,
              })
            }
            placeholder="Select target date"
          />
        </div>

        {/* Linked Account and Icon Picker side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <Dropdown
              title="Link to Account (Optional)"
              value={formData.linked_account_id}
              onValueChange={(value) =>
                setFormData({ ...formData, linked_account_id: value })
              }
              options={[
                { value: "", label: "None" },
                ...accounts.map((account) => ({
                  value: account.id,
                  label: account.name,
                })),
              ]}
              placeholder="Select account"
            />
            <p
              className={`text-[10px] md:text-xs mt-1 ${
                isHalloweenMode
                  ? "text-[#60c9b6]/50"
                  : isDark
                    ? "text-[#B4B4B8]"
                    : "text-gray-500"
              }`}
            >
              Link to an account to auto-track progress
            </p>
          </div>

          {/* Icon Picker */}
          <div>
            <IconPicker
              value={formData.icon}
              onChange={(iconName) =>
                setFormData({ ...formData, icon: iconName })
              }
              label="Goal Icon"
              placeholder="Select an icon"
            />
          </div>
        </div>

        {/* Category Picker */}
        <div>
          <CategoryPicker
            label="Linked Category (Optional)"
            type="goal"
            value={formData.category_id}
            onChange={(categoryId) =>
              setFormData({ ...formData, category_id: categoryId })
            }
            placeholder="Select a category for this goal"
          />
        </div>

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
            Goal Color
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
            className={`flex-1 px-3 py-1.5 md:px-6 md:py-3 rounded-lg text-xs md:text-base font-medium transition-colors cursor-pointer ${
              isHalloweenMode
                ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                : "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
            }`}
          >
            {initialData ? "Update Goal" : "Create Goal"}
          </button>
          <button
            type="button"
            onClick={onClose}
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
