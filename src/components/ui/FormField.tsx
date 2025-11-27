import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  children,
  error,
  required,
}) => {
  const { isDark } = useTheme();

  return (
    <div>
      <label
        className={`block text-sm mb-2 ${isDark ? "text-[#B4B4B8]" : "text-gray-700"}`}
      >
        {label}
        {required && <span className="text-[#EF4444] ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-[#EF4444] text-xs mt-1">{error}</p>}
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input: React.FC<InputProps> = ({
  error,
  className = "",
  ...props
}) => {
  const { isDark } = useTheme();

  return (
    <input
      className={`w-full border rounded-lg px-3 py-2 focus:border-[#3B82F6] focus:outline-hidden transition-colors ${
        error
          ? "border-[#EF4444]"
          : `${isDark ? "border-[rgba(255,255,255,0.1)]" : "border-gray-300"}`
      } ${isDark ? "bg-[rgba(40,40,45,0.6)] text-white placeholder-[#71717A]" : "bg-white text-gray-900 placeholder-gray-500"} ${className}`}
      {...props}
    />
  );
};

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  error,
  className = "",
  ...props
}) => {
  const { isDark } = useTheme();

  return (
    <textarea
      className={`w-full border rounded-lg px-3 py-2 focus:border-[#3B82F6] focus:outline-hidden transition-colors resize-none ${
        error
          ? "border-[#EF4444]"
          : `${isDark ? "border-[rgba(255,255,255,0.1)]" : "border-gray-300"}`
      } ${isDark ? "bg-[rgba(40,40,45,0.6)] text-white placeholder-[#71717A]" : "bg-white text-gray-900 placeholder-gray-500"} ${className}`}
      {...props}
    />
  );
};
