import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Info, RotateCcw, Send, Sparkles, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { spiderSharpHanging, witchBrew } from "@/assets";
import { AIHelpModal } from "@/components/ai/AIHelpModal";
import { GlassCard } from "@/components/GlassCard";
import { TextShimmer } from "@/components/ui/TextShimmer";
import { useAuth } from "@/contexts/AuthContext";
import { useFloatingWidget } from "@/contexts/FloatingWidgetContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAIAssistant } from "@/hooks/ai/useAIAssistant";
import {
  QUERY_KEYS,
  useAccountsQuery,
  useBudgetsQuery,
  useCategoriesQuery,
  useCreateBudget,
  useCreateAccount as useCreateFinancialAccount,
  useCreateRecurringTransaction,
  useCreateTransaction,
  useUpdateAccount,
} from "@/hooks/queries/useBudgetsQuery";
import { useCreateCategory } from "@/hooks/queries/useCategories";
import {
  useCreateGoal,
  useGoalsQuery,
  useUpdateGoal,
} from "@/hooks/queries/useGoals";
import { useCreateJournal } from "@/hooks/queries/useJournalQuery";
import { useCreateLiability } from "@/hooks/queries/useLiabilities";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useAccounts } from "@/hooks/useAccounts";
import { useCurrency } from "@/hooks/useCurrency";
import { useFolders } from "@/hooks/useFolders";
import { useNotes } from "@/hooks/useNotes";
import { useSpookyAI } from "@/hooks/useSpookyAI";

interface Message {
  id: string;
  role: "user" | "ai" | "success";
  content: string;
  timestamp: Date;
}

interface PendingAction {
  intent: string;
  params: Record<string, unknown>;
  missingFields: string[];
}

