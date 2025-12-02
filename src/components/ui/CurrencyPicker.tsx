import { Check, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CURRENCIES,
  Currency,
  POPULAR_CURRENCIES,
} from "@/constants/currencies";
import { useTheme } from "@/contexts/ThemeContext";

interface CurrencyPickerProps {
  value: string; // Currency code
  onChange: (currency: Currency) => void;
  label?: string;
  placeholder?: string;
}

export const CurrencyPicker: React.FC<CurrencyPickerProps> = ({
  value,
  onChange,
  label = "Currency",
  placeholder = "Select currency",
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedCurrency = CURRENCIES.find((c) => c.code === value);

  // Filter currencies by search term
  const filteredCurrencies = useMemo(() => {
    if (!searchTerm) return CURRENCIES;

    const term = searchTerm.toLowerCase();
    return CURRENCIES.filter(
      (currency) =>
        currency.code.toLowerCase().includes(term) ||
        currency.name.toLowerCase().includes(term) ||
        currency.symbol.includes(searchTerm),
    );
  }, [searchTerm]);

  // Popular currencies for quick access
  const popularCurrencies = CURRENCIES.filter((c) =>
    POPULAR_CURRENCIES.includes(c.code),
  );

  const handleSelect = (currency: Currency) => {
    onChange(currency);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative">
      {/* Label */}
      {label && (
        <label
          className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
            isHalloweenMode
              ? "text-[#60c9b6]"
              : isDark
                ? "text-white"
                : "text-gray-700"
          }`}
        >
          {label}
        </label>
      )}

      {/* Selected Currency Display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 md:px-4 md:py-2 rounded-lg border text-sm md:text-base focus:outline-none cursor-pointer flex items-center justify-between ${
          isHalloweenMode
            ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] hover:border-[#60c9b6]"
            : isDark
              ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white hover:border-[rgba(255,255,255,0.2)]"
              : "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
        }`}
      >
        {selectedCurrency ? (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">
              {selectedCurrency.symbol}
            </span>
            <span className="font-medium">{selectedCurrency.code}</span>
            <span className="text-xs opacity-70">
              - {selectedCurrency.name}
            </span>
          </div>
        ) : (
          <span className="opacity-50">{placeholder}</span>
        )}
        <X className="w-4 h-4" />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div
            className={`absolute top-full left-0 right-0 mt-2 rounded-lg border shadow-xl z-50 max-h-96 flex flex-col ${
              isDark
                ? "bg-[#1a1a1f] border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            {/* Search */}
            <div className="p-3 border-b border-gray-700/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search currencies..."
                  className={`w-full pl-10 pr-3 py-2 rounded-lg text-sm focus:outline-none ${
                    isDark
                      ? "bg-white/5 border border-white/10 text-white placeholder-gray-500"
                      : "bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400"
                  }`}
                  autoFocus
                />
              </div>
            </div>

            {/* Popular Currencies */}
            {!searchTerm && (
              <div className="p-3 border-b border-gray-700/50">
                <div className="text-xs font-medium text-gray-400 mb-2">
                  Popular
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {popularCurrencies.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => handleSelect(currency)}
                      className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                        value === currency.code
                          ? isHalloweenMode
                            ? "bg-[#60c9b6] text-black"
                            : "bg-[#8B5CF6] text-white"
                          : isDark
                            ? "bg-white/5 text-white hover:bg-white/10"
                            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      {currency.code}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Currency List */}
            <div className="overflow-y-auto flex-1">
              {filteredCurrencies.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No currencies found
                </div>
              ) : (
                filteredCurrencies.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => handleSelect(currency)}
                    className={`w-full px-4 py-2.5 flex items-center justify-between text-left transition-colors border-b ${
                      isDark
                        ? "border-gray-700/30 hover:bg-white/5"
                        : "border-gray-200 hover:bg-gray-50"
                    } ${
                      value === currency.code
                        ? isDark
                          ? "bg-white/10"
                          : "bg-purple-50"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl font-semibold min-w-[40px]">
                        {currency.symbol}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {currency.code}
                          </span>
                          {currency.symbolNative &&
                            currency.symbolNative !== currency.symbol && (
                              <span className="text-sm opacity-60">
                                ({currency.symbolNative})
                              </span>
                            )}
                        </div>
                        <div
                          className={`text-xs truncate ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {currency.name}
                        </div>
                      </div>
                    </div>
                    {value === currency.code && (
                      <Check className="w-4 h-4 text-[#10B981]" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
