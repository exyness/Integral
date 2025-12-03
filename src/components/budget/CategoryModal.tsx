import { useEffect, useState } from "react";
import { toast } from "sonner";
import { batGlide, treeSceneryCurly } from "@/assets";
import { Dropdown } from "@/components/ui/Dropdown";
import { IconPicker } from "@/components/ui/IconPicker";
import { Modal } from "@/components/ui/Modal";
import { useTheme } from "@/contexts/ThemeContext";
import { Category, CategoryType } from "@/types/budget";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category;
  onSubmit: (
    data: Omit<
      Category,
      "id" | "user_id" | "created_at" | "updated_at" | "category_type"
    >,
  ) => Promise<void>;
  isLoading?: boolean;
  defaultType?: CategoryType;
}

const CATEGORY_TYPES: CategoryType[] = ["expense", "income", "goal"];

const COLORS = [
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
  "#64748B",
  "#A855F7",
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSubmit,
  isLoading = false,
  defaultType = "expense",
}) => {
  const { isDark, isHalloweenMode } = useTheme();

  const [formData, setFormData] = useState({
    name: "",
    type: defaultType,
    icon: "Tag",
    color: COLORS[0],
    is_active: true,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
        is_active: category.is_active,
      });
    } else {
      setFormData({
        name: "",
        type: defaultType,
        icon: "Tag",
        color: COLORS[0],
        is_active: true,
      });
    }
  }, [category, defaultType, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      await onSubmit(formData);
      if (!category) {
        setFormData({
          name: "",
          type: defaultType,
          icon: "Tag",
          color: COLORS[0],
          is_active: true,
        });
      }
      onClose();
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? "Edit Category" : "Create Category"}
      size="lg"
      hideDecorations
    >
      {isHalloweenMode && (
        <>
          <div className="absolute -bottom-0 -right-0 pointer-events-none z-0">
            <img
              src={treeSceneryCurly}
              alt=""
              className="w-32 h-32 md:w-48 md:h-48 opacity-20"
            />
          </div>
          <div className="absolute -top-4 -right-4 pointer-events-none z-0">
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
        {/* Name and Type */}
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
              Category Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-3 py-2 md:px-4 md:py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
                isHalloweenMode
                  ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:ring-2 focus:ring-[#60c9b6]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white focus:ring-2 focus:ring-[#8B5CF6]"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#8B5CF6]"
              }`}
              placeholder="e.g., Groceries"
              required
              autoFocus
            />
          </div>

          <div>
            <Dropdown
              title="Type"
              value={formData.type}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  type: value as CategoryType,
                })
              }
              options={CATEGORY_TYPES.map((type) => ({
                value: type,
                label: type.charAt(0).toUpperCase() + type.slice(1),
              }))}
              placeholder="Select type"
            />
          </div>
        </div>

        {/* Icon Picker - Full width on mobile, half width on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="md:col-span-1">
            <IconPicker
              value={formData.icon}
              onChange={(iconName) =>
                setFormData({ ...formData, icon: iconName })
              }
              label="Category Icon"
              placeholder="Select an icon"
            />
          </div>
          {/* Empty div to maintain grid layout on desktop */}
          <div className="hidden md:block" />
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
            Color
          </label>
          <div className="grid grid-cols-5 gap-2 md:flex md:flex-wrap md:gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-full aspect-square md:w-10 md:h-10 rounded-lg transition-transform cursor-pointer ${
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
            disabled={isLoading || !formData.name.trim()}
            className={`flex-1 px-3 py-1.5 md:px-6 md:py-3 rounded-lg text-xs md:text-base font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isHalloweenMode
                ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                : "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
            }`}
          >
            {isLoading
              ? "Saving..."
              : category
                ? "Update Category"
                : "Create Category"}
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
