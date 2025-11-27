import React, { createContext, useEffect, useState } from "react";
import { CURRENCIES, Currency } from "@/constants/currencies";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number, decimals?: number) => string;
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
        return JSON.parse(saved);
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

  const formatAmount = (amount: number, decimals: number = 0) => {
    return `${currency.symbol}${amount.toFixed(decimals)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
};
