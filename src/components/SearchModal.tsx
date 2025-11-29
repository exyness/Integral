import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { AnimatePresence, motion } from "framer-motion";
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
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Tooltip } from "recharts";
import { toast } from "sonner";
import { spiderSharpHanging, witchBrew } from "@/assets";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/Button";
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setHasSearched(true);
    await askTheGrimoire(query, isHalloweenMode);
  };

  const placeholder = isHalloweenMode
    ? "Ask the spirits about your past..."
    : "Search your knowledge base...";

  if (!isSearchModalOpen) return null;

  return (
    <AnimatePresence>
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center md:items-start justify-center md:pt-[15vh] px-2 md:px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchModalOpen(false)}
            className={`fixed inset-0 backdrop-blur-sm ${
              isDark ? "bg-black/60" : "bg-white/60"
            }`}
          />

          {/* Command Palette Container */}
          <motion.div
            layoutId="search-modal-expand"
            className={`relative w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col ${
              isHalloweenMode
                ? "bg-[#1a1a1f] border border-[#60c9b6]/30 shadow-[0_0_30px_rgba(96,201,182,0.15)]"
                : isDark
                  ? "bg-[#1A1A1F] border border-white/10"
                  : "bg-white border border-gray-200"
            }`}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Halloween Decorations */}
            {isHalloweenMode && (
              <>
                <div className="absolute -bottom-0.5 -left-3 pointer-events-none z-0">
                  <img
                    src={witchBrew}
                    alt=""
                    className="w-32 h-32 md:w-48 md:h-48 opacity-10"
                  />
                </div>
                <div className="absolute -top-10 -right-10 pointer-events-none z-0">
                  <img
                    src={spiderSharpHanging}
                    alt=""
                    className="w-32 h-32 md:w-48 md:h-48 opacity-10"
                  />
                </div>
              </>
            )}

            {/* Header / Search Input Area */}
            <div
              className={`flex items-center px-3 md:px-4 h-12 md:h-16 border-b ${
                isHalloweenMode
                  ? "border-[#60c9b6]/20"
                  : isDark
                    ? "border-white/10"
                    : "border-gray-100"
              }`}
            >
              <Search
                className={`w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 ${
                  isHalloweenMode ? "text-[#60c9b6]" : "text-gray-400"
                }`}
              />

              <form onSubmit={handleSearch} className="flex-1">
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                  className={`w-full h-full bg-transparent border-none outline-none text-sm md:text-lg ${
                    isHalloweenMode
                      ? "text-[#60c9b6] placeholder:text-[#60c9b6]/40"
                      : isDark
                        ? "text-white placeholder:text-gray-500"
                        : "text-gray-900 placeholder:text-gray-400"
                  }`}
                />
              </form>

              <div className="flex items-center gap-1 md:gap-2">
                {isGhostWriting && (
                  <Sparkles
                    className={`w-4 h-4 animate-spin ${
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
                      isGhostWriting
                    }
                    className={`h-7 w-7 md:h-8 md:w-8 cursor-pointer ${
                      isHalloweenMode
                        ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                        : "text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                    }`}
                  >
                    <FileText
                      className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                        isImportingNotes ? "hidden" : ""
                      }`}
                    />
                    {isImportingNotes && (
                      <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
                      isGhostWriting
                    }
                    className={`h-7 w-7 md:h-8 md:w-8 cursor-pointer ${
                      isHalloweenMode
                        ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                        : "text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                    }`}
                  >
                    <List
                      className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                        isImportingTasks ? "hidden" : ""
                      }`}
                    />
                    {isImportingTasks && (
                      <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
                      isGhostWriting
                    }
                    className={`h-7 w-7 md:h-8 md:w-8 cursor-pointer ${
                      isHalloweenMode
                        ? "text-[#60c9b6] hover:bg-[#60c9b6]/10"
                        : "text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                    }`}
                  >
                    <BookOpen
                      className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                        isImportingJournal ? "hidden" : ""
                      }`}
                    />
                    {isImportingJournal && (
                      <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    )}
                  </Button>
                </PortalTooltip>

                <div
                  className={`hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium ${
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
              className={`flex-1 min-h-[200px] md:min-h-[300px] max-h-[50vh] md:max-h-[60vh] overflow-hidden relative ${
                isHalloweenMode
                  ? "bg-[#60c9b6]/5"
                  : isDark
                    ? "bg-black/20"
                    : "bg-gray-50/50"
              }`}
            >
              {isImportingJournal || isImportingNotes || isImportingTasks ? (
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
                            : isHalloweenMode
                              ? "Summoning tasks..."
                              : "Syncing tasks..."}
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
                  <Command className="w-12 h-12 mb-4 opacity-20" />
                  <h3
                    className={`text-lg font-medium mb-2 ${
                      isHalloweenMode ? "text-[#60c9b6]" : ""
                    }`}
                  >
                    {isHalloweenMode
                      ? "The Grimoire Awaits"
                      : "Search Integral"}
                  </h3>
                  <p className="text-sm max-w-sm mx-auto opacity-70">
                    Search through your journal entries, notes, and tasks using
                    natural language.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className={`px-2 md:px-4 py-1.5 md:py-2 border-t flex items-center justify-between text-[9px] md:text-[10px] ${
                isHalloweenMode
                  ? "border-[#60c9b6]/20 bg-[#60c9b6]/5 text-[#60c9b6]/60"
                  : isDark
                    ? "border-white/10 bg-white/5 text-gray-500"
                    : "border-gray-100 bg-gray-50 text-gray-400"
              }`}
            >
              <div className="hidden md:flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="w-3 h-3" /> to select
                </span>
                <span className="flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" />{" "}
                  <ArrowDown className="w-3 h-3" /> to navigate
                </span>
              </div>
              <div className="flex md:hidden items-center gap-1">
                <CornerDownLeft className="w-2.5 h-2.5" />
                <span>select</span>
              </div>
              <div className="flex justify-end items-center gap-1 md:gap-2">
                <span className="flex items-center gap-1">
                  <span className="hidden md:inline">Powered by</span>
                  <img
                    src="/ai.svg"
                    alt="Gemini"
                    className="w-2.5 h-2.5 md:w-3 md:h-3"
                  />
                  <span>Gemini</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
