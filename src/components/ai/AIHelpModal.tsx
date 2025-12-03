import {
  Calendar,
  FolderOpen,
  Lock,
  MessageSquare,
  Sparkles,
  Tag,
} from "lucide-react";
import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useTheme } from "@/contexts/ThemeContext";

interface AIHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIHelpModal: React.FC<AIHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isHalloweenMode, isDark } = useTheme();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Integral AI Assistant"
      size="lg"
    >
      <div className="space-y-3 md:space-y-6">
        {/* Productivity Commands */}
        <div>
          <h3
            className={`text-sm md:text-lg font-semibold mb-2 md:mb-3 flex items-center gap-2 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-purple-300"
                  : "text-gray-800"
            }`}
          >
            <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
            Productivity
          </h3>
          <div className="grid gap-1.5 md:gap-2">
            {[
              {
                command: "@task",
                description: "Create tasks with smart due dates",
                example: "@task Buy groceries tomorrow",
              },
              {
                command: "@note",
                description: "Save notes with auto-organization",
                example: "@note Remember to check emails",
              },
              {
                command: "@journal",
                description: "Add journal entries with follow-ups",
                example: "@journal Today was productive",
              },
            ].map((item) => (
              <div
                key={item.command}
                className={`p-2 md:p-2.5 rounded-lg ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/5 border border-[#60c9b6]/20"
                    : isDark
                      ? "bg-purple-500/5 border border-purple-500/20"
                      : "bg-gray-50 border border-gray-200"
                }`}
              >
                <code
                  className={`text-xs md:text-sm font-mono font-semibold ${
                    isHalloweenMode
                      ? "text-[#60c9b6]"
                      : isDark
                        ? "text-purple-400"
                        : "text-purple-600"
                  }`}
                >
                  {item.command}
                </code>
                <span
                  className={`text-xs md:text-sm ml-1.5 md:ml-2 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  — {item.description}
                </span>
                <p
                  className={`text-[10px] md:text-xs mt-0.5 md:mt-1 italic ${
                    isDark ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  "{item.example}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Finance Commands */}
        <div>
          <h3
            className={`text-sm md:text-lg font-semibold mb-2 md:mb-3 flex items-center gap-2 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-purple-300"
                  : "text-gray-800"
            }`}
          >
            <Tag className="w-4 h-4 md:w-5 md:h-5" />
            Finance
          </h3>
          <div className="grid gap-1.5 md:gap-2">
            {[
              {
                command: "@transaction",
                description: "Track expenses or income",
                example: "@transaction Spent 50 on groceries",
              },
              {
                command: "@finance",
                description: "Create bank/savings/credit accounts",
                example: "@finance create savings account with 10000",
              },
              {
                command: "@budget",
                description: "Set spending budgets",
                example: "@budget Set 500 for groceries monthly",
              },
              {
                command: "@recurring",
                description: "Set up recurring payments",
                example: "@recurring Netflix 15 monthly",
              },
              {
                command: "@category",
                description: "Add expense/income categories",
                example: "@category Add Entertainment expense",
              },
              {
                command: "@transfer",
                description: "Transfer funds between accounts",
                example: "@transfer 1000 from savings to checking",
              },
              {
                command: "@goal",
                description: "Create or contribute to savings goals",
                example:
                  "@goal Save 50000 for vacation / @goal add 5000 to vacation",
              },
              {
                command: "@liability / @debt",
                description: "Track loans and debts",
                example: "@liability Car loan 500000 at 8% interest",
              },
            ].map((item) => (
              <div
                key={item.command}
                className={`p-2 md:p-2.5 rounded-lg ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/5 border border-[#60c9b6]/20"
                    : isDark
                      ? "bg-purple-500/5 border border-purple-500/20"
                      : "bg-gray-50 border border-gray-200"
                }`}
              >
                <code
                  className={`text-xs md:text-sm font-mono font-semibold ${
                    isHalloweenMode
                      ? "text-[#60c9b6]"
                      : isDark
                        ? "text-purple-400"
                        : "text-purple-600"
                  }`}
                >
                  {item.command}
                </code>
                <span
                  className={`text-xs md:text-sm ml-1.5 md:ml-2 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  — {item.description}
                </span>
                <p
                  className={`text-[10px] md:text-xs mt-0.5 md:mt-1 italic ${
                    isDark ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  "{item.example}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Security Commands */}
        <div>
          <h3
            className={`text-sm md:text-lg font-semibold mb-2 md:mb-3 flex items-center gap-2 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-purple-300"
                  : "text-gray-800"
            }`}
          >
            <Lock className="w-4 h-4 md:w-5 md:h-5" />
            Account Manager
          </h3>
          <div className="grid gap-1.5 md:gap-2">
            {[
              {
                command: "@account / @credential",
                description: "Save login credentials securely",
                example: "@account Save my Netflix login",
              },
            ].map((item) => (
              <div
                key={item.command}
                className={`p-2 md:p-2.5 rounded-lg ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/5 border border-[#60c9b6]/20"
                    : isDark
                      ? "bg-purple-500/5 border border-purple-500/20"
                      : "bg-gray-50 border border-gray-200"
                }`}
              >
                <code
                  className={`text-xs md:text-sm font-mono font-semibold ${
                    isHalloweenMode
                      ? "text-[#60c9b6]"
                      : isDark
                        ? "text-purple-400"
                        : "text-purple-600"
                  }`}
                >
                  {item.command}
                </code>
                <span
                  className={`text-xs md:text-sm ml-1.5 md:ml-2 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  — {item.description}
                </span>
                <p
                  className={`text-[10px] md:text-xs mt-0.5 md:mt-1 italic ${
                    isDark ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  "{item.example}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Natural Language */}
        <div>
          <h3
            className={`text-sm md:text-lg font-semibold mb-2 md:mb-3 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-purple-300"
                  : "text-gray-800"
            }`}
          >
            Natural Language
          </h3>
          <p
            className={`text-xs md:text-sm mb-2 md:mb-3 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Skip the commands! Just talk naturally:
          </p>
          <div className="grid gap-1 md:gap-1.5">
            {[
              "Remind me to call mom tomorrow",
              "I spent 25 on lunch today",
              "Transfer 1000 from savings to checking",
              "Add 5000 to vacation goal",
              "Track car loan 500000 at 8% interest",
              "Set 500 budget for groceries monthly",
            ].map((example) => (
              <div
                key={example}
                className={`p-1.5 md:p-2 rounded text-[10px] md:text-xs ${
                  isHalloweenMode
                    ? "bg-[#60c9b6]/5 text-[#60c9b6]/80"
                    : isDark
                      ? "bg-purple-500/5 text-gray-300"
                      : "bg-gray-50 text-gray-700"
                }`}
              >
                "{example}"
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <h3
            className={`text-sm md:text-lg font-semibold mb-2 md:mb-3 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-purple-300"
                  : "text-gray-800"
            }`}
          >
            Features
          </h3>
          <ul className="space-y-2 md:space-y-3">
            <li className="flex items-start gap-2 md:gap-3">
              <MessageSquare
                className={`w-4 h-4 md:w-5 md:h-5 mt-0.5 shrink-0 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-purple-400"
                      : "text-purple-600"
                }`}
              />
              <span
                className={`text-xs md:text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Conversational follow-ups for detailed entries
              </span>
            </li>
            <li className="flex items-start gap-2 md:gap-3">
              <FolderOpen
                className={`w-4 h-4 md:w-5 md:h-5 mt-0.5 shrink-0 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-purple-400"
                      : "text-purple-600"
                }`}
              />
              <span
                className={`text-xs md:text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Auto-organizes into "Integral Assistant" folders
              </span>
            </li>
            <li className="flex items-start gap-2 md:gap-3">
              <Tag
                className={`w-4 h-4 md:w-5 md:h-5 mt-0.5 shrink-0 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-purple-400"
                      : "text-purple-600"
                }`}
              />
              <span
                className={`text-xs md:text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Tags everything with "integral-assistant"
              </span>
            </li>
            <li className="flex items-start gap-2 md:gap-3">
              <Lock
                className={`w-4 h-4 md:w-5 md:h-5 mt-0.5 shrink-0 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-purple-400"
                      : "text-purple-600"
                }`}
              />
              <span
                className={`text-xs md:text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Secure password handling (never sent to AI)
              </span>
            </li>
            <li className="flex items-start gap-2 md:gap-3">
              <Calendar
                className={`w-4 h-4 md:w-5 md:h-5 mt-0.5 shrink-0 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-purple-400"
                      : "text-purple-600"
                }`}
              />
              <span
                className={`text-xs md:text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Smart date parsing (tomorrow, next week, etc.)
              </span>
            </li>
            <li className="flex items-start gap-2 md:gap-3">
              <Sparkles
                className={`w-4 h-4 md:w-5 md:h-5 mt-0.5 shrink-0 ${
                  isHalloweenMode
                    ? "text-[#60c9b6]"
                    : isDark
                      ? "text-purple-400"
                      : "text-purple-600"
                }`}
              />
              <span
                className={`text-xs md:text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Default 7-day due dates for tasks
              </span>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
