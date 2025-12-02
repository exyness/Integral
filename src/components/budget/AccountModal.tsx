import { useEffect, useState } from "react";
import { toast } from "sonner";
import { batGlide, treeSceneryCurly } from "@/assets";
import { Checkbox } from "@/components/ui/Checkbox";
import { Dropdown } from "@/components/ui/Dropdown";
import { IconPicker } from "@/components/ui/IconPicker";
import { Modal } from "@/components/ui/Modal";
import { useTheme } from "@/contexts/ThemeContext";
import { useCurrency } from "@/hooks/useCurrency";
import { Account, AccountType } from "@/types/budget";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account?: Account;
  onSubmit: (
    data: Omit<Account, "id" | "user_id" | "created_at" | "updated_at">,
  ) => Promise<void>;
  isLoading?: boolean;
}

const ACCOUNT_TYPES: AccountType[] = [
  "cash",
  "bank",
  "credit_card",
  "digital_wallet",
  "investment",
  "savings",
];

const COLORS = [
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onSubmit,
  isLoading = false,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const { currency } = useCurrency();

  const [formData, setFormData] = useState({
    name: "",
    type: "bank" as AccountType,
    icon: "Wallet",
    color: COLORS[0],
    balance: 0,
    currency: currency.code,
    initial_balance: 0,
    include_in_total: true,
    notes: "",
  });

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        type: account.type,
        icon: account.icon,
        color: account.color,
        balance: account.balance,
        currency: account.currency,
        initial_balance: account.initial_balance,
        include_in_total: account.include_in_total,
        notes: account.notes || "",
      });
    } else {
      setFormData({
        name: "",
        type: "bank",
        icon: "Wallet",
        color: COLORS[0],
        balance: 0,
        currency: currency.code,
        initial_balance: 0,
        include_in_total: true,
        notes: "",
      });
    }
  }, [account, currency.code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter an account name");
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form on successful creation
      if (!account) {
        setFormData({
          name: "",
          type: "bank",
          icon: "Wallet",
          color: COLORS[0],
          balance: 0,
          currency: currency.code,
          initial_balance: 0,
          include_in_total: true,
          notes: "",
        });
      }
      onClose();
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={account ? "Edit Account" : "Create Account"}
      size="lg"
      hideDecorations
    >
      {isHalloweenMode && (
        <>
          <div className="absolute -bottom-0 -right-0 pointer-events-none z-0">
            <img
              src={treeSceneryCurly}
              alt=""
              className="w-32 h-32 md:w-48 md:h-48 opacity-20"
            />
          </div>
          <div className="absolute -top-4 -right-4 pointer-events-none z-0">
            <img
              src={batGlide}
              alt=""
              className="w-24 h-24 md:w-32 md:h-32 opacity-20"
            />
          </div>
        </>
      )}
      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
        {/* Account Name and Type in a row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label
              className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-700"
              }`}
            >
              Account Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-3 py-2 md:px-4 md:py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
                isHalloweenMode
                  ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:ring-2 focus:ring-[#60c9b6]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white focus:ring-2 focus:ring-[#8B5CF6]"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#8B5CF6]"
              }`}
              placeholder="e.g., XYZ Saving Account"
              required
              autoFocus
            />
          </div>

          {/* Account Type */}
          <div>
            <Dropdown
              title="Account Type"
              value={formData.type}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  type: value as AccountType,
                })
              }
              options={ACCOUNT_TYPES.map((type) => ({
                value: type,
                label:
                  type.charAt(0).toUpperCase() +
                  type.slice(1).replace("_", " "),
              }))}
              placeholder="Select account type"
            />
          </div>
        </div>

        {/* Initial Balance and Icon Picker side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label
              className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-700"
              }`}
            >
              Initial Balance<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.initial_balance}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  initial_balance: parseFloat(e.target.value) || 0,
                  balance: account
                    ? formData.balance
                    : parseFloat(e.target.value) || 0,
                })
              }
              className={`w-full px-3 py-2 md:px-4 md:py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
                isHalloweenMode
                  ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:ring-2 focus:ring-[#60c9b6]"
                  : isDark
                    ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white focus:ring-2 focus:ring-[#8B5CF6]"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#8B5CF6]"
              }`}
              required
            />
          </div>

          {/* Icon Picker */}
          <div>
            <IconPicker
              value={formData.icon}
              onChange={(iconName) =>
                setFormData({ ...formData, icon: iconName })
              }
              label="Account Icon"
              placeholder="Select an icon"
            />
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label
            className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-white"
                  : "text-gray-700"
            }`}
          >
            Account Color
          </label>
          <div className="grid grid-cols-4 gap-1.5 md:flex md:gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-full h-12 md:aspect-auto md:w-10 md:h-10 rounded-lg transition-transform cursor-pointer ${
                  formData.color === color
                    ? "ring-2 ring-white md:scale-110"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Include in Total */}
        <div>
          <Checkbox
            id="include_in_total"
            checked={formData.include_in_total}
            onChange={(checked) =>
              setFormData({ ...formData, include_in_total: checked })
            }
            label="Include in total balance"
          />
        </div>

        {/* Notes */}
        <div>
          <label
            className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-white"
                  : "text-gray-700"
            }`}
          >
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className={`w-full px-3 py-2 md:px-4 md:py-2 rounded-lg border text-sm md:text-base focus:outline-none ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border-[#60c9b6]/30 text-[#60c9b6] placeholder-[#60c9b6]/50 focus:border-[#60c9b6] focus:ring-2 focus:ring-[#60c9b6]"
                : isDark
                  ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white focus:ring-2 focus:ring-[#8B5CF6]"
                  : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#8B5CF6]"
            }`}
            rows={2}
            placeholder="Add any notes about this account"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 md:gap-3 pt-2 md:pt-4">
          <button
            type="submit"
            disabled={isLoading || !formData.name.trim()}
            className={`flex-1 px-3 py-1.5 md:px-6 md:py-3 rounded-lg text-xs md:text-base font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isHalloweenMode
                ? "bg-[#60c9b6] text-black hover:bg-[#4db8a5]"
                : "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
            }`}
          >
            {isLoading
              ? "Saving..."
              : account
                ? "Update Account"
                : "Create Account"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`flex-1 px-3 py-1.5 md:px-6 md:py-3 rounded-lg text-xs md:text-base font-medium transition-colors cursor-pointer ${
              isHalloweenMode
                ? "bg-[#60c9b6]/10 text-[#60c9b6] hover:bg-[#60c9b6]/20"
                : isDark
                  ? "bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.15)]"
                  : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            }`}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};
