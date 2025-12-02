import { motion } from "framer-motion";
import { Target, Wallet } from "lucide-react";
import { useState } from "react";
import {
  batGlide,
  cardHauntedHouse,
  cardPumpkinsStaring,
  ghostScare,
  pumpkinBlocky,
  pumpkinWitchhat,
  skullStaring,
  witchBrew,
} from "@/assets";
import { GlassCard } from "@/components/GlassCard";
import { AccountsTabSkeleton } from "@/components/skeletons/BudgetSkeletons";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useTheme } from "@/contexts/ThemeContext";
import { useGoalsQuery } from "@/hooks/queries/useGoals";
import { Account, FinancialGoal } from "@/types/budget";
import { AccountCard } from "./AccountCard";
import { GoalCard } from "./GoalCard";

interface AccountListProps {
  accounts: Account[];
  onDeleteAccount: (id: string) => Promise<void>;
  onEditAccount: (account: Account) => void;
  onEditGoal: (goal: FinancialGoal) => void;
  onDeleteGoal: (id: string) => void;
  isLoading?: boolean;
}

export const AccountList: React.FC<AccountListProps> = ({
  accounts,
  onDeleteAccount,
  onEditAccount,
  onEditGoal,
  onDeleteGoal,
  isLoading = false,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  // Goals state - only for display and deletion confirmation
  const { data: goals = [] } = useGoalsQuery();
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

  const handleEdit = (account: Account) => {
    onEditAccount(account);
  };

  const handleDelete = async () => {
    if (accountToDelete) {
      await onDeleteAccount(accountToDelete);
      setAccountToDelete(null);
    }
  };

  const handleDeleteGoal = async () => {
    if (goalToDelete) {
      onDeleteGoal(goalToDelete);
      setGoalToDelete(null);
    }
  };

  // Group accounts by type
  const accountsByType = accounts.reduce(
    (acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = [];
      }
      acc[account.type].push(account);
      return acc;
    },
    {} as Record<string, Account[]>,
  );

  const accountTypes = Object.keys(accountsByType);

  if (isLoading) {
    return <AccountsTabSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className={`text-xl font-bold ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            Accounts
          </h2>
          <p
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Manage your financial accounts
          </p>
        </div>
      </div>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
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
                backgroundImage: `url(${cardPumpkinsStaring})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}
          <div className="relative overflow-hidden min-h-[300px] flex items-center justify-center p-8">
            {isHalloweenMode && (
              <>
                <motion.img
                  src={pumpkinBlocky}
                  alt=""
                  className="absolute top-8 left-8 w-16 opacity-15 pointer-events-none z-0"
                  style={{
                    filter: "drop-shadow(0 0 20px rgba(96, 201, 182, 0.4))",
                  }}
                  animate={{
                    rotate: [-5, 5, -5],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.img
                  src={skullStaring}
                  alt=""
                  className="absolute bottom-8 right-8 w-14 opacity-15 pointer-events-none z-0"
                  style={{
                    filter: "drop-shadow(0 0 20px rgba(96, 201, 182, 0.4))",
                  }}
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0.15, 0.22, 0.15],
                  }}
                  transition={{
                    duration: 4,
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
                    src={pumpkinWitchhat}
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
                        ? "bg-[rgba(249,115,22,0.1)] border-2 border-[rgba(249,115,22,0.3)]"
                        : "bg-[rgba(249,115,22,0.05)] border-2 border-[rgba(249,115,22,0.2)]"
                    }`}
                  >
                    <Wallet
                      className={`w-14 h-14 md:w-16 md:h-16 ${
                        isDark ? "text-[#F97316]" : "text-[#EA580C]"
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
                {isHalloweenMode ? "No Haunted Accounts" : "No Accounts Yet"}
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
                  ? "The vault of spectral accounts awaits. Add your first cursed account to begin tracking your financial nightmares."
                  : "Create your first account to start managing your finances effectively."}
              </p>
            </div>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {accountTypes.map((type) => (
            <div key={type}>
              <h3
                className={`text-sm font-medium mb-3 capitalize ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {type.replace("_", " ")} ({accountsByType[type].length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accountsByType[type].map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    onEdit={handleEdit}
                    onDelete={(id) => setAccountToDelete(id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Goals Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className={`text-xl font-bold flex items-center gap-2 ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-900"
              }`}
            >
              Financial Goals
            </h2>
            <p
              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              Track your savings goals and progress
            </p>
          </div>
        </div>

        {goals.length === 0 ? (
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
                  backgroundImage: `url(${cardHauntedHouse})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
            <div className="relative overflow-hidden min-h-[300px] flex items-center justify-center p-8">
              {isHalloweenMode && (
                <>
                  <motion.img
                    src={witchBrew}
                    alt=""
                    className="absolute top-8 right-8 w-16 opacity-15 pointer-events-none z-0"
                    style={{
                      filter: "drop-shadow(0 0 20px rgba(96, 201, 182, 0.4))",
                    }}
                    animate={{
                      y: [0, -6, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.img
                    src={batGlide}
                    alt=""
                    className="absolute bottom-8 left-8 w-14 opacity-15 pointer-events-none z-0"
                    style={{
                      filter: "drop-shadow(0 0 20px rgba(96, 201, 182, 0.4))",
                    }}
                    animate={{
                      x: [0, -10, 0],
                      y: [0, 5, 0],
                    }}
                    transition={{
                      duration: 5,
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
                      src={ghostScare}
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
                      <Target
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
                  {isHalloweenMode ? "No Cursed Goals" : "No Goals Yet"}
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
                    ? "No dark ambitions yet. Set your first spectral goal to track your journey through the financial shadows."
                    : "Create your first goal to start tracking your savings progress and achieve your financial dreams."}
                </p>
              </div>
            </div>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={onEditGoal}
                onDelete={(id) => setGoalToDelete(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Account Confirmation */}
      <ConfirmationModal
        isOpen={!!accountToDelete}
        onClose={() => setAccountToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Account"
        description="Are you sure you want to delete this account? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />

      {/* Delete Goal Confirmation */}
      <ConfirmationModal
        isOpen={!!goalToDelete}
        onClose={() => setGoalToDelete(null)}
        onConfirm={handleDeleteGoal}
        title="Delete Goal"
        description="Are you sure you want to delete this goal? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};
