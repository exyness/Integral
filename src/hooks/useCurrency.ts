import { useContext } from "react";
import { CurrencyContext } from "@/contexts/CurrencyContext";

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }

  // Create backward-compatible wrapper
  const formatAmount = (amount: number, decimalsOrOptions?: number | any) => {
    // If it's a number, use the simple format
    if (
      typeof decimalsOrOptions === "number" ||
      decimalsOrOptions === undefined
    ) {
      return context.formatAmountSimple(amount, decimalsOrOptions);
    }
    // Otherwise use the advanced format
    return context.formatAmount(amount, decimalsOrOptions);
  };

  return {
    ...context,
    formatAmount,
  };
};
