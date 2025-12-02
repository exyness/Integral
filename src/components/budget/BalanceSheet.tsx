import { Plus } from "lucide-react";
import React from "react";
import { batHang, cardHauntedHouse, webCornerLeft } from "@/assets";
import { AccountCard } from "@/components/budget/AccountCard";
import { NetWorthChart } from "@/components/budget/NetWorthChart";
import { GlassCard } from "@/components/GlassCard";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccountsQuery } from "@/hooks/queries/useBudgetsQuery";
import {
  useDeleteLiability,
  useLiabilitiesQuery,
} from "@/hooks/queries/useLiabilities";
import { useNetWorthHistory } from "@/hooks/queries/useNetWorthHistory";
import { useCurrency } from "@/hooks/useCurrency";
import { Account, Liability } from "@/types/budget";
import { BreakdownCard } from "./BreakdownCard";
import { LiabilityCard } from "./LiabilityCard";

interface BalanceSheetTabProps {
  onAddAccount: () => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => void;
  onAddLiability: () => void;
  onEditLiability: (liability: Liability) => void;
}

export const BalanceSheetTab: React.FC<BalanceSheetTabProps> = ({
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
  onAddLiability,
  onEditLiability,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { formatAmount } = useCurrency();
  const { data: accounts = [], isLoading: accountsLoading } =
    useAccountsQuery();
  const { data: liabilities = [], isLoading: liabilitiesLoading } =
    useLiabilitiesQuery();
  const { history = [] } = useNetWorthHistory();
  const deleteLiability = useDeleteLiability();
  const [showActiveLiabilitiesOnly, setShowActiveLiabilitiesOnly] =
    React.useState(true);
  const [liabilityToDelete, setLiabilityToDelete] = React.useState<
    string | null
  >(null);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  // Calculate totals
  const totalAssets = accounts
    .filter((acc) => acc.include_in_total)
    .reduce((sum, acc) => sum + acc.balance, 0);

  const totalLiabilities = liabilities
    .filter((lib) => lib.is_active)
    .reduce((sum, lib) => sum + lib.amount, 0);

  const netWorth = totalAssets - totalLiabilities;

  const handleDeleteLiability = (id: string) => {
    setLiabilityToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteLiability = async () => {
    if (liabilityToDelete) {
      await deleteLiability.mutateAsync(liabilityToDelete);
      setShowDeleteModal(false);
      setLiabilityToDelete(null);
    }
  };

  // Prepare chart data
  const assetChartData = accounts
    .filter((acc) => acc.include_in_total && acc.balance > 0)
    .map((acc) => ({
      name: acc.name,
      value: acc.balance,
      color: acc.color,
    }));

  const liabilityChartData = liabilities
    .filter((lib) => lib.is_active && lib.amount > 0)
    .map((lib) => ({
      name: lib.name,
      value: lib.amount,
      color: lib.color,
    }));

  // Prepare breakdown items for cards
  const assetItems = accounts
    .filter((acc) => acc.include_in_total && acc.balance > 0)
    .map((acc) => ({
      id: acc.id,
      name: acc.name,
      amount: acc.balance,
      color: acc.color,
      icon: acc.icon,
      percentage: totalAssets > 0 ? (acc.balance / totalAssets) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const liabilityItems = liabilities
    .filter((lib) => lib.is_active && lib.amount > 0)
    .map((lib) => ({
      id: lib.id,
      name: lib.name,
      amount: lib.amount,
      color: lib.color,
      icon: lib.icon,
      percentage:
        totalLiabilities > 0 ? (lib.amount / totalLiabilities) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Prepare history data for cards
  const assetHistory = history.map((h) => ({
    date: h.date,
    amount: h.total_assets,
  }));

  const liabilityHistory = history.map((h) => ({
    date: h.date,
    amount: h.total_liabilities,
  }));

  const isLoading = accountsLoading || liabilitiesLoading;

  if (isLoading) {
    return (
      <div
        className={`p-8 text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}
      >
        Loading balance sheet...
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      {/* Content */}
      <div>
        {/* Net Worth Summary */}
        <GlassCard className="p-4 md:p-6 relative overflow-hidden">
          {/* Decorations */}
          {isHalloweenMode && (
            <>
              <div
                className="absolute inset-0 pointer-events-none z-0 opacity-5"
                style={{
                  backgroundImage: `url(${cardHauntedHouse})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "grayscale(100%)",
                }}
              />
              <div className="absolute top-0 left-0 pointer-events-none z-0 opacity-40">
                <img src={webCornerLeft} alt="" className="w-24 h-24" />
              </div>
              <div className="absolute top-0 right-10 pointer-events-none z-0 opacity-40">
                <img src={batHang} alt="" className="w-16 h-16" />
              </div>
            </>
          )}
          <div className="text-center relative z-10">
            <p
              className={`text-xs md:text-sm font-medium mb-2 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Net Worth
            </p>
            <h2
              className={`text-2xl md:text-4xl lg:text-5xl font-bold ${
                netWorth >= 0
                  ? isHalloweenMode
                    ? "text-[#60c9b6]"
                    : "text-green-500"
                  : "text-red-500"
              }`}
            >
              {formatAmount(netWorth)}
            </h2>
            <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 md:gap-8 mt-3 md:mt-6">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-0.5 md:mb-1">
                  Total Assets
                </p>
                <p
                  className={`text-sm md:text-base lg:text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {formatAmount(totalAssets)}
                </p>
              </div>
              <div className="text-lg md:text-xl lg:text-4xl text-gray-400">
                -
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-0.5 md:mb-1">
                  Total Liabilities
                </p>
                <p
                  className={`text-sm md:text-base lg:text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {formatAmount(totalLiabilities)}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Net Worth History Chart */}
        <div className="mt-8 mb-12">
          <NetWorthChart />
        </div>

        {/* Assets and Liabilities - Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <BreakdownCard
            title="Assets Breakdown"
            items={assetItems}
            history={assetHistory}
            totalAmount={totalAssets}
            type="assets"
            onViewDetails={() => {
              // TODO: Implement view details (e.g. open modal or expand)
              console.log("View Assets Details");
            }}
          />

          <BreakdownCard
            title="Liabilities Breakdown"
            items={liabilityItems}
            history={liabilityHistory}
            totalAmount={totalLiabilities}
            type="liabilities"
            onViewDetails={() => {
              // TODO: Implement view details
              console.log("View Liabilities Details");
            }}
          />
        </div>

        {/* All Accounts Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-xl font-semibold ${
                isHalloweenMode
                  ? "text-[#60c9b6] font-creepster tracking-wider"
                  : isDark
                    ? "text-white"
                    : "text-gray-900"
              }`}
            >
              All Accounts
            </h3>
            <button
              onClick={onAddAccount}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${
                isHalloweenMode
                  ? "bg-[#60c9b6]/10 text-[#60c9b6] border-[#60c9b6]/30 hover:bg-[#60c9b6]/20 hover:border-[#60c9b6]/50"
                  : isDark
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/50"
                    : "bg-cyan-50 text-cyan-600 border-cyan-200 hover:bg-cyan-100 hover:border-cyan-300"
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Account
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts
              .filter((acc) => acc.include_in_total)
              .map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onEdit={onEditAccount}
                  onDelete={onDeleteAccount}
                />
              ))}
          </div>
          {accounts.filter((acc) => acc.include_in_total).length === 0 && (
            <div
              className={`text-center py-12 rounded-xl border-2 border-dashed ${
                isDark ? "border-white/10" : "border-gray-200"
              }`}
            >
              <p
                className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                No accounts yet. Click "Add Account" to get started.
              </p>
            </div>
          )}
        </div>

        {/* All Liabilities Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-xl font-semibold ${
                isHalloweenMode
                  ? "text-[#60c9b6] font-creepster tracking-wider"
                  : isDark
                    ? "text-white"
                    : "text-gray-900"
              }`}
            >
              All Liabilities
            </h3>
            <button
              onClick={onAddLiability}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${
                isHalloweenMode
                  ? "bg-[#60c9b6]/10 text-[#60c9b6] border-[#60c9b6]/30 hover:bg-[#60c9b6]/20 hover:border-[#60c9b6]/50"
                  : isDark
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500/50"
                    : "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 hover:border-purple-300"
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Liability
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liabilities
              .filter((lib) => lib.is_active)
              .map((liability) => (
                <LiabilityCard
                  key={liability.id}
                  liability={liability}
                  onEdit={onEditLiability}
                  onDelete={handleDeleteLiability}
                />
              ))}
          </div>
          {liabilities.filter((lib) => lib.is_active).length === 0 && (
            <div
              className={`text-center py-12 rounded-xl border-2 border-dashed ${
                isDark ? "border-white/10" : "border-gray-200"
              }`}
            >
              <p
                className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                No liabilities yet. Click "Add Liability" to track debts.
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setLiabilityToDelete(null);
        }}
        onConfirm={confirmDeleteLiability}
        title="Delete Liability"
        description="Are you sure you want to delete this liability? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        isLoading={deleteLiability.isPending}
      />
    </div>
  );
};
