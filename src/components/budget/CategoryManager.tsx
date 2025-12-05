import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  useCategoriesQuery,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/queries/useCategories";
import { useCurrency } from "@/hooks/useCurrency";
import { Category, CategoryType } from "@/types/budget";
import { CategoryModal } from "./CategoryModal";

interface CategoryManagerProps {
  triggerAdd?: number;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  triggerAdd,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { formatAmount } = useCurrency();
  const { data: categories = [], isLoading } = useCategoriesQuery();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >();
  const [selectedType, setSelectedType] = useState<CategoryType>("expense");
  const [isManaging, setIsManaging] = useState(false);

  // Listen for external trigger to add category
  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  React.useEffect(() => {
    if (triggerAdd && triggerAdd > 0) {
      setSelectedType("expense");
      handleCreate();
    }
  }, [triggerAdd]);

  const handleCreate = () => {
    setEditingCategory(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      await deleteCategory.mutateAsync(id);
    }
  };

  const handleSave = async (categoryData: Partial<Category>) => {
    if (editingCategory) {
      await updateCategory.mutateAsync({
        id: editingCategory.id,
        ...categoryData,
      });
    } else {
      const newCategory = {
        name: categoryData.name!,
        type: categoryData.type!,
        icon: categoryData.icon!,
        color: categoryData.color!,
        is_active: categoryData.is_active ?? true,
        category_type: "user" as const,
      };
      await createCategory.mutateAsync(newCategory);
    }
  };

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");
  const goalCategories = categories.filter((c) => c.type === "goal");

  // Helper to organize categories into parent-child structure
  const organizeCategories = (cats: Category[]) => {
    const parentCategories = cats.filter((c) => !c.parent_id);
    // Sort: system categories first, then user categories
    const sorted = parentCategories.sort((a, b) => {
      if (a.category_type === "system" && b.category_type !== "system")
        return -1;
      if (a.category_type !== "system" && b.category_type === "system")
        return 1;
      return a.name.localeCompare(b.name);
    });
    return sorted.map((parent) => ({
      ...parent,
      subcategories: cats.filter((c) => c.parent_id === parent.id),
    }));
  };

