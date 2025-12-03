import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import React from "react";
import { batSwoop, ghostScare, spiderCuteHanging } from "@/assets";
import { useTheme } from "@/contexts/ThemeContext";
import { useFinancialHorror } from "@/hooks/budget/useFinancialHorror";
import { useCurrency } from "@/hooks/useCurrency";
import { Budget, BudgetTransaction } from "@/types/budget";

interface FinancialHorrorCardProps {
  transactions: BudgetTransaction[];
  budgets: Budget[];
}

export const FinancialHorrorCard: React.FC<FinancialHorrorCardProps> = ({
  transactions,
  budgets,
}) => {
  const { isHalloweenMode } = useTheme();
  const { currency } = useCurrency();
  const { analyzeFinances, horrorStory, isGhostWriting } = useFinancialHorror(
    transactions,
    budgets,
    currency.symbol,
  );

  if (!isHalloweenMode) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-[#60c9b6]/30 bg-[#1a1a1f]/80 p-6 shadow-[0_0_15px_rgba(96,201,182,0.1)] mb-6"
    >
      {/* Decorations */}
      <motion.img
        src={batSwoop}
        alt=""
        className="absolute -top-2 -right-2 w-16 opacity-20 pointer-events-none"
        animate={{ y: [0, -5, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.img
        src={spiderCuteHanging}
        alt=""
        className="absolute top-0 left-10 w-8 opacity-30 pointer-events-none"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      />

      <div className="flex items-start gap-4 relative z-10">
        <div className="p-3 rounded-full bg-[#60c9b6]/10 border border-[#60c9b6]/20 shrink-0">
          <img
            src={ghostScare}
            alt="Ghost"
            className="w-6 h-6 object-contain"
          />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#60c9b6] mb-2 font-creepster tracking-wide">
            Financial Horror Stories
          </h3>

          {horrorStory ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4"
            >
              <p className="text-gray-300 italic border-l-2 border-[#60c9b6]/30 pl-4 py-1">
                "{horrorStory}"
              </p>
            </motion.div>
          ) : (
            <p className="text-gray-400 text-sm mb-4">
              Dare to know what the spirits think of your spending habits?
              Summon the Crypt Keeper of Capitalism... if you're brave enough.
            </p>
          )}

          <button
            onClick={analyzeFinances}
            disabled={isGhostWriting}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm cursor-pointer ${
              isGhostWriting
                ? "bg-[#60c9b6]/5 text-[#60c9b6]/50 cursor-not-allowed"
                : "bg-[#60c9b6]/20 text-[#60c9b6] hover:bg-[#60c9b6]/30 hover:shadow-[0_0_10px_rgba(96,201,182,0.2)]"
            }`}
          >
            {isGhostWriting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isGhostWriting
              ? "Consulting the Ledger..."
              : "Summon Financial Ghost"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