export const FloatingAIChatWidget: React.FC = () => {
  const { isHalloweenMode, isDark } = useTheme();
  const { isAIChatOpen, setAIChatOpen } = useFloatingWidget();
  const location = useLocation();
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [typewriterText, setTypewriterText] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const mentionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleClearChat = () => {
    setMessages([]);
    setPendingAction(null);
  };

  const [showHelpModal, setShowHelpModal] = useState(false);

  // Mention suggestions
  const mentions = [
    { key: "@task", label: "Task", example: "Buy groceries tomorrow" },
    { key: "@note", label: "Note", example: "Quick idea about project" },
    { key: "@journal", label: "Journal", example: "Today's reflection" },
    {
      key: "@transaction",
      label: "Transaction",
      example: "Spent $50 on lunch",
    },
    { key: "@budget", label: "Budget", example: "Set $500 for groceries" },
    {
      key: "@category",
      label: "Category",
      example: "Add Entertainment category",
    },
    { key: "@goal", label: "Goal", example: "Save $10000 for vacation" },
    { key: "@liability", label: "Liability", example: "Track car loan $50000" },
    {
      key: "@transfer",
      label: "Transfer",
      example: "Move $1000 from savings to checking",
    },
    {
      key: "@finance",
      label: "Finance Account",
      example: "Create HDFC savings with $5000",
    },
    { key: "@recurring", label: "Recurring", example: "Netflix $15 monthly" },
    { key: "@account", label: "Account", example: "Save Netflix credentials" },
    {
      key: "@contribute",
      label: "Contribute to Goal",
      example: "Add $500 to Vacation goal",
    },
  ];

  // Get dynamic placeholder based on route
  const getPlaceholder = () => {
    const path = location.pathname;
    if (path.includes("/tasks")) return "@task Add project deadline...";
    if (path.includes("/notes")) return "@note Save this idea...";
    if (path.includes("/journal")) return "@journal Today I learned...";
    if (path.includes("/budget")) return "@transaction Spent $50 on...";
    if (path.includes("/goals")) return "@goal Save $5000 for...";
    if (path.includes("/accounts")) return "@account Save login for...";
    return "Type @ for commands or ask anything...";
  };

  const allPrompts = [
    "@task Buy groceries",
    "@note Quick idea",
    "@journal Today's reflection",
    "What's due tomorrow?",
    "Show recent notes",
    "Create a task",
    "Add a journal entry",
  ];

  const [examplePrompts] = useState(() => {
    const shuffled = [...allPrompts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });

  // Filter mentions based on input
  const filteredMentions = mentions.filter((m) =>
    m.key.toLowerCase().includes(mentionFilter.toLowerCase()),
  );

  // Typewriter effect for empty state with shuffling word
  useEffect(() => {
    if (messages.length === 0 && isAIChatOpen) {
      const words = [
        "Tasks",
        "Notes",
        "Journal",
        "Budget",
        "Goals",
        "Pomodoro",
      ];
      let currentWordIndex = Math.floor(Math.random() * words.length);
      let charIndex = 0;
      let isDeleting = false;
      let pauseCounter = 0;

      const typeWriter = () => {
        const currentWord = words[currentWordIndex];

        // Pause at full word
        if (
          charIndex === currentWord.length &&
          !isDeleting &&
          pauseCounter < 40
        ) {
          pauseCounter++;
          return;
        }

        if (pauseCounter >= 40) {
          isDeleting = true;
          pauseCounter = 0;
        }

        if (!isDeleting) {
          charIndex++;
          setTypewriterText(currentWord.slice(0, charIndex));
        } else {
          charIndex--;
          setTypewriterText(currentWord.slice(0, charIndex));
        }

        if (charIndex === 0 && isDeleting) {
          isDeleting = false;
          currentWordIndex = (currentWordIndex + 1) % words.length;
        }
      };

      const timer = setInterval(typeWriter, isDeleting ? 30 : 80);

      return () => clearInterval(timer);
    }
  }, [messages.length, isAIChatOpen]);

  const { processQuery, isProcessing } = useAIAssistant();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Hooks for actions
  const { createTask } = useTasks();
  const { mutate: createTransaction } = useCreateTransaction();
  const { data: budgets } = useBudgetsQuery();
  const { data: financialAccounts = [] } = useAccountsQuery();
  const { mutate: updateAccount } = useUpdateAccount();
  const { mutate: addEntry } = useCreateJournal();
  const { createNote, createNoteAsync } = useNotes();
  const { folders: noteFolders, createFolder: createNoteFolder } =
    useFolders("note");
  const { folders: accountFolders, createFolder: createAccountFolder } =
    useFolders("account");
  const { createAccount } = useAccounts();
  const { mutate: createBudget } = useCreateBudget();
  const { mutate: createRecurring } = useCreateRecurringTransaction();
  const { mutate: createCategory } = useCreateCategory();
  const { data: goals = [] } = useGoalsQuery();
  const { mutate: createGoal } = useCreateGoal();
  const { mutate: updateGoal } = useUpdateGoal();
  const { mutate: createLiability } = useCreateLiability();
  const { mutate: createFinancialAccount } = useCreateFinancialAccount();
  const { data: categories = [] } = useCategoriesQuery();
  const { currency } = useCurrency();
  const { askTheGrimoire, consultSpirits } = useSpookyAI();

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = inputValue;
    setInputValue("");

    // Handle pending action (user providing missing info)
    if (pendingAction) {
      const missingField = pendingAction.missingFields[0];
      pendingAction.params[missingField] = currentInput;
      pendingAction.missingFields.shift();

      if (pendingAction.missingFields.length > 0) {
        // Still have missing fields
        const nextField = pendingAction.missingFields[0];

        // Custom prompts for different intents
        let promptMessage = `Got it! Now, what's the ${nextField.replace("_", " ")}?`;

        if (pendingAction.intent === "create_account") {
          if (nextField === "title") {
            promptMessage =
              "What should I call this account? (e.g., 'Personal Netflix', 'Work GitHub')";
          } else if (nextField === "email") {
            promptMessage = "What's the email or username for this account?";
          } else if (nextField === "password") {
            promptMessage =
              "Please enter the password (this will be encrypted and stored securely):";
          }
        } else if (pendingAction.intent === "create_recurring") {
          if (nextField === "amount") {
            promptMessage =
              "How much is the payment? (just the number, e.g., 15.99)";
          } else if (nextField === "frequency") {
            promptMessage = "How often? (daily, weekly, monthly, or yearly)";
          } else if (nextField === "type") {
            promptMessage = "Is this an expense or income?";
          }
        } else if (pendingAction.intent === "create_budget") {
          if (nextField === "amount") {
            promptMessage = "What's the budget amount? (just the number)";
          } else if (nextField === "period") {
            promptMessage = "What's the time period? (monthly, weekly, yearly)";
          }
        } else if (pendingAction.intent === "create_category") {
          if (nextField === "type") {
            promptMessage = "Is this for expenses or income?";
          }
        } else if (pendingAction.intent === "create_financial_account") {
          if (nextField === "name") {
            promptMessage = `What would you like to name this account?\n\nExamples: "HDFC Savings", "Emergency Fund", "Chase Checking", "Investment Portfolio"`;
          } else if (nextField === "type") {
            promptMessage = `What type of account is "${pendingAction.params.name}"?\n\n💵 Cash\n🏦 Bank\n💳 Credit Card\n📱 Digital Wallet\n📈 Investment\n🐷 Savings\n\nJust reply with the type (e.g., "bank" or "savings")`;
          }
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "ai",
            content: promptMessage,
            timestamp: new Date(),
          },
        ]);
        return;
      } else {
        // All fields collected, execute action
        try {
          if (pendingAction.intent === "create_task") {
            const taskTitle = String(pendingAction.params.title || "Task");
            const taskDesc = String(pendingAction.params.description || "");
            const taskPriority =
              (pendingAction.params.priority as "low" | "medium" | "high") ||
              "medium";
            const taskDueDate = pendingAction.params.due_date
              ? String(pendingAction.params.due_date)
              : null;

            const newTask = await createTask({
              title: taskTitle,
              description: taskDesc,
              priority: taskPriority,
              due_date: taskDueDate,
              project: "Integral Assistant",
              labels: ["integral-assistant"],
            });
            toast.success(`Task created: "${taskTitle}"`);
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                role: "success",
                content: `Task created: "${taskTitle}" in Integral Assistant project!`,
                timestamp: new Date(),
              },
            ]);
          } else if (pendingAction.intent === "create_journal") {
            // Check if user said "done" or wants to add more
            const userResponse = currentInput.toLowerCase().trim();
            if (
              userResponse === "done" ||
              userResponse === "create it" ||
              userResponse === "that's all"
            ) {
              // Create journal entry
              const journalTitle = String(
                pendingAction.params.title || "Journal Entry",
              );
              const journalContent = String(pendingAction.params.content || "");

              addEntry({
                title: journalTitle,
                content: journalContent,
                entry_date: new Date().toISOString().split("T")[0],
                mood: 3,
                tags: ["integral-assistant"],
              });
              toast.success(`Journal entry created: "${journalTitle}"`);
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  role: "success",
                  content: `Journal entry created: "${journalTitle}"`,
                  timestamp: new Date(),
                },
              ]);
            } else {
              // Add more content
              const currentContent = String(pendingAction.params.content || "");
              pendingAction.params.content =
                currentContent + "\n\n" + currentInput;
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  role: "ai",
                  content: `Added! Anything else to add? (say "done" when finished)`,
                  timestamp: new Date(),
                },
              ]);
              return; // Don't clear pending action yet
            }
          } else if (pendingAction.intent === "create_note") {
            // Check if user said "done" or wants to add more
            const userResponse = currentInput.toLowerCase().trim();
            if (
              userResponse === "done" ||
              userResponse === "save it" ||
              userResponse === "that's all"
            ) {
              // Find or create "Integral Assistant" folder
              let integralFolder = noteFolders.find(
                (f) => f.name === "Integral Assistant",
              );

              if (!integralFolder) {
                integralFolder = await createNoteFolder(
                  "Integral Assistant",
                  "#8B5CF6",
                );
              }

              const noteTitle = String(
                pendingAction.params.title || "Quick Note",
              );
              const noteContent = String(pendingAction.params.content || "");

              // Create note in the folder
              await createNoteAsync({
                title: noteTitle,
                content: noteContent,
                folder_id: integralFolder.id,
                tags: ["integral-assistant"],
              });
              toast.success(
                `Note saved in Integral Assistant folder: "${noteTitle}"`,
              );
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  role: "success",
                  content: `Note saved: "${noteTitle}"`,
                  timestamp: new Date(),
                },
              ]);
            } else {
              // Add more content
              const currentContent = String(pendingAction.params.content || "");
              pendingAction.params.content =
                currentContent + "\n\n" + currentInput;
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  role: "ai",
                  content: `Added! Want to add more? (say "done" when finished)`,
                  timestamp: new Date(),
                },
              ]);
              return; // Don't clear pending action yet
            }
          } else if (pendingAction.intent === "create_account") {
            // Create account with collected info
            // Find or create "Integral Assistant" folder
            let integralFolder = accountFolders.find(
              (f) => f.name === "Integral Assistant",
            );

            if (!integralFolder) {
              integralFolder = await createAccountFolder(
                "Integral Assistant",
                "#8B5CF6",
              );
            }

            const accountPlatform = String(pendingAction.params.platform || "");
            const accountTitle = String(pendingAction.params.title || "");
            const accountEmail = String(pendingAction.params.email || "");
            const accountPassword = String(pendingAction.params.password || "");

            // Create the account
            createAccount({
              platform: accountPlatform,
              title: accountTitle,
              email_username: accountEmail,
              password: accountPassword,
              usage_type: "custom",
              reset_period: "never",
              tags: ["integral-assistant"],
              folder_id: integralFolder.id,
            });

            toast.success(`Account saved securely: "${accountTitle}"`);
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                role: "success",
                content: `Account "${accountTitle}" saved securely in Integral Assistant folder!`,
                timestamp: new Date(),
              },
            ]);
          } else if (pendingAction.intent === "create_recurring") {
            // Create recurring transaction
            const budgetId =
              budgets && budgets.length > 0 ? budgets[0].id : null;

            const recurringDesc = String(
              pendingAction.params.description || "",
            );
            const recurringAmount =
              typeof pendingAction.params.amount === "string"
                ? Number.parseFloat(pendingAction.params.amount)
                : Number(pendingAction.params.amount || 0);
            const recurringType = String(
              pendingAction.params.type || "expense",
            );
            const recurringFreq = String(
              pendingAction.params.frequency || "monthly",
            );

            createRecurring({
              description: recurringDesc,
              amount: recurringAmount,
              type:
                recurringType.toLowerCase() === "income" ? "income" : "expense",
              interval: recurringFreq.toLowerCase() as
                | "daily"
                | "weekly"
                | "monthly"
                | "yearly",
              start_date: new Date().toISOString().split("T")[0],
              next_run_date: new Date().toISOString().split("T")[0],
              active: true,
            });

            toast.success(`Recurring payment set up: "${recurringDesc}"`);
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                role: "success",
                content: `Recurring ${recurringType}: ${recurringDesc} (${currency.symbol}${recurringAmount} ${recurringFreq})`,
                timestamp: new Date(),
              },
            ]);
          } else if (pendingAction.intent === "create_budget") {
            // Create budget
            const startDate = new Date();
            const endDate = new Date(startDate);
            const budgetName = String(pendingAction.params.name || "Budget");
            const budgetAmount =
              typeof pendingAction.params.amount === "string"
                ? Number.parseFloat(pendingAction.params.amount)
                : Number(pendingAction.params.amount || 0);
            const budgetPeriod = String(
              pendingAction.params.period || "monthly",
            );
            const period = budgetPeriod.toLowerCase();

            if (period === "weekly") {
              endDate.setDate(endDate.getDate() + 7);
            } else if (period === "monthly") {
              endDate.setMonth(endDate.getMonth() + 1);
            } else if (period === "yearly") {
              endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
              endDate.setMonth(endDate.getMonth() + 1); // default to monthly
            }

            createBudget({
              name: budgetName,
              amount: budgetAmount,
              period: period as "weekly" | "monthly" | "quarterly" | "yearly",
              category: "General",
              start_date: startDate.toISOString().split("T")[0],
              end_date: endDate.toISOString().split("T")[0],
              color: "#8B5CF6",
            });

            toast.success(`Budget created: "${budgetName}"`);
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                role: "success",
                content: `Budget created: ${budgetName} (${currency.symbol}${budgetAmount} ${budgetPeriod})`,
                timestamp: new Date(),
              },
            ]);
          } else if (pendingAction.intent === "create_category") {
            // Create category
            const categoryName = String(
              pendingAction.params.name || "Category",
            );
            const categoryType = String(pendingAction.params.type || "expense");

            createCategory({
              name: categoryName,
              type:
                categoryType.toLowerCase() === "income" ? "income" : "expense",
              color: "#8B5CF6",
              icon: "tag",
              is_active: true,
              category_type: "user",
            });

            toast.success(`Category created: "${categoryName}"`);
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                role: "success",
                content: `Category created: ${categoryName} (${categoryType})`,
                timestamp: new Date(),
              },
            ]);
          } else if (pendingAction.intent === "create_financial_account") {
            // Normalize the account type input
            const userType = currentInput.toLowerCase().trim();
            let accountType:
              | "cash"
              | "bank"
              | "credit_card"
              | "digital_wallet"
              | "investment"
              | "savings" = "bank"; // default

            if (userType.includes("cash")) {
              accountType = "cash";
            } else if (
              userType.includes("bank") ||
              userType.includes("checking") ||
              userType.includes("current")
            ) {
              accountType = "bank";
            } else if (userType.includes("credit")) {
              accountType = "credit_card";
            } else if (
              userType.includes("digital") ||
              userType.includes("wallet") ||
              userType.includes("paypal") ||
              userType.includes("venmo")
            ) {
              accountType = "digital_wallet";
            } else if (userType.includes("invest")) {
              accountType = "investment";
            } else if (userType.includes("saving")) {
              accountType = "savings";
            }

            // Choose icon based on account type
            let icon = "FaWallet";
            if (accountType === "savings") {
              icon = "FaPiggyBank";
            } else if (accountType === "credit_card") {
              icon = "FaCreditCard";
            } else if (accountType === "investment") {
              icon = "FaChartLine";
            } else if (accountType === "bank") {
              icon = "FaUniversity";
            } else if (accountType === "digital_wallet") {
              icon = "FaMobileAlt";
            } else if (accountType === "cash") {
              icon = "FaMoneyBillWave";
            }

            // Create financial account
            const balanceValue =
              typeof pendingAction.params.balance === "string"
                ? Number.parseFloat(pendingAction.params.balance)
                : Number(pendingAction.params.balance);

            createFinancialAccount({
              name: String(pendingAction.params.name),
              type: accountType,
              balance: balanceValue,
              initial_balance: balanceValue,
              currency: currency.toString(),
              color: "#8B5CF6",
              icon: icon,
              include_in_total: true,
            });

            const accountTypeLabel = accountType
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l: string) => l.toUpperCase());
            toast.success(`${accountTypeLabel} account created successfully!`);
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                role: "success",
                content: `${accountTypeLabel} account "${pendingAction.params.name}" created with ${currency.symbol}${pendingAction.params.balance} balance.`,
                timestamp: new Date(),
              },
            ]);
          }
          setPendingAction(null);
          return;
        } catch (error) {
          toast.error("Failed to complete action");
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "ai",
              content: "Sorry, something went wrong.",
              timestamp: new Date(),
            },
          ]);
          setPendingAction(null);
          return;
        }
      }
    }

    const result = await processQuery(userMsg.content);

    if (!result) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          content: "I'm having trouble connecting to the spirit realm...",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    let aiResponseContent = result.confirmationMessage;

    // Execute Action
    try {
      switch (result.intent) {
        case "create_task": {
          const taskParams = result.params as {
            title?: string;
            description?: string;
            priority?: "low" | "medium" | "high";
            due_date?: string;
          };

          // Check for missing required fields
          if (!taskParams.title || taskParams.title.trim() === "") {
            setPendingAction({
              intent: "create_task",
              params: taskParams,
              missingFields: ["title"],
            });
            aiResponseContent = "What should I name this task?";
          } else if (!taskParams.due_date) {
            // Ask for due date if not provided
            setPendingAction({
              intent: "create_task",
              params: taskParams,
              missingFields: ["due_date"],
            });
            aiResponseContent = `When should "${taskParams.title}" be due? (or say "default" for 7 days from now)`;
          } else {
            // Create task with "Assistant" project
            try {
              // Default to 7 days from now if no due date
              let finalDueDate: string = taskParams.due_date;
              if (!finalDueDate) {
                const sevenDaysFromNow = new Date();
                sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
                finalDueDate = sevenDaysFromNow.toISOString().split("T")[0];
              }

              await createTask({
                title: taskParams.title,
                description: taskParams.description || "",
                priority: taskParams.priority || "medium",
                due_date: finalDueDate,
                project: "Integral Assistant",
                labels: ["integral-assistant"],
              });
              toast.success(`Task created: "${taskParams.title}"`);
              aiResponseContent = `Task created: "${taskParams.title}" due ${finalDueDate}`;
            } catch (taskError) {
              toast.error("Failed to create task");
              aiResponseContent =
                "Sorry, I couldn't create that task. Please try again.";
            }
          }
          break;
        }
        case "create_note": {
          const noteParams = result.params as { content?: string };

          // Extract first line as title
          const content = noteParams.content || "";
          const firstLine = content.split("\n")[0];
          const title =
            firstLine.length > 50
              ? firstLine.substring(0, 50) + "..."
              : firstLine;

          // Find or create "Integral Assistant" folder
          let integralFolder = noteFolders.find(
            (f) => f.name === "Integral Assistant",
          );

          if (!integralFolder) {
            integralFolder = await createNoteFolder(
              "Integral Assistant",
              "#8B5CF6",
            );
          }

          // Create note directly
          await createNoteAsync({
            title: title || "Quick Note",
            content: content,
            folder_id: integralFolder.id,
            tags: ["integral-assistant"],
          });

          toast.success(`Note saved: "${title}"`);
          aiResponseContent = `Note saved: "${title}"`;
          break;
        }
        case "create_journal": {
          const journalParams = result.params as { content?: string };

          // Extract first line as title
          const content = journalParams.content || "";
          const firstLine = content.split("\n")[0];
          const title =
            firstLine.length > 50
              ? firstLine.substring(0, 50) + "..."
              : firstLine;

          // Create journal entry directly
          addEntry({
            title: title || "Journal Entry",
            content: content,
            entry_date: new Date().toISOString().split("T")[0],
            mood: 3,
            tags: ["integral-assistant"],
          });

          toast.success(`Journal entry created: "${title}"`);
          aiResponseContent = `Journal entry created: "${title}"`;
          break;
        }
        case "create_transaction": {
          const transactionParams = result.params as {
            amount?: number;
            description?: string;
            type?: "expense" | "income";
            category?: string;
          };

          // Use the first budget or null if none exists
          const budgetId = budgets && budgets.length > 0 ? budgets[0].id : null;

          createTransaction({
            budget_id: budgetId,
            amount: transactionParams.amount || 0,
            description: transactionParams.description || "Transaction",
            category: transactionParams.category || "Other",
            transaction_date: new Date().toISOString().split("T")[0],
            type: transactionParams.type || "expense",
            tags: ["integral-assistant"],
            account_id: null,
            category_id: null,
            to_account_id: null,
            is_recurring: null,
            recurring_id: null,
            balance: null,
          });

          const typeLabel =
            transactionParams.type === "expense" ? "Expense" : "Income";
          aiResponseContent = `${typeLabel} tracked: ${transactionParams.description} (${currency.symbol}${transactionParams.amount})`;

          if (!budgetId) {
            aiResponseContent +=
              " (Note: Created without a budget - please assign one later)";
          }

          toast.success(`${typeLabel} recorded successfully!`);
          break;
        }
        case "create_recurring": {
          const recurringParams = result.params as {
            description?: string;
            amount?: string | number;
            frequency?: string;
            type?: string;
          };

          // Check if we have all required params
          if (
            recurringParams.description &&
            recurringParams.amount &&
            recurringParams.frequency &&
            recurringParams.type
          ) {
            // Create recurring directly
            const amountValue =
              typeof recurringParams.amount === "string"
                ? Number.parseFloat(recurringParams.amount)
                : recurringParams.amount;

            createRecurring({
              description: recurringParams.description,
              amount: amountValue,
              type:
                recurringParams.type.toLowerCase() === "income"
                  ? "income"
                  : "expense",
              interval: recurringParams.frequency.toLowerCase() as
                | "daily"
                | "weekly"
                | "monthly"
                | "yearly",
              start_date: new Date().toISOString().split("T")[0],
              next_run_date: new Date().toISOString().split("T")[0],
              active: true,
            });

            toast.success(
              `Recurring payment set up: "${recurringParams.description}"`,
            );
            aiResponseContent = `Recurring ${recurringParams.type}: ${recurringParams.description} (${currency.symbol}${recurringParams.amount} ${recurringParams.frequency})`;
          } else {
            // Ask for missing info
            setPendingAction({
              intent: "create_recurring",
              params: recurringParams,
              missingFields: [
                "description",
                "amount",
                "frequency",
                "type",
              ].filter(
                (f) => !recurringParams[f as keyof typeof recurringParams],
              ),
            });
            aiResponseContent =
              "I'll help you set up a recurring payment. What's the description? (e.g., Netflix subscription, Rent)";
          }
          break;
        }
        case "create_budget": {
          const budgetParams = result.params as {
            name?: string;
            amount?: string | number;
            period?: string;
          };

          // Check if we have all required params
          if (budgetParams.name && budgetParams.amount && budgetParams.period) {
            // Find or create "Integral Assistant" category
            const integralCategory = categories.find(
              (c) => c.name === "Integral Assistant" && c.type === "expense",
            );

            if (!integralCategory) {
              createCategory({
                name: "Integral Assistant",
                type: "expense",
                color: "#8B5CF6",
                icon: "sparkles",
                is_active: true,
                category_type: "user",
              });
            }

            // Create budget directly
            const startDate = new Date();
            const endDate = new Date(startDate);
            const period = budgetParams.period.toLowerCase();

            if (period === "weekly") {
              endDate.setDate(endDate.getDate() + 7);
            } else if (period === "monthly") {
              endDate.setMonth(endDate.getMonth() + 1);
            } else if (period === "yearly") {
              endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
              endDate.setMonth(endDate.getMonth() + 1);
            }

            const amountValue =
              typeof budgetParams.amount === "string"
                ? Number.parseFloat(budgetParams.amount)
                : budgetParams.amount;

            createBudget({
              name: budgetParams.name,
              amount: amountValue,
              period: period as "weekly" | "monthly" | "quarterly" | "yearly",
              category: "Integral Assistant",
              start_date: startDate.toISOString().split("T")[0],
              end_date: endDate.toISOString().split("T")[0],
              color: "#8B5CF6",
            });

            toast.success(`Budget created: "${budgetParams.name}"`);
            aiResponseContent = `Budget created: ${budgetParams.name} (${currency.symbol}${budgetParams.amount} ${budgetParams.period})`;
          } else {
            // Ask for missing info
            setPendingAction({
              intent: "create_budget",
              params: budgetParams,
              missingFields: ["name", "amount", "period"].filter(
                (f) => !budgetParams[f as keyof typeof budgetParams],
              ),
            });
            aiResponseContent =
              "I'll help you create a budget. What should I call this budget? (e.g., Groceries, Entertainment)";
          }
          break;
        }
        case "create_category": {
          const categoryParams = result.params as {
            name?: string;
            type?: string;
          };

          // Check if we have all required params
          if (categoryParams.name && categoryParams.type) {
            // Create category directly
            createCategory({
              name: categoryParams.name,
              type:
                categoryParams.type.toLowerCase() === "income"
                  ? "income"
                  : "expense",
              color: "#8B5CF6",
              icon: "tag",
              is_active: true,
              category_type: "user",
            });

            toast.success(`Category created: "${categoryParams.name}"`);
            aiResponseContent = `Category created: ${categoryParams.name} (${categoryParams.type})`;
          } else {
            // Ask for missing info
            setPendingAction({
              intent: "create_category",
              params: categoryParams,
              missingFields: ["name", "type"].filter(
                (f) => !categoryParams[f as keyof typeof categoryParams],
              ),
            });
            aiResponseContent =
              "I'll help you create a category. What's the category name? (e.g., Entertainment, Transportation)";
          }
          break;
        }
        case "create_financial_account": {
          const accountParams = result.params as {
            name?: string;
            type?: string;
            balance?: string | number;
          };

          // Check if account name is missing
          if (!accountParams.name && accountParams.balance !== undefined) {
            setPendingAction({
              intent: "create_financial_account",
              params: accountParams,
              missingFields: ["name"],
            });
            aiResponseContent = `What would you like to name this account?\n\nExamples: "HDFC Savings", "Emergency Fund", "Chase Checking", "Investment Portfolio"`;
            break;
          }

          // Check if account type is missing
          if (
            accountParams.name &&
            accountParams.balance !== undefined &&
            !accountParams.type
          ) {
            setPendingAction({
              intent: "create_financial_account",
              params: accountParams,
              missingFields: ["type"],
            });
            aiResponseContent = `What type of account is "${accountParams.name}"?\n\n💵 Cash\n🏦 Bank\n💳 Credit Card\n📱 Digital Wallet\n📈 Investment\n🐷 Savings\n\nJust reply with the type (e.g., "bank" or "savings")`;
            break;
          }

          // Check if we have all required params
          if (
            accountParams.name &&
            accountParams.balance !== undefined &&
            accountParams.type
          ) {
            // Choose icon based on account type (FontAwesome icon names)
            const accountTypeStr = String(accountParams.type);
            const accountType = accountTypeStr as
              | "cash"
              | "bank"
              | "credit_card"
              | "digital_wallet"
              | "investment"
              | "savings";
            let icon = "FaWallet";

            if (accountType === "savings") {
              icon = "FaPiggyBank";
            } else if (accountType === "credit_card") {
              icon = "FaCreditCard";
            } else if (accountType === "investment") {
              icon = "FaChartLine";
            } else if (accountType === "bank") {
              icon = "FaUniversity";
            } else if (accountType === "digital_wallet") {
              icon = "FaMobileAlt";
            } else if (accountType === "cash") {
              icon = "FaMoneyBillWave";
            }

            // Create financial account directly
            const balanceValue =
              typeof accountParams.balance === "string"
                ? Number.parseFloat(accountParams.balance)
                : Number(accountParams.balance);

            createFinancialAccount({
              name: accountParams.name,
              type: accountType,
              balance: balanceValue,
              initial_balance: balanceValue,
              currency: currency.toString(),
              color: "#8B5CF6",
              icon: icon,
              include_in_total: true,
            });

            const accountTypeLabel = accountType
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l: string) => l.toUpperCase());
            toast.success(`${accountTypeLabel} account created successfully!`);
            aiResponseContent = `${accountTypeLabel} account "${accountParams.name}" created with ${currency.symbol}${accountParams.balance} balance.`;
          } else {
            aiResponseContent =
              "Please provide account name and balance. Example: @finance create savings account with 5000 balance";
          }
          break;
        }
        case "create_goal": {
          const goalParams = result.params as {
            name?: string;
            target_amount?: string | number;
            current_amount?: string | number;
            target_date?: string;
          };

          if (goalParams.name && goalParams.target_amount) {
            const targetAmount =
              typeof goalParams.target_amount === "string"
                ? Number.parseFloat(goalParams.target_amount)
                : goalParams.target_amount;

            const currentAmount = goalParams.current_amount
              ? typeof goalParams.current_amount === "string"
                ? Number.parseFloat(goalParams.current_amount)
                : goalParams.current_amount
              : 0;

            createGoal({
              name: goalParams.name,
              target_amount: targetAmount,
              current_amount: currentAmount,
              target_date:
                goalParams.target_date ||
                new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
              color: "#10B981",
              icon: "Target",
              is_active: true,
            });

            toast.success(`Goal created: "${goalParams.name}"`);
            aiResponseContent = `Financial goal "${goalParams.name}" created with target of ${currency.symbol}${targetAmount}.`;
          } else {
            aiResponseContent =
              "Please provide goal name and target amount. Example: @goal Save 50000 for vacation";
          }
          break;
        }
        case "contribute_goal": {
          const contributeParams = result.params as {
            goal_name?: string;
            amount?: string | number;
            from_account?: string;
          };

          if (contributeParams.goal_name && contributeParams.amount) {
            const amount =
              typeof contributeParams.amount === "string"
                ? Number.parseFloat(contributeParams.amount)
                : contributeParams.amount;

            // Find goal by name (case-insensitive partial match)
            const goal = goals.find((g) =>
              g.name
                .toLowerCase()
                .includes(contributeParams.goal_name?.toLowerCase() || ""),
            );

            if (!goal) {
              aiResponseContent = `Could not find goal "${contributeParams.goal_name}". Please check the goal name.`;
              break;
            }

            // If account specified, deduct from it
            let fromAccount = null;
            if (contributeParams.from_account) {
              fromAccount = financialAccounts.find((acc) =>
                acc.name
                  .toLowerCase()
                  .includes(contributeParams.from_account?.toLowerCase() || ""),
              );

              if (!fromAccount) {
                aiResponseContent = `Could not find account "${contributeParams.from_account}". Please check the account name.`;
                break;
              }

              if (fromAccount.balance < amount) {
                aiResponseContent = `Insufficient balance in ${fromAccount.name}. Current balance: ${currency.symbol}${fromAccount.balance}`;
                break;
              }

              // Deduct from account
              updateAccount({
                id: fromAccount.id,
                updates: { balance: fromAccount.balance - amount },
              });
            }

            const newCurrentAmount = goal.current_amount + amount;

            // Update goal with new current amount
            updateGoal({
              id: goal.id,
              updates: { current_amount: newCurrentAmount },
            });

            const progress = Math.round(
              (newCurrentAmount / goal.target_amount) * 100,
            );
            toast.success(`Added ${currency.symbol}${amount} to ${goal.name}!`);

            if (fromAccount) {
              aiResponseContent = `Added ${currency.symbol}${amount} to "${goal.name}" from ${fromAccount.name}.\n\nGoal Progress: ${currency.symbol}${goal.current_amount} → ${currency.symbol}${newCurrentAmount} (${progress}% of ${currency.symbol}${goal.target_amount})\n\n${fromAccount.name}: ${currency.symbol}${fromAccount.balance} → ${currency.symbol}${fromAccount.balance - amount}`;
            } else {
              aiResponseContent = `Added ${currency.symbol}${amount} to "${goal.name}".\n\nProgress: ${currency.symbol}${goal.current_amount} → ${currency.symbol}${newCurrentAmount} (${progress}% of ${currency.symbol}${goal.target_amount})`;
            }
          } else {
            aiResponseContent =
              "Please specify goal name and amount. Example: @goal add 5000 to vacation from savings";
          }
          break;
        }
        case "create_liability": {
          const liabilityParams = result.params as {
            name?: string;
            type?: string;
            amount?: string | number;
            interest_rate?: string | number;
            minimum_payment?: string | number;
            due_date?: string;
          };

          if (liabilityParams.name && liabilityParams.amount) {
            const amount =
              typeof liabilityParams.amount === "string"
                ? Number.parseFloat(liabilityParams.amount)
                : liabilityParams.amount;

            const interestRate = liabilityParams.interest_rate
              ? typeof liabilityParams.interest_rate === "string"
                ? Number.parseFloat(liabilityParams.interest_rate)
                : liabilityParams.interest_rate
              : 0;

            const minimumPayment = liabilityParams.minimum_payment
              ? typeof liabilityParams.minimum_payment === "string"
                ? Number.parseFloat(liabilityParams.minimum_payment)
                : liabilityParams.minimum_payment
              : 0;

            const liabilityType = (liabilityParams.type || "other") as
              | "loan"
              | "credit_card"
              | "mortgage"
              | "other";

            createLiability({
              name: liabilityParams.name,
              type: liabilityType,
              amount: amount,
              interest_rate: interestRate,
              minimum_payment: minimumPayment,
              due_date:
                liabilityParams.due_date ||
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
              currency: currency.code,
              color: "#EF4444",
              icon: "CreditCard",
              is_active: true,
            });

            toast.success(`Liability tracked: "${liabilityParams.name}"`);
            aiResponseContent = `Liability "${liabilityParams.name}" tracked (${liabilityType}, ${currency.symbol}${amount}).`;
          } else {
            aiResponseContent =
              "Please provide liability name and amount. Example: @liability Car loan 500000 at 8% interest";
          }
          break;
        }
        case "transfer_funds": {
          const transferParams = result.params as {
            amount?: string | number;
            from_account?: string;
            to_account?: string;
          };

          // Check if we have all required params
          if (
            transferParams.amount &&
            transferParams.from_account &&
            transferParams.to_account
          ) {
            const amount =
              typeof transferParams.amount === "string"
                ? Number.parseFloat(transferParams.amount)
                : transferParams.amount;

            // Helper function to normalize account names for matching
            const normalizeAccountName = (name: string) => {
              return name
                .toLowerCase()
                .replace(/\b(account|acct|acc)\b/g, "") // Remove common words
                .trim()
                .replace(/\s+/g, " "); // Normalize spaces
            };

            // Find accounts by normalized name matching
            const fromAccountQuery = normalizeAccountName(
              transferParams.from_account,
            );
            const toAccountQuery = normalizeAccountName(
              transferParams.to_account,
            );

            const fromAccount = financialAccounts.find((acc) => {
              const normalizedAccName = normalizeAccountName(acc.name);
              return (
                normalizedAccName.includes(fromAccountQuery) ||
                fromAccountQuery.includes(normalizedAccName)
              );
            });

            const toAccount = financialAccounts.find((acc) => {
              const normalizedAccName = normalizeAccountName(acc.name);
              return (
                normalizedAccName.includes(toAccountQuery) ||
                toAccountQuery.includes(normalizedAccName)
              );
            });

            if (!fromAccount) {
              aiResponseContent = `Could not find account "${transferParams.from_account}". Please check the account name.`;
              break;
            }

            if (!toAccount) {
              aiResponseContent = `Could not find account "${transferParams.to_account}". Please check the account name.`;
              break;
            }

            if (fromAccount.balance < amount) {
              aiResponseContent = `Insufficient balance in ${fromAccount.name}. Current balance: ${currency.symbol}${fromAccount.balance}`;
              break;
            }

            // Update both accounts and wait for completion
            try {
              await Promise.all([
                // Update source account (subtract)
                new Promise((resolve, reject) => {
                  updateAccount(
                    {
                      id: fromAccount.id,
                      updates: { balance: fromAccount.balance - amount },
                    },
                    {
                      onSuccess: resolve,
                      onError: reject,
                    },
                  );
                }),
                // Update destination account (add)
                new Promise((resolve, reject) => {
                  updateAccount(
                    {
                      id: toAccount.id,
                      updates: { balance: toAccount.balance + amount },
                    },
                    {
                      onSuccess: resolve,
                      onError: reject,
                    },
                  );
                }),
              ]);

              // Invalidate accounts query to force UI refresh
              queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.ACCOUNTS, user?.id],
              });

              // Create transfer transaction for record
              createTransaction({
                budget_id: null,
                amount: amount,
                description: `Transfer: ${fromAccount.name} → ${toAccount.name}`,
                category: "Transfer",
                transaction_date: new Date().toISOString().split("T")[0],
                type: "transfer",
                tags: ["integral-assistant", "transfer"],
                account_id: fromAccount.id,
                category_id: null,
                to_account_id: toAccount.id,
                is_recurring: null,
                recurring_id: null,
                balance: null,
              });

              toast.success(`Transfer completed!`);
              aiResponseContent = `Transferred ${currency.symbol}${amount} from ${fromAccount.name} to ${toAccount.name}.\n\n${fromAccount.name}: ${currency.symbol}${fromAccount.balance} → ${currency.symbol}${fromAccount.balance - amount}\n${toAccount.name}: ${currency.symbol}${toAccount.balance} → ${currency.symbol}${toAccount.balance + amount}`;
            } catch (error) {
              console.error("Transfer failed:", error);
              toast.error("Transfer failed. Please try again.");
              aiResponseContent = `Transfer failed. Please try again.`;
              break;
            }
          } else {
            aiResponseContent =
              "To transfer funds, please specify: amount, from account, and to account.\n\nExample: @transfer 1000 from savings to checking";
          }
          break;
        }
        case "create_account": {
          // For security, we DON'T send passwords to LLM
          // AI helps collect platform, title, email - then we prompt for password
          setPendingAction({
            intent: "create_account",
            params: {},
            missingFields: ["platform", "title", "email", "password"],
          });
          aiResponseContent =
            "I'll help you save account credentials securely. What platform is this for? (e.g., Netflix, GitHub, Google)";
          break;
        }
        case "search_knowledge": {
          const answer = await askTheGrimoire(
            result.originalQuery,
            isHalloweenMode,
          );
          if (answer) aiResponseContent = answer;
          break;
        }
        case "general_chat": {
          // For general chat, use consultSpirits to generate a response
          const chatResponse = await consultSpirits(
            result.originalQuery,
            "general",
            isHalloweenMode ? "spooky" : "normal",
          );
          if (chatResponse) aiResponseContent = chatResponse;
          break;
        }
      }
    } catch (error) {
      console.error("Action execution failed", error);
      aiResponseContent = "I tried to do that, but something went wrong.";
    }

    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: aiResponseContent,
        timestamp: new Date(),
      },
    ]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;

      // Sync overlay scroll with textarea scroll
      if (overlayRef.current) {
        overlayRef.current.scrollTop = inputRef.current.scrollTop;
      }
    }

    // Check if user is typing @ mention
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowMentions(true);
      setMentionFilter("");
      setSelectedMentionIndex(0);
    } else if (
      lastAtIndex !== -1 &&
      value.slice(lastAtIndex).indexOf(" ") === -1
    ) {
      setShowMentions(true);
      setMentionFilter(value.slice(lastAtIndex + 1));
      setSelectedMentionIndex(0);
    } else {
      setShowMentions(false);
    }
  };

  // Sync scroll when textarea is scrolled
  const handleTextareaScroll = () => {
    if (inputRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = inputRef.current.scrollTop;
    }
  };

  const handleMentionSelect = (mention: string) => {
    const lastAtIndex = inputValue.lastIndexOf("@");
    const newValue = inputValue.slice(0, lastAtIndex) + mention + " ";
    setInputValue(newValue);
    setShowMentions(false);
    setSelectedMentionIndex(0);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions && filteredMentions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedMentionIndex((prev) => {
          const newIndex = prev < filteredMentions.length - 1 ? prev + 1 : 0;
          // Scroll to the selected item
          setTimeout(() => {
            mentionRefs.current[newIndex]?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }, 0);
          return newIndex;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedMentionIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : filteredMentions.length - 1;
          // Scroll to the selected item
          setTimeout(() => {
            mentionRefs.current[newIndex]?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }, 0);
          return newIndex;
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleMentionSelect(filteredMentions[selectedMentionIndex].key);
        return;
      } else if (e.key === "Escape") {
        setShowMentions(false);
        return;
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      // Reset height after sending
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
    }
  };

  // Render the button always
  const renderButton = () => (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => {
        setAIChatOpen(!isAIChatOpen);
        if (!isAIChatOpen) {
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }}
      style={{ bottom: "max(12px, env(safe-area-inset-bottom, 12px))" }}
      className={`fixed right-3 md:right-4 z-50 w-12 h-12 md:w-14 md:h-14 rounded-xl transition-all shadow-lg flex items-center justify-center cursor-pointer ${
        isHalloweenMode
          ? "bg-[#60c9b6]/25 border border-[#60c9b6]/40 hover:bg-[#60c9b6]/35 hover:shadow-[0_0_20px_rgba(96,201,182,0.3)]"
          : isDark
            ? "bg-purple-400/30 border border-purple-400/50 hover:bg-purple-400/40 hover:shadow-[0_0_15px_rgba(192,132,252,0.4)]"
            : "bg-white border border-slate-200 hover:bg-slate-50 shadow-md"
      } active:scale-95`}
      title="Integral Assistant"
    >
      <div className="relative w-full h-full flex items-center justify-center p-2">
        <img
          src="/assistant.svg"
          alt="AI Assistant"
          className="w-full h-full object-contain drop-shadow-md"
          style={
            isHalloweenMode
              ? {
                  filter:
                    "brightness(0) saturate(100%) invert(73%) sepia(18%) saturate(1234%) hue-rotate(120deg) brightness(95%) contrast(87%)",
                }
              : isDark
                ? {
                    filter:
                      "brightness(0) saturate(100%) invert(80%) sepia(26%) saturate(1540%) hue-rotate(213deg) brightness(102%) contrast(98%)",
                  }
                : {}
          }
        />
        <Sparkles
          className={`w-4 h-4 md:w-5 md:h-5 absolute -top-1 -right-1 ${
            isHalloweenMode
              ? "text-[#60c9b6] drop-shadow-[0_0_4px_rgba(96,201,182,0.8)]"
              : isDark
                ? "text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]"
                : "text-black opacity-30"
          }`}
        />
      </div>
    </motion.button>
  );

  return (
    <>
      {renderButton()}
      <AnimatePresence>
        {isAIChatOpen && (
          <>
            {/* Backdrop blur - mobile only */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-9998 md:hidden"
              onClick={() => setAIChatOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              style={{
                bottom: "max(8px, env(safe-area-inset-bottom, 8px))",
              }}
              className={`fixed inset-x-2 top-12 md:inset-auto md:bottom-20 md:right-4 z-9999 w-auto md:w-[350px] h-[calc(100dvh-(--spacing(12))-max(8px,env(safe-area-inset-bottom,8px))-8px)] md:h-[455px] rounded-xl ${
                isHalloweenMode
                  ? "md:border-2 md:border-[#60c9b6]/50 md:shadow-[0_0_30px_rgba(96,201,182,0.2)]"
                  : ""
              }`}
            >
              <GlassCard
                className={`overflow-hidden transition-colors flex flex-col relative h-full ${
                  isHalloweenMode
                    ? "shadow-[0_0_30px_rgba(96,201,182,0.2)] bg-[#0f1419]/95"
                    : isDark
                      ? "shadow-2xl bg-[#1e1e2e] backdrop-blur-xl border border-purple-400/30"
                      : "shadow-2xl bg-white/95 backdrop-blur-xl border border-slate-200"
                }`}
              >
                {/* Halloween Decorations */}
                {isHalloweenMode && (
                  <>
                    <div className="absolute bottom-2 left-2 pointer-events-none z-0 opacity-20">
                      <img
                        src={witchBrew}
                        alt=""
                        className="w-16 h-16 object-contain filter-[brightness(0)_saturate(100%)_invert(73%)_sepia(18%)_saturate(1234%)_hue-rotate(120deg)_brightness(95%)_contrast(87%)]"
                      />
                    </div>
                    <div className="absolute top-2 right-2 pointer-events-none z-0 opacity-20">
                      <img
                        src={spiderSharpHanging}
                        alt=""
                        className="w-14 h-14 filter-[brightness(0)_saturate(100%)_invert(73%)_sepia(18%)_saturate(1234%)_hue-rotate(120deg)_brightness(95%)_contrast(87%)]"
                      />
                    </div>
                  </>
                )}

                {/* Header */}
                <div
                  className={`flex items-center justify-between p-3 border-b ${
                    isHalloweenMode
                      ? "border-[#60c9b6]/20"
                      : isDark
                        ? "border-purple-400/20"
                        : "border-slate-100"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center relative">
                      <img
                        src="/assistant.svg"
                        alt="AI Logo"
                        className={`w-full h-full object-contain ${
                          isHalloweenMode
                            ? "filter-[brightness(0)_saturate(100%)_invert(73%)_sepia(18%)_saturate(1234%)_hue-rotate(120deg)_brightness(95%)_contrast(87%)]"
                            : isDark
                              ? "filter-[brightness(0)_saturate(100%)_invert(76%)_sepia(20%)_saturate(1200%)_hue-rotate(213deg)_brightness(100%)_contrast(96%)]"
                              : ""
                        }`}
                      />
                      <Sparkles
                        className={`w-3 h-3 absolute -top-0.5 -right-0.5 ${
                          isHalloweenMode
                            ? "text-[#60c9b6] drop-shadow-[0_0_3px_rgba(96,201,182,0.8)]"
                            : isDark
                              ? "text-purple-400 drop-shadow-[0_0_3px_rgba(192,132,252,0.6)]"
                              : "text-black opacity-30"
                        }`}
                        style={
                          isHalloweenMode ? { filter: "brightness(1.5)" } : {}
                        }
                      />
                    </div>
                    <div>
                      <h3
                        className={`font-semibold text-sm ${
                          isHalloweenMode
                            ? "text-[#60c9b6]"
                            : isDark
                              ? "filter-[brightness(0)_saturate(100%)_invert(76%)_sepia(20%)_saturate(1200%)_hue-rotate(213deg)_brightness(100%)_contrast(96%)]"
                              : "text-slate-800"
                        }`}
                      >
                        Integral Assistant
                      </h3>
                      <div className="flex items-center space-x-1">
                        <p className="text-[10px] text-muted-foreground">
                          Powered by
                        </p>
                        <img src="/ai.svg" alt="AI" className="w-3 h-3" />
                        <p className="text-[10px] text-muted-foreground">
                          Gemini
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setShowHelpModal(true)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isHalloweenMode
                          ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                          : isDark
                            ? "text-purple-400 hover:bg-purple-400/10"
                            : "text-slate-500 hover:bg-slate-100"
                      }`}
                      title="Help & Commands"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleClearChat}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isHalloweenMode
                          ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                          : isDark
                            ? "text-purple-400 hover:bg-purple-400/10"
                            : "text-slate-500 hover:bg-slate-100"
                      }`}
                      title="Clear chat"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setAIChatOpen(false)}
                      className={`p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer`}
                      title="Close chat"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-0">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full space-y-6 relative z-10 px-4">
                      <p
                        className={`text-sm font-medium min-h-[20px] text-center ${
                          isHalloweenMode
                            ? "text-[#60c9b6]"
                            : isDark
                              ? "text-gray-300"
                              : "text-slate-700"
                        }`}
                      >
                        {isHalloweenMode
                          ? "Ask the spirits about your "
                          : "Ask me about your "}
                        {typewriterText}!
                        <span className="animate-pulse">|</span>
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 w-full">
                        {examplePrompts.map((prompt, index) => (
                          <button
                            key={index}
                            onClick={() => setInputValue(prompt)}
                            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                              isHalloweenMode
                                ? "bg-[#60c9b6]/10 text-[#60c9b6]/80 hover:bg-[#60c9b6]/20 border border-[#60c9b6]/20"
                                : isDark
                                  ? "bg-purple-400/10 text-purple-300 hover:bg-purple-400/20 border border-purple-400/20"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                            }`}
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm relative z-10 max-h-[300px] overflow-y-auto custom-scrollbar ${
                          msg.role === "user"
                            ? isHalloweenMode
                              ? "bg-[#60c9b6]/20 text-[#60c9b6] rounded-tr-none border border-[#60c9b6]/30"
                              : isDark
                                ? "bg-purple-400/30 text-purple-200 rounded-tr-none border border-purple-400/40"
                                : "bg-purple-600 text-white rounded-tr-none"
                            : msg.role === "success"
                              ? "bg-green-500/20 text-green-400 rounded-tl-none border border-green-500/40"
                              : isHalloweenMode
                                ? "bg-[#1a1f26] text-[#60c9b6]/90 rounded-tl-none border border-[#60c9b6]/20"
                                : isDark
                                  ? "bg-[#1e1e28] text-gray-200 rounded-tl-none border border-purple-400/20"
                                  : "bg-slate-100 text-slate-800 rounded-tl-none"
                        }`}
                      >
                        {msg.role === "ai" || msg.role === "success" ? (
                          <div
                            className={`prose prose-sm max-w-none ${
                              isHalloweenMode
                                ? "prose-invert [&_strong]:text-[#7ee0ca] [&_code]:text-[#60c9b6] [&_code]:bg-[#60c9b6]/10"
                                : isDark
                                  ? "prose-invert"
                                  : ""
                            } [&>*:first-child]:mt-0 [&>*:last-child]:mb-0`}
                          >
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => (
                                  <p className="mb-2 last:mb-0 mt-0">
                                    {children}
                                  </p>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold">
                                    {children}
                                  </strong>
                                ),
                                code: ({ children }) => (
                                  <code className="px-1.5 py-0.5 rounded text-xs font-mono">
                                    {children}
                                  </code>
                                ),
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm relative z-10 ${
                          isHalloweenMode
                            ? "bg-[#1a1f26] text-[#60c9b6]/90 rounded-tl-none border border-[#60c9b6]/20"
                            : isDark
                              ? "bg-[#1e1e28] text-gray-200 rounded-tl-none border border-purple-400/20"
                              : "bg-slate-100 text-slate-800 rounded-tl-none"
                        }`}
                      >
                        <TextShimmer
                          as="span"
                          className={`font-medium ${
                            isHalloweenMode
                              ? "[--base-color:#60c9b6] [--base-gradient-color:#60c9b6]"
                              : isDark
                                ? "[--base-color:#c084fc] [--base-gradient-color:#c084fc]"
                                : "[--base-color:#9333ea] [--base-gradient-color:#9333ea]"
                          }`}
                          duration={1.5}
                        >
                          {isHalloweenMode
                            ? "The spirits are thinking..."
                            : "Thinking..."}
                        </TextShimmer>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div
                  className={`p-3 border-t relative z-10 ${
                    isHalloweenMode
                      ? "border-[#60c9b6]/20"
                      : isDark
                        ? "border-purple-400/20"
                        : "border-slate-100"
                  }`}
                >
                  <div className="relative flex flex-col">
                    {/* Mentions Dropdown */}
                    {showMentions && filteredMentions.length > 0 && (
                      <div
                        className={`absolute bottom-full left-0 right-0 mb-2 rounded-lg border max-h-48 overflow-y-auto custom-scrollbar ${
                          isHalloweenMode
                            ? "bg-[#1a1f26] border-[#60c9b6]/30 shadow-[0_0_20px_rgba(96,201,182,0.2)]"
                            : isDark
                              ? "bg-[#1e1e28] border-purple-400/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                              : "bg-white border-slate-200 shadow-lg"
                        }`}
                      >
                        {filteredMentions.map((mention, index) => (
                          <button
                            key={mention.key}
                            ref={(el) => {
                              mentionRefs.current[index] = el;
                            }}
                            onClick={() => handleMentionSelect(mention.key)}
                            className={`w-full px-3 py-2 text-left text-xs transition-all ${
                              index === selectedMentionIndex
                                ? isHalloweenMode
                                  ? "bg-[#60c9b6]/20 text-[#60c9b6] border-l-2 border-[#60c9b6]"
                                  : isDark
                                    ? "bg-purple-400/20 text-purple-200 border-l-2 border-purple-400"
                                    : "bg-purple-100 text-purple-700 border-l-2 border-purple-600"
                                : isHalloweenMode
                                  ? "hover:bg-[#60c9b6]/10 text-[#60c9b6]"
                                  : isDark
                                    ? "hover:bg-purple-400/10 text-gray-200"
                                    : "hover:bg-slate-100 text-slate-700"
                            }`}
                          >
                            <div className="font-medium">{mention.key}</div>
                            <div
                              className={`text-[10px] ${
                                isHalloweenMode
                                  ? "text-[#60c9b6]/60"
                                  : isDark
                                    ? "text-gray-400"
                                    : "text-slate-500"
                              }`}
                            >
                              {mention.example}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="relative flex items-center">
                      {/* Styled text overlay for bold @ mentions */}
                      <div
                        ref={overlayRef}
                        className={`absolute left-4 right-10 top-2.5 pointer-events-none text-sm whitespace-pre-wrap wrap-break-word overflow-y-auto custom-scrollbar ${
                          isHalloweenMode
                            ? "text-[#60c9b6]"
                            : isDark
                              ? "text-gray-200"
                              : "text-slate-800"
                        }`}
                        aria-hidden="true"
                        style={{
                          minHeight: "20px",
                          maxHeight: "115px",
                          paddingBottom: "10px",
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                        }}
                      >
                        {inputValue.split(/(@\w+)/g).map((part, i) =>
                          part.startsWith("@") ? (
                            <span key={i}>
                              @
                              <span className="font-semibold">
                                {part.slice(1)}
                              </span>
                            </span>
                          ) : (
                            <span key={i}>{part}</span>
                          ),
                        )}
                        {/* Add invisible character to maintain height for trailing newlines */}
                        {inputValue.endsWith("\n") && (
                          <span className="opacity-0">.</span>
                        )}
                      </div>
                      <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onScroll={handleTextareaScroll}
                        placeholder={getPlaceholder()}
                        rows={1}
                        className={`w-full pl-4 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all resize-none overflow-y-auto custom-scrollbar ${
                          isHalloweenMode
                            ? "bg-[#1a1f26] placeholder:text-[#60c9b6]/40 focus:ring-2 focus:ring-[#60c9b6]/50 border border-[#60c9b6]/20 selection:bg-[#60c9b6]/30"
                            : isDark
                              ? "bg-[#1e1e28] placeholder:text-gray-500 focus:ring-2 focus:ring-purple-400/50 border border-purple-400/20 selection:bg-purple-400/30"
                              : "bg-slate-50 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/20 selection:bg-purple-500/30"
                        } ${
                          inputValue
                            ? "text-transparent caret-current selection:text-transparent"
                            : isHalloweenMode
                              ? "text-[#60c9b6]"
                              : isDark
                                ? "text-gray-200"
                                : "text-slate-800"
                        }`}
                        style={{
                          caretColor: isHalloweenMode
                            ? "#60c9b6"
                            : isDark
                              ? "#e5e7eb"
                              : "#1e293b",
                          minHeight: "42px",
                          maxHeight: "120px",
                        }}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isProcessing}
                        className={`absolute right-2 p-1.5 rounded-lg transition-colors ${
                          !inputValue.trim() || isProcessing
                            ? "text-gray-400 cursor-not-allowed"
                            : isHalloweenMode
                              ? "text-[#60c9b6] hover:bg-[#60c9b6]/20"
                              : isDark
                                ? "text-purple-400 hover:bg-purple-400/20"
                                : "text-purple-600 hover:bg-purple-100"
                        }`}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AIHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </>
  );
};
