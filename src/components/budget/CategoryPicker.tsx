import { Search } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Dropdown";
import { IconRenderer } from "@/contexts/IconPickerContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCategoriesQuery } from "@/hooks/queries/useCategories";
import { CategoryType } from "@/types/budget";

interface CategoryPickerProps {
  value?: string;
  onChange: (categoryId: string) => void;
  type?: CategoryType;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  value,
  onChange,
  type,
  label,
  placeholder = "Select category",
  className,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSystemCategories, setShowSystemCategories] = useState(true);
  const { data: categories = [], isLoading } = useCategoriesQuery(type);

  // Filter categories based on search term and system toggle
  const filteredCategories = useMemo(() => {
    let filtered = categories;

    // Filter by system toggle
    if (!showSystemCategories) {
      filtered = filtered.filter((cat) => cat.category_type !== "system");
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  }, [categories, searchTerm, showSystemCategories]);

  const selectedCategory = categories.find((c) => c.id === value);

  return (
    <div className={className}>
      {label && (
        <label
          className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
            isHalloweenMode
              ? "text-[#60c9b6]"
              : isDark
                ? "text-[#B4B4B8]"
                : "text-gray-600"
          }`}
        >
          {label}
        </label>
      )}

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {/* Search Input and System Toggle */}
          <div className="sticky top-0 z-10 px-2 py-2 -mx-1 -mt-1 mb-1 bg-inherit border-b border-gray-100 dark:border-gray-800 space-y-2">
            <div className="relative">
              <Search
                className={`absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]/50"
                    : isDark
                      ? "text-gray-500"
                      : "text-gray-400"
                }`}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-md border focus:outline-none focus:ring-1 ${
                  isHalloweenMode
                    ? "bg-[#1a1a1f] border-[#60c9b6]/20 text-[#60c9b6] placeholder-[#60c9b6]/40 focus:border-[#60c9b6] focus:ring-[#60c9b6]/50"
                    : isDark
                      ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white placeholder-gray-500 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/50"
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/50"
                }`}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>

            {/* System Categories Toggle */}
            <Checkbox
              checked={showSystemCategories}
              onChange={setShowSystemCategories}
              label="Show system categories"
              className="px-1"
            />
          </div>

          {/* Categories List */}
          <div className="overflow-y-auto max-h-[200px] pr-2">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-gray-500">
                Loading...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">
                No categories found
              </div>
            ) : (
              filteredCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center justify-center rounded-md bg-opacity-10 w-5 h-5"
                      style={{
                        backgroundColor: isHalloweenMode
                          ? "rgba(96, 201, 182, 0.1)"
                          : `${category.color}20`,
                        color: isHalloweenMode ? "#60c9b6" : category.color,
                      }}
                    >
                      <IconRenderer
                        icon={category.icon}
                        className="w-3.5 h-3.5"
                      />
                    </div>
                    <span
                      style={{
                        color: isHalloweenMode ? "#60c9b6" : category.color,
                      }}
                    >
                      {category.name}
                    </span>
                  </div>
                </SelectItem>
              ))
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};
