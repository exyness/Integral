import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";
import { useNetWorthHistory } from "@/hooks/queries/useNetWorthHistory";
import { useCurrency } from "@/hooks/useCurrency";

export const NetWorthChart = () => {
  const { isDark, isHalloweenMode } = useTheme();
  const { formatAmount } = useCurrency();
  const { history, isLoading } = useNetWorthHistory();

  if (isLoading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center animate-pulse bg-gray-100 dark:bg-white/5 rounded-xl">
        <div className="h-8 w-32 bg-gray-200 dark:bg-white/10 rounded" />
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div
        className={`h-[300px] w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed ${
          isDark ? "border-white/10" : "border-gray-200"
        }`}
      >
        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          No history data available yet
        </p>
        <p
          className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
        >
          Snapshots will appear here over time
        </p>
      </div>
    );
  }

  const chartData = history.map((snapshot) => ({
    date: snapshot.date,
    amount: snapshot.net_worth,
  }));

  const formatCompactNumber = (number: number) => {
    const absNumber = Math.abs(number);
    if (absNumber >= 1000000000) {
      return (number / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
    }
    if (absNumber >= 1000000) {
      return (number / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (absNumber >= 1000) {
      return (number / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return number.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl border ${
        isHalloweenMode
          ? "bg-[#1a1a1f] border-[#60c9b6]/20"
          : isDark
            ? "bg-[#1A1A1F] border-white/5"
            : "bg-white border-gray-100"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3
          className={`text-lg font-semibold ${
            isHalloweenMode
              ? "text-[#60c9b6]"
              : isDark
                ? "text-white"
                : "text-gray-900"
          }`}
        >
          Net Worth History
        </h3>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isHalloweenMode ? "#60c9b6" : "#06B6D4"}
                  stopOpacity={isDark || isHalloweenMode ? 0.5 : 0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isHalloweenMode ? "#60c9b6" : "#06B6D4"}
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), "MMM d")}
              stroke={isDark ? "#9CA3AF" : "#6B7280"}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={formatCompactNumber}
              stroke={isDark ? "#9CA3AF" : "#6B7280"}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1A1A1F" : "#FFFFFF",
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              itemStyle={{
                color: isHalloweenMode
                  ? "#60c9b6"
                  : isDark
                    ? "#FFFFFF"
                    : "#111827",
              }}
              formatter={(value: number) => [formatAmount(value), "Net Worth"]}
              labelFormatter={(label) => format(new Date(label), "MMM d, yyyy")}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke={isHalloweenMode ? "#60c9b6" : "#06B6D4"}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorNetWorth)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
