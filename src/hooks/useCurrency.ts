import { useContext } from "react";
import {
  CurrencyContext,
  type FormatOptions,
} from "@/contexts/CurrencyContext";

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }

  const formatAmount = (
    amount: number,
    decimalsOrOptions?: number | FormatOptions,
  ) => {
    // If it's a number, use the simple format
    if (
      typeof decimalsOrOptions === "number" ||
      decimalsOrOptions === undefined
    ) {
      return context.formatAmountSimple(
        amount,
        decimalsOrOptions as number | undefined,
      );
    }
    // Otherwise use the advanced format
    return context.formatAmount(amount, decimalsOrOptions as FormatOptions);
  };

  return {
    ...context,
    formatAmount,
  };
};
