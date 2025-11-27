import { Check, Copy } from "lucide-react";
import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface CodeBlockWithCopyProps {
  code: string;
  language?: string;
}

export const CodeBlockWithCopy: React.FC<CodeBlockWithCopyProps> = ({
  code,
  language = "Code",
}) => {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="relative group">
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className={`absolute top-2 right-2 p-2 rounded-md transition-all duration-200 ${
          isDark
            ? "bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] text-[#B4B4B8]"
            : "bg-white/80 hover:bg-white text-gray-600"
        } ${copied ? "scale-95" : "scale-100"}`}
        style={{
          opacity: copied ? 1 : 0.7,
          boxShadow: isDark
            ? "0 2px 8px rgba(0,0,0,0.3)"
            : "0 2px 8px rgba(0,0,0,0.1)",
        }}
        title={copied ? "Copied!" : "Copy code"}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>

      {/* Language Label */}
      <div
        className={`absolute top-2 left-3 text-xs font-medium uppercase tracking-wide ${
          isDark ? "text-[#7d8590]" : "text-[#656d76]"
        }`}
      >
        {language}
      </div>

      {/* Code Content */}
      <pre
        className={`lexical-code ${isDark ? "dark" : ""}`}
        style={{
          margin: 0,
          borderRadius: "6px",
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
};
