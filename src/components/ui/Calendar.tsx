import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/contexts/ThemeContext";

interface CalendarProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;

  mode?: "single" | "range";
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  label,
  minDate,
  maxDate,
  disabled = false,
  mode = "single",
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const { isDark, isHalloweenMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value) : new Date(),
  );
  const [selectingStart, setSelectingStart] = useState(true);
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    showAbove: false,
  });

  useEffect(() => {
    if (mode === "range" && !startDate && !endDate && onStartDateChange) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;
      onStartDateChange(dateString);
    }
  }, [mode, startDate, endDate, onStartDateChange]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();

      const dropdownHeight = window.innerWidth < 768 ? 300 : 400;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      setDropdownPosition({
        top: showAbove ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        showAbove,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();

        const dropdownHeight = window.innerWidth < 768 ? 300 : 400;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const showAbove =
          spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

        setDropdownPosition({
          top: showAbove ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
          left: rect.left,
          width: rect.width,
          showAbove,
        });
      }
    };

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDisplayRange = () => {
    if (!startDate && !endDate) return "";
    if (startDate && !endDate) return formatDisplayDate(startDate);
    if (!startDate && endDate) return formatDisplayDate(endDate);
    return `${formatDisplayDate(startDate!)} - ${formatDisplayDate(endDate!)}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isDateDisabled = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    if (minDate && dateString < minDate) return true;
    if (maxDate && dateString > maxDate) return true;
    return false;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (mode === "range") {
      return isStartDate(date) || isEndDate(date);
    }
    if (!value) return false;
    const selectedDate = new Date(value);
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isStartDate = (date: Date) => {
    if (!startDate) return false;
    const start = new Date(startDate);
    return (
      date.getDate() === start.getDate() &&
      date.getMonth() === start.getMonth() &&
      date.getFullYear() === start.getFullYear()
    );
  };

  const isEndDate = (date: Date) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    return (
      date.getDate() === end.getDate() &&
      date.getMonth() === end.getMonth() &&
      date.getFullYear() === end.getFullYear()
    );
  };

  const isInRange = (date: Date) => {
    if (mode === "range") {
      if (!startDate || !endDate) return false;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dateTime = date.getTime();
      const startTime = start.getTime();
      const endTime = end.getTime();
      return dateTime > startTime && dateTime < endTime;
    }

    if (!value || (!minDate && !maxDate)) return false;

    const selectedDate = new Date(value);
    let rangeStart: Date;
    if (minDate) {
      rangeStart = new Date(minDate);
    } else {
      return false;
    }

    let rangeEnd = selectedDate;
    if (rangeEnd < rangeStart) {
      const temp = rangeStart;
      rangeStart = rangeEnd;
      rangeEnd = temp;
    }

    const dateTime = date.getTime();
    const startTime = rangeStart.getTime();
    const endTime = rangeEnd.getTime();

    return dateTime > startTime && dateTime < endTime;
  };

  const handleDateSelect = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    if (mode === "range" && onStartDateChange && onEndDateChange) {
      if (selectingStart) {
        onStartDateChange(dateString);
        setSelectingStart(false);
      } else {
        onEndDateChange(dateString);
        setSelectingStart(true);
        setIsOpen(false);
      }
    } else {
      onChange(dateString);
      setIsOpen(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    handleDateSelect(today);
  };

  const handleClear = () => {
    if (mode === "range" && onStartDateChange && onEndDateChange) {
      onStartDateChange("");
      onEndDateChange("");
      setSelectingStart(true);
    } else {
      onChange("");
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } =
      getDaysInMonth(currentMonth);
    const days = [];

    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      days.push(
        <div
          key={`prev-${day}`}
          className={`p-2 text-center text-sm ${
            isDark ? "text-[#6B7280]" : "text-gray-400"
          }`}
        >
          {day}
        </div>,
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const disabled = isDateDisabled(date);
      const today = isToday(date);
      const selected = isSelected(date);

      const inRange = isInRange(date);

      days.push(
        <motion.button
          key={day}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && handleDateSelect(date)}
          className={`p-1 md:p-1.5 text-[11px] md:text-[13px] rounded-lg transition-colors ${
            selected
              ? isHalloweenMode
                ? "bg-[rgba(96,201,182,0.2)] text-[#60c9b6] font-medium border border-[rgba(96,201,182,0.5)]"
                : "bg-[rgba(139,92,246,0.2)] text-[#8B5CF6] font-medium"
              : today
                ? isHalloweenMode
                  ? "bg-[rgba(96,201,182,0.15)] text-[#60c9b6] font-medium"
                  : "bg-[rgba(16,185,129,0.2)] text-[#10B981] font-medium"
                : inRange
                  ? isHalloweenMode
                    ? "bg-[rgba(96,201,182,0.08)] text-[#60c9b6]"
                    : "bg-[rgba(139,92,246,0.08)] text-[#8B5CF6]"
                  : disabled
                    ? isDark
                      ? "text-[#6B7280] cursor-not-allowed"
                      : "text-gray-300 cursor-not-allowed"
                    : isHalloweenMode
                      ? "text-[#60c9b6] hover:bg-[rgba(96,201,182,0.1)]"
                      : isDark
                        ? "text-white hover:bg-[rgba(255,255,255,0.1)]"
                        : "text-gray-900 hover:bg-gray-100"
          } ${!disabled && "cursor-pointer"}`}
          whileHover={!disabled && !selected ? { scale: 1.05 } : {}}
          whileTap={!disabled && !selected ? { scale: 0.95 } : {}}
        >
          {day}
        </motion.button>,
      );
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push(
        <div
          key={`next-${day}`}
          className={`p-1.5 md:p-2 text-center text-xs md:text-sm ${
            isDark ? "text-[#6B7280]" : "text-gray-400"
          }`}
        >
          {day}
        </div>,
      );
    }

    return days;
  };

  const renderDropdown = () => {
    if (!isOpen) return null;

    return createPortal(
      <AnimatePresence>
        <motion.div
          ref={pickerRef}
          data-datepicker-dropdown="true"
          initial={{ opacity: 0, y: dropdownPosition.showAbove ? 10 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: dropdownPosition.showAbove ? 10 : -10 }}
          transition={{ duration: 0.15 }}
          className={`fixed z-[9999] p-2 md:p-3 rounded-xl shadow-2xl border ${
            isHalloweenMode
              ? "bg-[#1A1A1A] border-[rgba(96,201,182,0.3)] shadow-[0_0_15px_rgba(96,201,182,0.2)]"
              : isDark
                ? "bg-[#1A1A1A] border-[rgba(255,255,255,0.1)]"
                : "bg-white border-gray-200"
          }`}
          style={
            {
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              minWidth: "260px",
              maxWidth: "calc(100vw - 24px)",
            } as React.CSSProperties
          }
        >
          {/* Selection indicator for range mode */}
          {mode === "range" && (
            <div
              className={`text-xs mb-2 md:mb-3 ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-[#B4B4B8]"
                    : "text-gray-600"
              }`}
            >
              {selectingStart ? "Select start date" : "Select end date"}
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className={`p-1 md:p-1.5 rounded-lg transition-colors cursor-pointer ${
                isHalloweenMode
                  ? "text-[#60c9b6] hover:bg-[rgba(96,201,182,0.15)]"
                  : isDark
                    ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.1)]"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft className="w-3.5 md:w-4 h-3.5 md:h-4" />
            </button>

            <div
              className={`text-[11px] md:text-[13px] font-semibold ${
                isHalloweenMode
                  ? "text-[#60c9b6]"
                  : isDark
                    ? "text-white"
                    : "text-gray-900"
              }`}
            >
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className={`p-1 md:p-1.5 rounded-lg transition-colors cursor-pointer ${
                isHalloweenMode
                  ? "text-[#60c9b6] hover:bg-[rgba(96,201,182,0.15)]"
                  : isDark
                    ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.1)]"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <ChevronRight className="w-3.5 md:w-4 h-3.5 md:h-4" />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-1 md:mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className={`text-[10px] md:text-xs text-center font-medium ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-[#B4B4B8]"
                      : "text-gray-600"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-2 md:mb-3">
            {renderCalendar()}
          </div>

          {/* Footer */}
          <div
            className={`flex items-center justify-between pt-1.5 md:pt-2 border-t ${
              isDark ? "border-[rgba(255,255,255,0.1)]" : "border-gray-200"
            }`}
          >
            <button
              type="button"
              onClick={handleClear}
              className={`text-[9px] md:text-[11px] px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-lg transition-colors cursor-pointer ${
                isHalloweenMode
                  ? "text-[#60c9b6] hover:bg-[rgba(96,201,182,0.15)]"
                  : isDark
                    ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.1)]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className={`text-[9px] md:text-[11px] px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-lg transition-colors cursor-pointer ${
                isHalloweenMode
                  ? "bg-[rgba(96,201,182,0.2)] border border-[rgba(96,201,182,0.3)] text-[#60c9b6] hover:bg-[rgba(96,201,182,0.3)]"
                  : "bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.3)]"
              }`}
            >
              Today
            </button>
          </div>
        </motion.div>
      </AnimatePresence>,
      document.body,
    );
  };

  return (
    <div className="relative">
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

      {/* Input */}
      <div className="relative">
        <CalendarIcon
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
            isHalloweenMode
              ? "text-[#60c9b6]"
              : isDark
                ? "text-[#B4B4B8]"
                : "text-gray-500"
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={
            mode === "range"
              ? formatDisplayRange()
              : value
                ? formatDisplayDate(value)
                : ""
          }
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full pl-10 pr-10 py-2 rounded-lg text-sm focus:outline-hidden transition-colors cursor-pointer ${
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          } ${
            isHalloweenMode
              ? "bg-[rgba(96,201,182,0.1)] border border-[rgba(96,201,182,0.3)] text-[#60c9b6] placeholder-[rgba(96,201,182,0.5)] focus:border-[#60c9b6] focus:ring-1 focus:ring-[#60c9b6]"
              : isDark
                ? "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder-[#B4B4B8] focus:border-[rgba(139,92,246,0.5)]"
                : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8B5CF6]"
          }`}
        />
        {((mode === "range" && (startDate || endDate)) ||
          (mode === "single" && value)) &&
          !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors cursor-pointer ${
                isHalloweenMode
                  ? "text-[#60c9b6] hover:bg-[rgba(96,201,182,0.15)]"
                  : isDark
                    ? "text-[#B4B4B8] hover:text-white hover:bg-[rgba(255,255,255,0.1)]"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <X className="w-3 h-3" />
            </button>
          )}
      </div>

      {/* Calendar Dropdown (Portal) */}
      {renderDropdown()}
    </div>
  );
};