  const renderCategoryList = (list: Category[], title: string) => (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 md:mb-6">
        <div>
          <h3
            className={`text-base md:text-lg font-semibold ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            {title}
          </h3>
          <span
            className={`text-xs md:text-sm ${
              isHalloweenMode
                ? "text-[#60c9b6]/70"
                : isDark
                  ? "text-gray-400"
                  : "text-gray-500"
            }`}
          >
            {list.length} categories
          </span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* Manage Button */}
          <button
            onClick={() => setIsManaging(!isManaging)}
            className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-xs font-medium overflow-hidden ${
              isManaging
                ? isHalloweenMode
                  ? "bg-[rgba(96,201,182,0.2)] border-[#60c9b6] text-[#60c9b6]"
                  : "bg-[rgba(236,72,153,0.2)] border-pink-500 text-pink-500"
                : isHalloweenMode
                  ? "bg-[rgba(96,201,182,0.1)] border-[#60c9b6]/30 text-[#60c9b6] hover:bg-[rgba(96,201,182,0.2)]"
                  : isDark
                    ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {isManaging ? (
              <Icons.Check className="w-3.5 h-3.5" />
            ) : (
              <Edit2 className="w-3.5 h-3.5" />
            )}
            <span>{isManaging ? "Done" : "Manage"}</span>
          </button>

          {/* Add Category Button */}
          <motion.button
            onClick={() => {
              setSelectedType(
                title === "Income"
                  ? "income"
                  : title === "Goal"
                    ? "goal"
                    : "expense",
              );
              handleCreate();
            }}
            className={`flex items-center justify-center space-x-1 px-3 py-1.5 cursor-pointer rounded-lg transition-colors text-xs font-medium shrink-0 ${
              isHalloweenMode
                ? "bg-[rgba(96,201,182,0.2)] border border-[rgba(96,201,182,0.3)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)]"
                : "bg-[rgba(236,72,153,0.2)] border border-[rgba(236,72,153,0.3)] text-pink-500 hover:bg-[rgba(236,72,153,0.3)]"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add {title} Category</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
        {organizeCategories(list).map((category, index) => {
          const IconComponent =
            (Icons[category.icon as keyof typeof Icons] as React.ComponentType<{
              className?: string;
            }>) || Icons.Tag;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={`group rounded-xl border transition-all overflow-hidden ${
                  isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.15)] border-[#60c9b6]/30 hover:bg-[rgba(96,201,182,0.2)] hover:border-[#60c9b6]/60"
                    : isDark
                      ? "bg-white/5 border-white/10 hover:bg-white/10"
                      : "bg-white border-gray-200 hover:shadow-md"
                }`}
              >
                <div className="p-2 md:p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className="w-7 h-7 md:w-8 md:h-8 rounded-md flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: isHalloweenMode
                            ? "rgba(96,201,182,0.15)"
                            : `${category.color}20`,
                          color: isHalloweenMode ? "#60c9b6" : category.color,
                        }}
                      >
                        <IconComponent className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <h4
                          className="font-medium text-[10px] md:text-sm truncate leading-tight"
                          style={{
                            color: isHalloweenMode ? "#60c9b6" : category.color,
                          }}
                        >
                          {category.name}
                        </h4>

                        {/* System Badge - Moved below name */}
                        {category.category_type === "system" && (
                          <span
                            className={`text-[8px] md:text-[10px] px-1 py-0.5 rounded w-fit ${
                              isHalloweenMode
                                ? "bg-[rgba(96,201,182,0.15)] text-[#60c9b6]"
                                : isDark
                                  ? "bg-white/10 text-gray-400"
                                  : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            System
                          </span>
                        )}

                        {/* User Badge for user-created categories */}
                        {category.category_type === "user" && (
                          <span
                            className="text-[8px] md:text-[10px] px-1 py-0.5 rounded w-fit"
                            style={{
                              backgroundColor: `${category.color}15`,
                              color: category.color,
                            }}
                          >
                            User
                          </span>
                        )}

                        {category.budget_limit && (
                          <p className="text-[9px] md:text-[10px] text-gray-500 truncate">
                            {formatAmount(category.budget_limit)}
                          </p>
                        )}
                      </div>
                    </div>

                    {category.category_type !== "system" && (
                      <div
                        className={`flex items-center gap-1 transition-opacity ${isManaging ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(category);
                          }}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            isHalloweenMode
                              ? "hover:bg-[rgba(96,201,182,0.2)] text-[#60c9b6]"
                              : isDark
                                ? "hover:bg-white/10 text-gray-400 hover:text-white"
                                : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                          }`}
                          title="Edit category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(category.id);
                          }}
                          className="p-1 rounded transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Subcategories List */}
                  {category.subcategories &&
                    category.subcategories.length > 0 && (
                      <div className="mt-2 md:mt-3 pl-3 md:pl-4 border-l-2 border-gray-100 dark:border-white/5 space-y-1.5">
                        {category.subcategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-1 h-1 rounded-full"
                                style={{ backgroundColor: sub.color }}
                              />
                              <span
                                className={`text-[10px] md:text-xs ${isDark ? "text-gray-300" : "text-gray-600"}`}
                              >
                                {sub.name}
                              </span>
                            </div>
                            {sub.category_type !== "system" && (
                              <div
                                className={`flex gap-1 transition-opacity ${isManaging ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                              >
                                <button
                                  onClick={() => handleEdit(sub)}
                                  className={`p-0.5 rounded transition-colors cursor-pointer ${
                                    isDark
                                      ? "hover:bg-white/10 text-gray-400"
                                      : "hover:bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  <Edit2 className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(sub.id)}
                                  className={`p-0.5 rounded transition-colors cursor-pointer ${
                                    isDark
                                      ? "hover:bg-red-500/20 text-red-400"
                                      : "hover:bg-red-100 text-red-500"
                                  }`}
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Add New Button Card */}
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="p-8 text-center">Loading categories...</div>;
  }

  return (
    <div className="space-y-8">
      {renderCategoryList(expenseCategories, "Expense")}
      {renderCategoryList(incomeCategories, "Income")}
      {renderCategoryList(goalCategories, "Goal")}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        category={editingCategory}
        defaultType={selectedType}
      />
    </div>
  );
};
