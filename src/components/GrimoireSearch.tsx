import { AnimatePresence, motion } from "framer-motion";
import { Brain, Ghost, RefreshCw, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { useTheme } from "@/contexts/ThemeContext";
import { useSpookyAI } from "@/hooks/useSpookyAI";
import { supabase } from "@/integrations/supabase/client";

export const GrimoireSearch = () => {
  const [query, setQuery] = useState("");
  const { askTheGrimoire, addToGrimoire, isGhostWriting, completion } =
    useSpookyAI();
  const [hasSearched, setHasSearched] = useState(false);
  const [isBackfilling, setIsBackfilling] = useState(false);
  const { isDark, isHalloweenMode } = useTheme();

  const handleBackfill = async () => {
    try {
      setIsBackfilling(true);
      toast.info(
        isHalloweenMode
          ? "Summoning past memories..."
          : "Indexing journal entries...",
      );

      const { data: entries, error } = await supabase
        .from("daily_entries")
        .select("*");

      if (error) throw error;
      if (!entries?.length) {
        toast.info(
          isHalloweenMode
            ? "No memories found to resurrect."
            : "No journal entries found.",
        );
        return;
      }

      let count = 0;
      for (const entry of entries) {
        await addToGrimoire(`${entry.title}\n\n${entry.content}`, {
          type: "journal",
          date: entry.entry_date,
          title: entry.title,
          original_id: entry.id,
        });
        count++;
      }

      toast.success(
        isHalloweenMode
          ? `Resurrected ${count} memories into the Grimoire!`
          : `Successfully indexed ${count} journal entries!`,
      );
    } catch (error) {
      console.error("Backfill error:", error);
      toast.error(
        isHalloweenMode
          ? "Failed to summon past memories."
          : "Failed to index journal entries.",
      );
    } finally {
      setIsBackfilling(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setHasSearched(true);
    await askTheGrimoire(query, isHalloweenMode);
  };

  // Theme-based styling
  const titleColor = isHalloweenMode
    ? "text-purple-300"
    : isDark
      ? "text-blue-400"
      : "text-blue-600";

  const inputBg = isHalloweenMode
    ? "bg-black/20 border-purple-500/20 text-purple-100 placeholder:text-purple-500/50 focus-visible:ring-purple-500/50"
    : isDark
      ? "bg-white/5 border-blue-500/20 text-white placeholder:text-gray-400 focus-visible:ring-blue-500/50"
      : "bg-gray-50 border-blue-500/20 text-gray-900 placeholder:text-gray-500 focus-visible:ring-blue-500/50";

  const buttonColor = isHalloweenMode
    ? "bg-purple-600 hover:bg-purple-700"
    : "bg-blue-600 hover:bg-blue-700";

  const resultBg = isHalloweenMode
    ? "bg-purple-900/20 border-purple-500/20"
    : isDark
      ? "bg-blue-900/20 border-blue-500/20"
      : "bg-blue-50 border-blue-200/50";

  const textColor = isHalloweenMode
    ? "text-purple-200"
    : isDark
      ? "text-blue-200"
      : "text-blue-900";

  const IconComponent = isHalloweenMode ? Ghost : Brain;
  const title = isHalloweenMode ? "The Grimoire" : "Second Brain";
  const placeholder = isHalloweenMode
    ? "Ask the spirits about your past..."
    : "Search your journal entries...";
  const loadingText = isHalloweenMode
    ? "The spirits are consulting the ancient texts..."
    : "Searching your knowledge base...";

  return (
    <GlassCard className="w-full max-w-2xl mx-auto p-6 overflow-hidden relative">
      <div className={`flex items-center gap-2 ${titleColor} font-serif mb-4`}>
        <IconComponent className="w-5 h-5" />
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackfill}
          disabled={isBackfilling || isGhostWriting}
          className={`ml-auto ${titleColor} hover:${isDark ? "bg-white/10" : "bg-gray-100"}`}
          title={
            isHalloweenMode
              ? "Absorb existing journal entries"
              : "Index all journal entries"
          }
        >
          <RefreshCw
            className={`w-4 h-4 ${isBackfilling ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      <div className="space-y-4 relative z-10">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className={inputBg}
          />
          <Button
            type="submit"
            disabled={isGhostWriting}
            className={`${buttonColor} text-white`}
          >
            {isGhostWriting ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </form>

        <AnimatePresence>
          {hasSearched && (completion || isGhostWriting) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`rounded-lg ${resultBg} border p-4`}
            >
              <ScrollArea className="h-[200px] w-full pr-4">
                <div className="prose prose-invert max-w-none">
                  <p
                    className={`${textColor} leading-relaxed whitespace-pre-wrap ${isHalloweenMode ? "font-serif" : ""}`}
                  >
                    {completion || loadingText}
                  </p>
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
};
