import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface TransferReceiptCardProps {
  amount: number;
  fromAccount: string;
  toAccount: string;
  fromBalanceBefore: number;
  fromBalanceAfter: number;
  toBalanceBefore: number;
  toBalanceAfter: number;
  currency: string;
}

export const TransferReceiptCard: React.FC<TransferReceiptCardProps> = ({
  amount,
  fromAccount,
  toAccount,
  fromBalanceBefore,
  fromBalanceAfter,
  toBalanceBefore,
  toBalanceAfter,
  currency,
}) => {
  const { isDark, isHalloweenMode } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-2xl border p-5 ${
        isHalloweenMode
          ? "bg-[rgba(96,201,182,0.05)] border-[rgba(96,201,182,0.3)]"
          : isDark
            ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]"
            : "bg-white border-gray-200 shadow-lg"
      }`}
    >
      {/* Success Header */}
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2
          className={`w-5 h-5 ${
            isHalloweenMode ? "text-[#60c9b6]" : "text-green-500"
          }`}
        />
        <h3
          className={`font-semibold text-base ${
            isHalloweenMode
              ? "text-[#60c9b6]"
              : isDark
                ? "text-white"
                : "text-gray-900"
          }`}
        >
          Transfer Successful
        </h3>
      </div>

      {/* Amount */}
      <div className="mb-5">
        <p
          className={`text-xs mb-1 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Amount Transferred
        </p>
        <p
          className={`text-3xl font-bold ${
            isHalloweenMode ? "text-[#60c9b6]" : "text-green-500"
          }`}
        >
          {currency}
          {amount.toLocaleString()}
        </p>
      </div>

      {/* Transfer Flow */}
      <div className="space-y-3">
        {/* From Account */}
        <div
          className={`p-3 rounded-xl ${
            isHalloweenMode
              ? "bg-[rgba(96,201,182,0.08)]"
              : isDark
                ? "bg-[rgba(255,255,255,0.03)]"
                : "bg-gray-50"
          }`}
        >
          <div className="flex items-start gap-2">
            <TrendingDown className="w-4 h-4 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p
                className={`text-xs mb-1 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                From
              </p>
              <p
                className={`font-semibold text-sm mb-2 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                {fromAccount}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                  {currency}
                  {fromBalanceBefore.toLocaleString()}
                </span>
                <ArrowRight className="w-3 h-3 text-gray-500" />
                <span className="text-red-500 font-semibold">
                  {currency}
                  {fromBalanceAfter.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* To Account */}
        <div
          className={`p-3 rounded-xl ${
            isHalloweenMode
              ? "bg-[rgba(96,201,182,0.08)]"
              : isDark
                ? "bg-[rgba(255,255,255,0.03)]"
                : "bg-gray-50"
          }`}
        >
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
            <div className="flex-1">
              <p
                className={`text-xs mb-1 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                To
              </p>
              <p
                className={`font-semibold text-sm mb-2 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-white"
                      : "text-gray-900"
                }`}
              >
                {toAccount}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                  {currency}
                  {toBalanceBefore.toLocaleString()}
                </span>
                <ArrowRight className="w-3 h-3 text-gray-500" />
                <span className="text-green-500 font-semibold">
                  {currency}
                  {toBalanceAfter.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-dashed border-gray-700/30">
        <p
          className={`text-xs text-center ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`}
        >
          Transaction processed successfully ✓
        </p>
      </div>
    </motion.div>
  );
};
