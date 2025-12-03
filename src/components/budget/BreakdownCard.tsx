import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import React from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { batSwoop, ghostDroopy, pumpkinBlocky } from "@/assets";
import { IconRenderer } from "@/contexts/IconPickerContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCurrency } from "@/hooks/useCurrency";

export interface BreakdownItem {
  id: string;
  name: string;
  amount: number;
  color: string;
  icon: string;
  percentage: number;
  type?: string;
}

export interface HistoryPoint {
  date: string;
  amount: number;
}

interface BreakdownCardProps {
  title: string;
  items: BreakdownItem[];
  history: HistoryPoint[];
  totalAmount: number;
  type: "assets" | "liabilities";
  onViewDetails?: () => void;
}

export const BreakdownCard: React.FC<BreakdownCardProps> = ({
  title,
  items,
  history,
  totalAmount,
  type,
  onViewDetails,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { formatAmount } = useCurrency();

  // Prepare data for the small pie chart
  const pieData = items.map((item) => ({
    name: item.name,
    value: item.amount,
    color: item.color,
  }));

  // Prepare data for the bar chart
  // Since we don't have real historical breakdown, we'll use the total history
  // and maybe apply the current ratio for visual effect if it's assets (stacked)
  // For now, let's keep it simple with a single bar per month representing the total
  const barData = history.map((point) => ({
    name: new Date(point.date).toLocaleString("default", { month: "short" }),
    amount: point.amount,
  }));

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-3 rounded-xl border shadow-xl ${
            isDark
              ? "bg-[#1a1a1f] border-white/10 text-white"
              : "bg-white border-gray-100 text-gray-900"
          }`}
        >
          <p className="text-xs font-medium mb-1">{label}</p>
          <p className="text-sm font-bold">{formatAmount(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl p-6 ${
        isHalloweenMode
          ? "bg-[#15151a] border border-[#60c9b6]/20"
          : isDark
            ? "bg-[#15151a] border border-white/5"
            : "bg-white border border-gray-100 shadow-sm"
      }`}
    >
      {/* Header with Title and Pie Chart */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3
            className={`text-lg font-semibold mb-1 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}
          >
            Total:{" "}
            <span className={isDark ? "text-gray-300" : "text-gray-600"}>
              {formatAmount(totalAmount)}
            </span>
          </p>
        </div>

        {/* Small Pie Chart */}
        <div className="w-16 h-16 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={32}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Bar Chart */}
      <div className="h-[200px] w-full mb-8">
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barSize={24}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? "#6B7280" : "#9CA3AF", fontSize: 10 }}
                dy={10}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  fill: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                }}
              />
              <Bar
                dataKey="amount"
                radius={[4, 4, 4, 4]}
                fill={type === "assets" ? "#60c9b6" : "#F87171"}
                fillOpacity={0.8}
              >
                {barData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      type === "assets"
                        ? isHalloweenMode
                          ? "#60c9b6"
                          : "#34D399"
                        : "#F87171"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="relative overflow-hidden h-full flex items-center justify-center">
            {isHalloweenMode && (
              <motion.img
                src={type === "assets" ? pumpkinBlocky : batSwoop}
                alt=""
                className="absolute top-4 right-4 w-8 opacity-10 pointer-events-none z-0"
                animate={{
                  rotate: type === "assets" ? [0, 5, -5, 0] : undefined,
                  x: type === "liabilities" ? [0, 10, 0] : undefined,
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {isHalloweenMode ? (
                <motion.img
                  src={ghostDroopy}
                  alt=""
                  className="w-16 h-16 mx-auto mb-2 opacity-60"
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ) : (
                <DollarSign
                  className={`w-16 h-16 mx-auto mb-2 ${isDark ? "text-[#71717A]" : "text-gray-300"}`}
                />
              )}
              <p
                className={`text-sm ${
                  isHalloweenMode
                    ? "text-[#60c9b6]/70"
                    : isDark
                      ? "text-gray-500"
                      : "text-gray-400"
                }`}
              >
                {isHalloweenMode
                  ? "No mystical records found"
                  : "No history data yet"}
              </p>
            </motion.div>
          </div>
        )}
      </div>

      {/* List of Items */}
      <div className="space-y-3">
        {items.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-xl ${
              isDark ? "bg-white/5" : "bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <IconRenderer icon={item.icon} className="w-4 h-4" />
              </div>
              <span
                className={`text-sm font-medium ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {formatAmount(item.amount)}
              </span>
              <span className="text-xs text-gray-500">
                ({item.percentage.toFixed(0)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
