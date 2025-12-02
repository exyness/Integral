import { motion } from "framer-motion";
import { Repeat } from "lucide-react";
import React, { useState } from "react";
import {
  batGlide,
  cardRedmoonBackyard,
  ghostGenie,
  ghostScare,
} from "@/assets";
import { RecurringTabSkeleton } from "@/components/skeletons/BudgetSkeletons";
import { useTheme } from "@/contexts/ThemeContext";
import {
  useAccountsQuery,
  useCategoriesQuery,
  useCreateRecurringTransaction,
  useDeleteRecurringTransaction,
  useRecurringTransactionsQuery,
  useUpdateRecurringTransaction,
} from "@/hooks/queries/useBudgetsQuery";
import { RecurringTransaction } from "@/types/budget";
import { GlassCard } from "../GlassCard";
import { RecurringCard } from "./RecurringCard";
import { RecurringModal } from "./RecurringModal";

interface RecurringManagerProps {
  onAddRule?: () => void;
}

export const RecurringManager: React.FC<RecurringManagerProps> = ({
  onAddRule,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { data: recurringTransactions = [], isLoading } =
    useRecurringTransactionsQuery();
  const { data: accounts = [] } = useAccountsQuery();
  const { data: categories = [] } = useCategoriesQuery();

  const createMutation = useCreateRecurringTransaction();
  const updateMutation = useUpdateRecurringTransaction();
  const deleteMutation = useDeleteRecurringTransaction();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<RecurringTransaction | null>(null);

  // Listen for event from parent to open modal
  React.useEffect(() => {
    const handleOpenModal = () => {
      setEditingTransaction(null);
      setIsModalOpen(true);
    };

    window.addEventListener("openRecurringModal", handleOpenModal);
    return () => {
      window.removeEventListener("openRecurringModal", handleOpenModal);
    };
  }, []);

  const getAccountName = (id: string | undefined): string => {
    if (!id) return "Unknown Account";
    const account = accounts.find((a) => a.id === id);
    return account?.name || "Unknown Account";
  };

  const getCategoryName = (id: string | undefined): string => {
    if (!id) return "Uncategorized";
    const category = categories.find((c) => c.id === id);
    return String(category?.name || "Uncategorized");
  };

  const handleCreate = async (
    data: Omit<
      RecurringTransaction,
      "id" | "user_id" | "created_at" | "updated_at" | "last_run_date"
    >,
  ) => {
    await createMutation.mutateAsync(data);
    setIsModalOpen(false);
  };

  const handleUpdate = async (data: Partial<RecurringTransaction>) => {
    if (editingTransaction) {
      await updateMutation.mutateAsync({
        id: editingTransaction.id,
        updates: data,
      });
      setEditingTransaction(null);
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const toggleActive = async (transaction: RecurringTransaction) => {
    await updateMutation.mutateAsync({
      id: transaction.id,
      updates: { active: !transaction.active },
    });
  };

  if (isLoading) {
    return <RecurringTabSkeleton />;
  }

  return (
    <div className="space-y-6">
      {recurringTransactions.length === 0 ? (
        <GlassCard
          variant="secondary"
          className={`relative overflow-hidden ${
            isHalloweenMode
              ? "border-[rgba(96,201,182,0.2)] shadow-[0_0_15px_rgba(96,201,182,0.1)]"
              : ""
          }`}
        >
          {isHalloweenMode && (
            <div
              className="absolute inset-0 pointer-events-none opacity-5 z-0"
              style={{
                backgroundImage: `url(${cardRedmoonBackyard})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}
          <div className="relative overflow-hidden min-h-[300px] flex items-center justify-center p-8">
            {isHalloweenMode && (
              <>
                <motion.img
                  src={ghostScare}
                  alt=""
                  className="absolute top-10 right-10 w-16 md:w-20 opacity-10 pointer-events-none z-0"
                  style={{
                    filter: "drop-shadow(0 0 20px rgba(96, 201, 182, 0.4))",
                  }}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.1, 0.15, 0.1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.img
                  src={batGlide}
                  alt=""
                  className="absolute bottom-10 left-10 w-16 opacity-8 pointer-events-none z-0"
                  style={{
                    filter: "drop-shadow(0 0 15px rgba(96, 201, 182, 0.3))",
                  }}
                  animate={{
                    x: [0, 20, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </>
            )}
            <div className="text-center py-12 md:py-16 relative z-10">
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {isHalloweenMode ? (
                  <motion.img
                    src={ghostGenie}
                    alt=""
                    className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-6 opacity-80"
                    style={{
                      filter: "drop-shadow(0 0 30px rgba(96, 201, 182, 0.5))",
                    }}
                  />
                ) : (
                  <div
                    className={`w-28 h-28 md:w-32 md:h-32 mx-auto mb-6 rounded-full flex items-center justify-center ${
                      isDark
                        ? "bg-[rgba(139,92,246,0.1)] border-2 border-[rgba(139,92,246,0.3)]"
                        : "bg-[rgba(139,92,246,0.05)] border-2 border-[rgba(139,92,246,0.2)]"
                    }`}
                  >
                    <Repeat
                      className={`w-14 h-14 md:w-16 md:h-16 ${
                        isDark ? "text-[#8B5CF6]" : "text-[#7C3AED]"
                      }`}
                    />
                  </div>
                )}
              </motion.div>
              <h3
                className={`text-xl md:text-2xl font-bold mb-3 ${
                  isHalloweenMode
                    ? "text-[#60c9b6] font-creepster tracking-wide"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                {isHalloweenMode
                  ? "No Recurring Spells Cast"
                  : "No Recurring Rules"}
              </h3>
              <p
                className={`text-sm md:text-base max-w-md mx-auto ${
                  isHalloweenMode
                    ? "text-[#60c9b6]/70"
                    : isDark
                      ? "text-[#B4B4B8]"
                      : "text-gray-600"
                }`}
              >
                {isHalloweenMode
                  ? "Your recurring realm is empty. Cast your first spell to automate mystical transactions."
                  : "Set up recurring transactions for bills, subscriptions, or salary to automate your budget tracking."}
              </p>
            </div>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recurringTransactions.map((transaction) => (
            <RecurringCard
              key={transaction.id}
              transaction={transaction}
              onEdit={(t) => {
                setEditingTransaction(t);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
              onToggleActive={toggleActive}
              getAccountName={getAccountName}
              getCategoryName={getCategoryName}
            />
          ))}
        </div>
      )}

      <RecurringModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={editingTransaction ? handleUpdate : handleCreate}
        isLoading={createMutation.isPending || updateMutation.isPending}
        transaction={editingTransaction}
      />
    </div>
  );
};
