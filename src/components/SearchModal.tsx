import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Command,
  CornerDownLeft,
  FileText,
  List,
  Search,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { spiderSharpHanging, witchBrew } from "@/assets";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/Button";
import { ExpandableScreenContent } from "@/components/ui/expandable-screen";
import { PortalTooltip } from "@/components/ui/PortalTooltip";
import { Progress } from "@/components/ui/Progress";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { TextShimmer } from "@/components/ui/TextShimmer";
import { useFloatingWidget } from "@/contexts/FloatingWidgetContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSpookyAI } from "@/hooks/useSpookyAI";
import { supabase } from "@/integrations/supabase/client";

export const SearchModal: React.FC = () => {
  const { isSearchModalOpen, setSearchModalOpen } = useFloatingWidget();
  const { isDark, isHalloweenMode } = useTheme();
  const { askTheGrimoire, addToGrimoire, isGhostWriting, completion } =
    useSpookyAI();

  const handleImportJournal = async () => {
    try {
      setIsImportingJournal(true);
      stopImportRef.current = false;
      toast.info(
        isHalloweenMode
          ? "Summoning journal entries from the past..."
          : "Syncing journal entries...",
      );

      const { data: entries, error } = await supabase
        .from("daily_entries")
        .select("*");

      if (error) throw error;
      if (!entries?.length) {
        toast.info(
          isHalloweenMode
            ? "No journal entries found to resurrect."
            : "No journal entries found.",
        );
        return;
      }

      // Get already indexed journal entries
      const { data: indexed } = await supabase
        .from("search_index")
        .select("metadata")
        .eq("metadata->>type", "journal");

      const indexedIds = new Set(
        indexed?.map(
          (i: { metadata: { original_id: string } }) => i.metadata.original_id,
        ) || [],
      );

      // Only index new entries
      let added = 0;
      const newEntries = entries.filter((e) => !indexedIds.has(e.id));
      setImportProgress({
        current: 0,
        total: newEntries.length,
        item: "journal entries",
      });

      for (let i = 0; i < newEntries.length; i++) {
        if (stopImportRef.current) break;
        const entry = newEntries[i];
        setImportProgress({
          current: i + 1,
          total: newEntries.length,
          item: entry.title,
        });
        await addToGrimoire(`${entry.title}\n\n${entry.content}`, {
          type: "journal",
          title: entry.title,
          date: entry.entry_date,
          original_id: entry.id,
        });
        added++;
      }

      setImportProgress({ current: 0, total: 0, item: "" });

      if (!stopImportRef.current) {
        toast.success(
          isHalloweenMode
            ? added > 0
              ? `Resurrected ${added} new journal entries!`
              : "All entries already in the Grimoire."
            : added > 0
              ? `Indexed ${added} new journal entries!`
              : "All entries already indexed.",
        );
      }
    } catch (error) {
      console.error("Journal import error:", error);
      toast.error(
        isHalloweenMode
          ? "Failed to summon journal entries."
          : "Failed to sync journal entries.",
      );
    } finally {
      setIsImportingJournal(false);
    }
  };

  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isImportingJournal, setIsImportingJournal] = useState(false);
  const [isImportingNotes, setIsImportingNotes] = useState(false);
  const [isImportingTasks, setIsImportingTasks] = useState(false);
  const [isImportingFinance, setIsImportingFinance] = useState(false);
  const [importProgress, setImportProgress] = useState({
    current: 0,
    total: 0,
    item: "",
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const stopImportRef = useRef(false);

  const handleStopImport = () => {
    stopImportRef.current = true;
    toast.info(
      isHalloweenMode ? "Summoning ritual interrupted..." : "Syncing stopped.",
    );
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchModalOpen(false);
      }
    };

    if (isSearchModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100);
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchModalOpen, setSearchModalOpen]);

  const handleImportNotes = async () => {
    try {
      setIsImportingNotes(true);
      stopImportRef.current = false;
      toast.info(
        isHalloweenMode
          ? "Summoning notes from the void..."
          : "Syncing notes...",
      );

      const { data: notes, error } = await supabase.from("notes").select("*");

      if (error) throw error;
      if (!notes?.length) {
        toast.info(
          isHalloweenMode ? "No notes found to resurrect." : "No notes found.",
        );
        return;
      }

      // Get already indexed notes
      const { data: indexed } = await supabase
        .from("search_index")
        .select("metadata")
        .eq("metadata->>type", "note");

      const indexedIds = new Set(
        indexed?.map(
          (i: { metadata: { original_id: string } }) => i.metadata.original_id,
        ) || [],
      );

      // Only index new notes
      let added = 0;
      const newNotes = notes.filter((n) => !indexedIds.has(n.id));
      setImportProgress({ current: 0, total: newNotes.length, item: "notes" });

      for (let i = 0; i < newNotes.length; i++) {
        if (stopImportRef.current) break;
        const note = newNotes[i];
        setImportProgress({
          current: i + 1,
          total: newNotes.length,
          item: note.title,
        });
        await addToGrimoire(`${note.title}\n\n${note.content}`, {
          type: "note",
          category: note.category,
          tags: note.tags,
          original_id: note.id,
        });
        added++;
      }

      setImportProgress({ current: 0, total: 0, item: "" });

      if (!stopImportRef.current) {
        toast.success(
          isHalloweenMode
            ? added > 0
              ? `Resurrected ${added} new notes!`
              : "All notes already in the Grimoire."
            : added > 0
              ? `Indexed ${added} new notes!`
              : "All notes already indexed.",
        );
      }
    } catch (error) {
      console.error("Notes import error:", error);
      toast.error(
        isHalloweenMode ? "Failed to summon notes." : "Failed to sync notes.",
      );
    } finally {
      setIsImportingNotes(false);
    }
  };

  const handleImportTasks = async () => {
    try {
      setIsImportingTasks(true);
      stopImportRef.current = false;
      toast.info(
        isHalloweenMode
          ? "Summoning tasks from the shadows..."
          : "Syncing tasks...",
      );

      const { data: tasks, error } = await supabase.from("tasks").select("*");

      if (error) throw error;
      if (!tasks?.length) {
        toast.info(
          isHalloweenMode ? "No tasks found to resurrect." : "No tasks found.",
        );
        return;
      }

      // Get already indexed tasks
      const { data: indexed } = await supabase
        .from("search_index")
        .select("metadata")
        .eq("metadata->>type", "task");

      const indexedIds = new Set(
        indexed?.map(
          (i: { metadata: { original_id: string } }) => i.metadata.original_id,
        ) || [],
      );

      // Only index new tasks
      let added = 0;
      const newTasks = tasks.filter((t) => !indexedIds.has(t.id));
      setImportProgress({ current: 0, total: newTasks.length, item: "tasks" });

      for (let i = 0; i < newTasks.length; i++) {
        if (stopImportRef.current) break;
        const task = newTasks[i];
        setImportProgress({
          current: i + 1,
          total: newTasks.length,
          item: task.title,
        });
        const content = task.description
          ? `${task.title}\n\n${task.description}`
          : task.title;
        await addToGrimoire(content, {
          type: "task",
          priority: task.priority,
          status: task.status,
          due_date: task.due_date,
          completed: task.completed,
          original_id: task.id,
        });
        added++;
      }

      setImportProgress({ current: 0, total: 0, item: "" });

      if (!stopImportRef.current) {
        toast.success(
          isHalloweenMode
            ? added > 0
              ? `Resurrected ${added} new tasks!`
              : "All tasks already in the Grimoire."
            : added > 0
              ? `Indexed ${added} new tasks!`
              : "All tasks already indexed.",
        );
      }
    } catch (error) {
      console.error("Tasks import error:", error);
      toast.error(
        isHalloweenMode ? "Failed to summon tasks." : "Failed to sync tasks.",
      );
    } finally {
      setIsImportingTasks(false);
    }
  };

  const handleImportFinance = async () => {
    try {
      setIsImportingFinance(true);
      stopImportRef.current = false;
      toast.info(
        isHalloweenMode
          ? "Summoning financial records..."
          : "Syncing financial data...",
      );

      // Fetch all data
      const { data: transactions } = await supabase
        .from("budget_transactions")
        .select("*");
      const { data: recurring } = await supabase
        .from("recurring_transactions")
        .select("*");
      const { data: accounts } = await supabase
        .from("finance_accounts")
        .select("*");
      const { data: liabilities } = await supabase
        .from("liabilities")
        .select("*");
      const { data: goals } = await supabase
        .from("financial_goals")
        .select("*");
      const { data: categories } = await supabase
        .from("finance_categories")
        .select("*");
      const { data: budgets } = await supabase.from("budgets").select("*");

      const categoryMap = new Map(categories?.map((c) => [c.id, c.name]) || []);
      const accountMap = new Map(accounts?.map((a) => [a.id, a.name]) || []);

      // Get already indexed items
      const { data: indexed } = await supabase
        .from("search_index")
        .select("metadata")
        .in("metadata->>type", [
          "transaction",
          "recurring_transaction",
          "account",
          "liability",
          "financial_goal",
          "budget",
        ]);

      const indexedIds = new Set(
        indexed?.map(
          (i: { metadata: { original_id: string } }) => i.metadata.original_id,
        ) || [],
      );

      let added = 0;
      const totalItems =
        (transactions?.length || 0) +
        (recurring?.length || 0) +
        (accounts?.length || 0) +
        (liabilities?.length || 0) +
        (goals?.length || 0) +
        (budgets?.length || 0);
      setImportProgress({
        current: 0,
        total: totalItems,
        item: "financial data",
      });

      // Index Transactions
      if (transactions) {
        for (const t of transactions) {
          if (stopImportRef.current) break;
          if (indexedIds.has(t.id)) continue;

          setImportProgress((prev) => ({
            ...prev,
            current: prev.current + 1,
            item: `Transaction: ${t.description}`,
          }));

          const categoryName = t.category_id
            ? categoryMap.get(t.category_id)
            : t.category;
          const accountName = t.account_id
            ? accountMap.get(t.account_id)
            : "Unknown";

          const content = `Transaction: ${t.amount} - ${t.description}
Category: ${categoryName || "Uncategorized"}
Account: ${accountName}
Date: ${t.transaction_date}
Type: ${t.type || "expense"}`;

          await addToGrimoire(content, {
            type: "transaction",
            original_id: t.id,
            amount: t.amount,
            category: categoryName,
            category_id: t.category_id,
            account_name: accountName,
            account_id: t.account_id,
            transaction_date: t.transaction_date,
            transaction_type: t.type || "expense",
            created_at: t.created_at,
            tags: t.tags || [],
          });
          added++;
        }
      }

      // Index Recurring
      if (recurring && !stopImportRef.current) {
        for (const r of recurring) {
          if (stopImportRef.current) break;
          if (indexedIds.has(r.id)) continue;

          setImportProgress((prev) => ({
            ...prev,
            current: prev.current + 1,
            item: `Recurring: ${r.description}`,
          }));

          const categoryName = r.category_id
            ? categoryMap.get(r.category_id)
            : "Bills";
          const accountName = r.account_id
            ? accountMap.get(r.account_id)
            : "Unknown";

          const content = `Transaction: ${r.amount} - ${r.description} (Recurring)
Category: ${categoryName}
Account: ${accountName}
Date: ${r.next_run_date}
Type: ${r.type || "expense"}`;

          await addToGrimoire(content, {
            type: "recurring_transaction",
            original_id: r.id,
            amount: r.amount,
            category: categoryName,
            category_id: r.category_id,
            account_name: accountName,
            account_id: r.account_id,
            next_run_date: r.next_run_date,
            interval: r.interval,
            active: r.active,
            created_at: r.created_at,
          });
          added++;
        }
      }

      // Index Accounts
      if (accounts && !stopImportRef.current) {
        for (const a of accounts) {
          if (stopImportRef.current) break;
          if (indexedIds.has(a.id)) continue;

          setImportProgress((prev) => ({
            ...prev,
            current: prev.current + 1,
            item: `Account: ${a.name}`,
          }));

          await addToGrimoire(
            `Account: ${a.name} (${a.type})
Current Balance: ${a.balance} ${a.currency}
Status: Active`,
            {
              type: "account",
              original_id: a.id,
              account_type: a.type,
              balance: a.balance,
              currency: a.currency,
              include_in_total: a.include_in_total,
              created_at: a.created_at,
            },
          );
          added++;
        }
      }

      // Index Budgets
      if (budgets && !stopImportRef.current) {
        for (const b of budgets) {
          if (stopImportRef.current) break;
          if (indexedIds.has(b.id)) continue;

          setImportProgress((prev) => ({
            ...prev,
            current: prev.current + 1,
            item: `Budget: ${b.name}`,
          }));

          const categoryName = b.category
            ? categoryMap.get(b.category) || b.category
            : "Uncategorized";

          await addToGrimoire(
            `Budget: ${b.name}
Category: ${categoryName}
Amount: ${b.amount}
Spent: ${b.spent}
Period: ${b.period}
Status: ${b.spent > b.amount ? "Over Budget" : "On Track"}`,
            {
              type: "budget",
              original_id: b.id,
              amount: b.amount,
              spent: b.spent,
              category: categoryName,
              period: b.period,
              start_date: b.start_date,
              end_date: b.end_date,
              created_at: b.created_at,
            },
          );
          added++;
        }
      }

      // Index Liabilities
      if (liabilities && !stopImportRef.current) {
        for (const l of liabilities) {
          if (stopImportRef.current) break;
          if (indexedIds.has(l.id)) continue;

          setImportProgress((prev) => ({
            ...prev,
            current: prev.current + 1,
            item: `Liability: ${l.name}`,
          }));

          await addToGrimoire(
            `Liability: ${l.name} (${l.type})
Amount Owed: ${l.amount}
Interest Rate: ${l.interest_rate}%
Minimum Payment: ${l.minimum_payment}
Due Date: ${l.due_date}
Status: ${l.is_active ? "Active" : "Paid Off"}`,
            {
              type: "liability",
              original_id: l.id,
              liability_type: l.type,
              amount: l.amount,
              interest_rate: l.interest_rate,
              minimum_payment: l.minimum_payment,
              due_date: l.due_date,
              is_active: l.is_active,
              created_at: l.created_at,
            },
          );
          added++;
        }
      }

      // Index Goals
      if (goals && !stopImportRef.current) {
        for (const g of goals) {
          if (stopImportRef.current) break;
          if (indexedIds.has(g.id)) continue;

          setImportProgress((prev) => ({
            ...prev,
            current: prev.current + 1,
            item: `Goal: ${g.name}`,
          }));

          await addToGrimoire(
            `Financial Goal: ${g.name}
Target: ${g.target_amount}
Current: ${g.current_amount}
Target Date: ${g.target_date}
Status: ${g.is_active ? "Active" : "Inactive"}`,
            {
              type: "financial_goal",
              original_id: g.id,
              target_amount: g.target_amount,
              current_amount: g.current_amount,
              target_date: g.target_date,
              is_active: g.is_active,
              created_at: g.created_at,
            },
          );
          added++;
        }
      }

      setImportProgress({ current: 0, total: 0, item: "" });

      if (!stopImportRef.current) {
        toast.success(
          isHalloweenMode
            ? added > 0
              ? `Resurrected ${added} financial records!`
              : "All financial data already in the Grimoire."
            : added > 0
              ? `Indexed ${added} financial records!`
              : "All financial data already indexed.",
        );
      }
    } catch (error) {
      console.error("Financial import error:", error);
      toast.error("Failed to sync financial data.");
    } finally {
      setIsImportingFinance(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setHasSearched(true);
    await askTheGrimoire(query, isHalloweenMode);
  };

  const placeholder = isHalloweenMode
    ? "Ask the spirits about your past..."
    : "Search your knowledge base...";

  return (
    <ExpandableScreenContent
      className={`shadow-2xl overflow-hidden w-full max-w-5xl h-[85vh] ${
        isHalloweenMode
          ? "bg-[#1a1a1f] border border-[#60c9b6]/30 shadow-[0_0_30px_rgba(96,201,182,0.15)]"
          : isDark
            ? "bg-[#1A1A1F] border border-white/10"
            : "bg-white border border-gray-200"
      }`}
      closeButtonClassName={
        isHalloweenMode
          ? "hidden md:flex right-4 top-4 md:right-6 md:top-6 text-[#60c9b6] bg-[#60c9b6]/10 hover:bg-[#60c9b6]/20"
          : isDark
            ? "hidden md:flex right-4 top-4 md:right-6 md:top-6 text-white bg-white/10 hover:bg-white/20"
            : "hidden md:flex right-4 top-4 md:right-6 md:top-6 text-gray-600 bg-gray-100 hover:text-gray-900 hover:bg-gray-200"
      }
    >
      <div className="flex flex-col h-full relative">
        {/* Halloween Decorations */}
        {isHalloweenMode && (
          <>
            <div className="hidden md:block absolute bottom-0 left-0 pointer-events-none z-0">
              <img
                src={witchBrew}
                alt=""
                className="w-48 h-48 md:w-64 md:h-64 opacity-10 object-contain object-bottom-left"
              />
            </div>
            <div className="hidden md:block absolute -top-10 -right-10 pointer-events-none z-0">
              <img
                src={spiderSharpHanging}
                alt=""
                className="w-32 h-32 md:w-48 md:h-48 opacity-10"
              />
            </div>
          </>
        )}

        {/* Mobile Top Bar (Icons) */}
        <div
          className={`md:hidden flex items-center justify-between px-4 h-14 border-b shrink-0 relative z-10 ${
            isHalloweenMode
              ? "border-[#60c9b6]/20"
              : isDark
                ? "border-white/10"
                : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {isGhostWriting && (
              <Sparkles
                className={`w-5 h-5 animate-spin ${
                  isHalloweenMode ? "text-[#60c9b6]" : "text-purple-500"
                }`}
              />
            )}

            {/* Import Buttons (Mobile) */}
            <PortalTooltip
              content={
                isHalloweenMode
                  ? "Summon notes from the void"
                  : "Index all notes for AI search"
              }
              side="top"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={handleImportNotes}
                disabled={
                  isImportingJournal ||
                  isImportingNotes ||
                  isImportingTasks ||
                  isImportingFinance ||
                  isGhostWriting
                }
                className={`h-9 w-9 cursor-pointer ${
                  isHalloweenMode
                    ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                    : "text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                }`}
              >
                <FileText
                  className={`w-5 h-5 ${isImportingNotes ? "hidden" : ""}`}
                />
                {isImportingNotes && (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
              </Button>
            </PortalTooltip>

            <PortalTooltip
              content={
                isHalloweenMode
                  ? "Summon tasks from the shadows"
                  : "Index all tasks for AI search"
              }
              side="top"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={handleImportTasks}
                disabled={
                  isImportingJournal ||
                  isImportingNotes ||
                  isImportingTasks ||
                  isImportingFinance ||
                  isGhostWriting
                }
                className={`h-9 w-9 cursor-pointer ${
                  isHalloweenMode
                    ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                    : "text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                }`}
              >
                <List
                  className={`w-5 h-5 ${isImportingTasks ? "hidden" : ""}`}
                />
                {isImportingTasks && (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
              </Button>
            </PortalTooltip>

            <PortalTooltip
              content={
                isHalloweenMode
                  ? "Summon financial records"
                  : "Index all financial data"
              }
              side="top"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={handleImportFinance}
                disabled={
                  isImportingJournal ||
                  isImportingNotes ||
                  isImportingTasks ||
                  isImportingFinance ||
                  isGhostWriting
                }
                className={`h-9 w-9 cursor-pointer ${
                  isHalloweenMode
                    ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                    : "text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                }`}
              >
                <Wallet
                  className={`w-5 h-5 ${isImportingFinance ? "hidden" : ""}`}
                />
                {isImportingFinance && (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
              </Button>
            </PortalTooltip>

            <PortalTooltip
              content={
                isHalloweenMode
                  ? "Summon financial records"
                  : "Index all financial data"
              }
              side="top"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={handleImportFinance}
                disabled={
                  isImportingJournal ||
                  isImportingNotes ||
                  isImportingTasks ||
                  isImportingFinance ||
                  isGhostWriting
                }
                className={`h-9 w-9 cursor-pointer ${
                  isHalloweenMode
                    ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                    : "text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                }`}
              >
                <Wallet
                  className={`w-5 h-5 ${isImportingFinance ? "hidden" : ""}`}
                />
                {isImportingFinance && (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
              </Button>
            </PortalTooltip>

            <PortalTooltip
              content={
                isHalloweenMode
                  ? "Summon journal entries from the past"
                  : "Index all journal entries for AI search"
              }
              side="top"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={handleImportJournal}
                disabled={
                  isImportingJournal ||
                  isImportingNotes ||
                  isImportingTasks ||
                  isImportingFinance ||
                  isGhostWriting
                }
                className={`h-9 w-9 cursor-pointer ${
                  isHalloweenMode
                    ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                    : "text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                }`}
              >
                <BookOpen
                  className={`w-5 h-5 ${isImportingJournal ? "hidden" : ""}`}
                />
                {isImportingJournal && (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
              </Button>
            </PortalTooltip>
          </div>

          {/* Close Button (Mobile) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchModalOpen(false)}
            className={`h-10 w-10 transition-colors ${
              isHalloweenMode
                ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                : isDark
                  ? "text-gray-400 hover:text-gray-200 hover:bg-white/10"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Desktop Header / Search Input Area */}
        <div
          className={`hidden md:flex items-center px-4 md:px-6 h-20 md:h-24 border-b shrink-0 relative z-10 ${
            isHalloweenMode
              ? "border-[#60c9b6]/20"
              : isDark
                ? "border-white/10"
                : "border-gray-200"
          }`}
        >
          <Search
            className={`w-5 h-5 md:w-6 md:h-6 mr-3 md:mr-4 ${
              isHalloweenMode ? "text-[#60c9b6]" : "text-gray-400"
            }`}
          />

          <form onSubmit={handleSearch} className="flex-1">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className={`w-full h-full bg-transparent border-none outline-none text-xl md:text-2xl font-medium ${
                isHalloweenMode
                  ? "text-[#60c9b6] placeholder:text-[#60c9b6]/40"
                  : isDark
                    ? "text-white placeholder:text-gray-500"
                    : "text-gray-900 placeholder:text-gray-400"
              }`}
            />
          </form>

          <div className="flex items-center gap-2 md:gap-3 mr-16">
            {isGhostWriting && (
              <Sparkles
                className={`w-5 h-5 animate-spin ${
                  isHalloweenMode ? "text-[#60c9b6]" : "text-purple-500"
                }`}
              />
            )}

            {/* Import Buttons */}
            <PortalTooltip
              content={
                isHalloweenMode
                  ? "Summon notes from the void"
                  : "Index all notes for AI search"
              }
              side="top"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={handleImportNotes}
                disabled={
                  isImportingJournal ||
                  isImportingNotes ||
                  isImportingTasks ||
                  isImportingFinance ||
                  isGhostWriting
                }
                className={`h-9 w-9 md:h-10 md:w-10 cursor-pointer ${
                  isHalloweenMode
                    ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                    : "text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                }`}
              >
                <FileText
                  className={`w-5 h-5 md:w-6 md:h-6 ${
                    isImportingNotes ? "hidden" : ""
                  }`}
                />
                {isImportingNotes && (
                  <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
              </Button>
            </PortalTooltip>

            <PortalTooltip
              content={
                isHalloweenMode
                  ? "Summon tasks from the shadows"
                  : "Index all tasks for AI search"
              }
              side="top"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={handleImportTasks}
                disabled={
                  isImportingJournal ||
                  isImportingNotes ||
                  isImportingTasks ||
                  isImportingFinance ||
                  isGhostWriting
                }
                className={`h-9 w-9 md:h-10 md:w-10 cursor-pointer ${
                  isHalloweenMode
                    ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                    : "text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                }`}
              >
                <List
                  className={`w-5 h-5 md:w-6 md:h-6 ${
                    isImportingTasks ? "hidden" : ""
                  }`}
                />
                {isImportingTasks && (
                  <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
              </Button>
            </PortalTooltip>

            <PortalTooltip
              content={
                isHalloweenMode
                  ? "Summon financial records"
                  : "Index all financial data"
              }
              side="top"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={handleImportFinance}
                disabled={
                  isImportingJournal ||
                  isImportingNotes ||
                  isImportingTasks ||
                  isImportingFinance ||
                  isGhostWriting
                }
                className={`h-9 w-9 md:h-10 md:w-10 cursor-pointer ${
                  isHalloweenMode
                    ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                    : "text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                }`}
              >
                <Wallet
                  className={`w-5 h-5 md:w-6 md:h-6 ${
                    isImportingFinance ? "hidden" : ""
                  }`}
                />
                {isImportingFinance && (
                  <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
              </Button>
            </PortalTooltip>

            <PortalTooltip
              content={
                isHalloweenMode
                  ? "Summon journal entries from the past"
                  : "Index all journal entries for AI search"
              }
              side="top"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={handleImportJournal}
                disabled={
                  isImportingJournal ||
                  isImportingNotes ||
                  isImportingTasks ||
                  isImportingFinance ||
                  isGhostWriting
                }
                className={`h-9 w-9 md:h-10 md:w-10 cursor-pointer ${
                  isHalloweenMode
                    ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                    : "text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                }`}
              >
                <BookOpen
                  className={`w-5 h-5 md:w-6 md:h-6 ${
                    isImportingJournal ? "hidden" : ""
                  }`}
                />
                {isImportingJournal && (
                  <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
              </Button>
            </PortalTooltip>

            <div
              className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium ${
                isHalloweenMode
                  ? "border-[#60c9b6]/30 text-[#60c9b6]/60"
                  : isDark
                    ? "border-white/10 text-gray-500"
                    : "border-gray-200 text-gray-400"
              }`}
            >
              <span className="text-xs">ESC</span>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div
          className={`flex-1 overflow-hidden relative z-10 ${
            isHalloweenMode
              ? "bg-[#60c9b6]/5"
              : isDark
                ? "bg-black/20"
                : "bg-gray-50/50"
          }`}
        >
          {isImportingJournal ||
          isImportingNotes ||
          isImportingTasks ||
          isImportingFinance ? (
            <div className="h-full flex flex-col items-center justify-center gap-8 p-8">
              <Spinner
                className="bg-transparent"
                singleColor={isHalloweenMode}
              />

              <div className="w-full max-w-xs space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="text-center">
                  <TextShimmer
                    className={`text-lg font-medium ${
                      isHalloweenMode ? "font-creepster tracking-wider" : ""
                    }`}
                    duration={2}
                  >
                    {isImportingJournal
                      ? isHalloweenMode
                        ? "Summoning journal entries..."
                        : "Syncing journal entries..."
                      : isImportingNotes
                        ? isHalloweenMode
                          ? "Summoning notes..."
                          : "Syncing notes..."
                        : isImportingTasks
                          ? isHalloweenMode
                            ? "Summoning tasks..."
                            : "Syncing tasks..."
                          : isHalloweenMode
                            ? "Summoning wealth..."
                            : "Syncing financial data..."}
                  </TextShimmer>
                </div>

                {importProgress.total > 0 && (
                  <div className="space-y-2">
                    <Progress
                      value={importProgress.current}
                      max={importProgress.total}
                      className={`h-1.5 bg-gray-100 dark:bg-gray-800 ${isHalloweenMode ? "bg-[#60c9b6]/10" : ""}`}
                      indicatorClassName={
                        isHalloweenMode ? "bg-[#60c9b6]" : "bg-primary"
                      }
                    />
                    <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 font-mono">
                      <span className="truncate max-w-[150px]">
                        {importProgress.item}
                      </span>
                      <span>
                        {importProgress.current} / {importProgress.total}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStopImport}
                  className={`w-full mt-2 cursor-pointer ${
                    isHalloweenMode
                      ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      : "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  }`}
                >
                  {isHalloweenMode ? "Break the Spell" : "Stop Syncing"}
                </Button>
              </div>
            </div>
          ) : hasSearched ? (
            <ScrollArea className="h-full w-full">
              <div className="p-3 md:p-6 relative z-10">
                {completion || isGhostWriting ? (
                  <div
                    className={`prose prose-sm max-w-none ${
                      isHalloweenMode
                        ? "prose-invert"
                        : isDark
                          ? "prose-invert"
                          : ""
                    }`}
                  >
                    {completion ? (
                      <div
                        className={`${
                          isHalloweenMode
                            ? "text-[#60c9b6] [&_strong]:text-[#7ee0ca] [&_em]:text-[#60c9b6]/80 [&_code]:text-[#60c9b6] [&_code]:bg-[#60c9b6]/10"
                            : isDark
                              ? "text-gray-200 [&_strong]:text-white [&_em]:text-gray-300"
                              : "text-gray-800 [&_strong]:text-gray-900 [&_em]:text-gray-700"
                        } leading-relaxed [&>*:first-child]:mt-0`}
                      >
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-4 last:mb-0 mt-0 first:mt-0">
                                {children}
                              </p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic">{children}</em>
                            ),
                            code: ({ children }) => (
                              <code className="px-1.5 py-0.5 rounded text-sm font-mono">
                                {children}
                              </code>
                            ),
                          }}
                        >
                          {completion}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p
                        className={`m-0 ${
                          isHalloweenMode
                            ? "text-[#60c9b6]"
                            : isDark
                              ? "text-gray-200"
                              : "text-gray-800"
                        } animate-pulse`}
                      >
                        <TextShimmer
                          as="span"
                          className={`font-medium ${
                            isHalloweenMode
                              ? "[--base-color:#60c9b6] [--base-gradient-color:#60c9b6]"
                              : "[--base-color:#a855f7] [--base-gradient-color:#a855f7]"
                          }`}
                          duration={1.5}
                        >
                          {isHalloweenMode
                            ? "The spirits are consulting the ancient texts..."
                            : "Thinking..."}
                        </TextShimmer>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center opacity-50">
                    <Sparkles className="w-8 h-8 mb-2" />
                    <p>Ask a question to search your journal entries</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div
              className={`flex flex-col items-center justify-center h-full p-8 text-center relative z-10 ${
                isHalloweenMode ? "text-[#60c9b6]/60" : "text-gray-400"
              }`}
            >
              <Command className="w-12 h-12 md:w-20 md:h-20 mb-4 md:mb-6 opacity-20" />
              <h3
                className={`text-xl md:text-3xl font-medium mb-2 md:mb-3 ${
                  isHalloweenMode ? "text-[#60c9b6]" : ""
                }`}
              >
                {isHalloweenMode ? "The Grimoire Awaits" : "Search Integral"}
              </h3>
              <p className="text-sm md:text-lg max-w-xs md:max-w-xl mx-auto opacity-70 leading-relaxed">
                Search through your journal entries, notes, and tasks using
                natural language.
              </p>
            </div>
          )}
        </div>

        {/* Mobile Bottom Search Input */}
        <div
          className={`md:hidden flex items-center px-4 h-16 border-t shrink-0 relative z-10 ${
            isHalloweenMode
              ? "border-[#60c9b6]/20 bg-[#1a1a1f]"
              : isDark
                ? "border-white/10 bg-[#1A1A1F]"
                : "border-gray-200 bg-white"
          }`}
        >
          <Search
            className={`w-5 h-5 mr-3 ${
              isHalloweenMode ? "text-[#60c9b6]" : "text-gray-400"
            }`}
          />
          <form onSubmit={handleSearch} className="flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className={`w-full h-full bg-transparent border-none outline-none text-sm font-medium ${
                isHalloweenMode
                  ? "text-[#60c9b6] placeholder:text-[#60c9b6]/40"
                  : isDark
                    ? "text-white placeholder:text-gray-500"
                    : "text-gray-900 placeholder:text-gray-400"
              }`}
            />
          </form>
          <div className="flex items-center gap-1 ml-2 opacity-50 shrink-0">
            <img src="/ai.svg" alt="Gemini" className="w-3 h-3" />
            <span
              className={`text-[10px] ${
                isHalloweenMode ? "text-[#60c9b6]" : "text-gray-500"
              }`}
            >
              Gemini
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`hidden md:flex px-4 md:px-6 py-2 md:py-3 border-t items-center justify-between text-[10px] md:text-xs shrink-0 relative z-10 ${
            isHalloweenMode
              ? "border-[#60c9b6]/20 bg-[#60c9b6]/5 text-[#60c9b6]/60"
              : isDark
                ? "border-white/10 bg-white/5 text-gray-500"
                : "border-gray-200 bg-gray-50 text-gray-400"
          }`}
        >
          <div className="hidden md:flex items-center gap-4">
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3.5 h-3.5" /> to select
            </span>
            <span className="flex items-center gap-1">
              <ArrowUp className="w-3.5 h-3.5" />{" "}
              <ArrowDown className="w-3.5 h-3.5" /> to navigate
            </span>
          </div>
          <div className="flex md:hidden items-center gap-1">
            <CornerDownLeft className="w-3 h-3" />
            <span>select</span>
          </div>
          <div className="flex justify-end items-center gap-1 md:gap-2">
            <span className="flex items-center gap-1">
              <span className="hidden md:inline">Powered by</span>
              <img
                src="/ai.svg"
                alt="Gemini"
                className="w-3 h-3 md:w-4 md:h-4"
              />
              <span>Gemini</span>
            </span>
          </div>
        </div>
      </div>
    </ExpandableScreenContent>
  );
};
