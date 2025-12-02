import React, { createContext, useEffect, useState } from "react";
import {
  CURRENCIES,
  Currency,
  getCurrencyByCode,
} from "@/constants/currencies";

// Enhanced formatting options
export interface FormatOptions {
  decimals?: number; // Override default decimals
  useNativeSymbol?: boolean; // Use native symbol (e.g., रु. instead of Rs.)
  includeCode?: boolean; // Show currency code after amount
  locale?: string; // Override locale for number formatting
  compact?: boolean; // Use compact notation (1K, 1M)
  useGrouping?: boolean; // Use thousand separators
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number, options?: FormatOptions) => string;
  formatAmountSimple: (amount: number, decimals?: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

export { CurrencyContext };

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem("currency");
    if (saved) {
      try {
        const savedCurrency = JSON.parse(saved);
        // Try to find the full currency object by code
        const fullCurrency = getCurrencyByCode(savedCurrency.code);
        return fullCurrency || savedCurrency;
      } catch {
        return CURRENCIES.find((c) => c.code === "USD") || CURRENCIES[0];
      }
    }
    return CURRENCIES.find((c) => c.code === "USD") || CURRENCIES[0];
  });

  useEffect(() => {
    localStorage.setItem("currency", JSON.stringify(currency));
  }, [currency]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  // Simple format function (backward compatible)
  const formatAmountSimple = (amount: number, decimals?: number) => {
    // Default to 0 if amount is undefined or null
    const safeAmount = amount ?? 0;

    // If decimals is not provided, use 0 for integers, otherwise use currency default
    const decimalPlaces =
      decimals ?? (safeAmount % 1 === 0 ? 0 : currency.decimalDigits);
    const formattedNumber = safeAmount.toFixed(decimalPlaces);

    // Add thousand separators
    const parts = formattedNumber.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const numberWithSeparators = parts.join(".");

    // Apply symbol position
    if (currency.symbolPosition === "before") {
      return currency.spaceBetween
        ? `${currency.symbol} ${numberWithSeparators}`
        : `${currency.symbol}${numberWithSeparators}`;
    } else {
      return currency.spaceBetween
        ? `${numberWithSeparators} ${currency.symbol}`
        : `${numberWithSeparators}${currency.symbol}`;
    }
  };

  // Enhanced format function with all options
  const formatAmount = (amount: number, options: FormatOptions = {}) => {
    // Default to 0 if amount is undefined or null
    const safeAmount = amount ?? 0;

    const {
      decimals,
      useNativeSymbol = false,
      includeCode = false,
      locale,
      compact = false,
      useGrouping = true,
    } = options;

    const decimalPlaces =
      decimals ?? (safeAmount % 1 === 0 ? 0 : currency.decimalDigits);
    const targetLocale = locale || currency.locale;
    const symbol =
      useNativeSymbol && currency.symbolNative
        ? currency.symbolNative
        : currency.symbol;

    let formattedNumber: string;

    // Compact notation (1K, 1M, 1B)
    if (compact) {
      const absAmount = Math.abs(safeAmount);
      if (absAmount >= 1_000_000_000) {
        formattedNumber = `${(safeAmount / 1_000_000_000).toFixed(1)}B`;
      } else if (absAmount >= 1_000_000) {
        formattedNumber = `${(safeAmount / 1_000_000).toFixed(1)}M`;
      } else if (absAmount >= 1_000) {
        formattedNumber = `${(safeAmount / 1_000).toFixed(1)}K`;
      } else {
        formattedNumber = safeAmount.toFixed(decimalPlaces);
      }
    } else {
      // Use Intl.NumberFormat for locale-specific formatting
      try {
        formattedNumber = new Intl.NumberFormat(targetLocale, {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
          useGrouping: useGrouping,
        }).format(safeAmount);
      } catch {
        // Fallback if locale is not supported
        formattedNumber = safeAmount.toFixed(decimalPlaces);
        if (useGrouping) {
          const parts = formattedNumber.split(".");
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          formattedNumber = parts.join(".");
        }
      }
    }

    // Build final string with symbol position
    let result: string;
    if (currency.symbolPosition === "before") {
      result = currency.spaceBetween
        ? `${symbol} ${formattedNumber}`
        : `${symbol}${formattedNumber}`;
    } else {
      result = currency.spaceBetween
        ? `${formattedNumber} ${symbol}`
        : `${formattedNumber}${symbol}`;
    }

    // Add currency code if requested
    if (includeCode) {
      result += ` ${currency.code}`;
    }

    return result;
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, formatAmount, formatAmountSimple }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
