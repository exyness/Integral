import { GoogleGenAI } from "@google/genai";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";
import { Json } from "../integrations/supabase/types";
import { generateEmbedding } from "../lib/gemini";
import { extractTemporalIntent, formatDateRange } from "../lib/temporalQuery";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export type SpookyAIMode =
  | "ghost"
  | "grammar"
  | "prophecy"
  | "resurrect"
  | "financial_horror"
  | "subscription_analysis"
  | "budget_forecast"
  | "smart_allocation"
  | "general"
  | "productivity_tip";

export const useSpookyAI = () => {
  const [isGhostWriting, setIsGhostWriting] = useState(false);
  const [completion, setCompletion] = useState("");

  const consultSpirits = async (
    text: string,
    mode: SpookyAIMode = "ghost",
    style: "spooky" | "normal" = "spooky",
  ): Promise<string | null> => {
    if (!API_KEY) {
      toast.error("The spirits are silent... (Missing API Key)");
      return null;
    }

    if (!text.trim()) {
      toast.error("The spirits need something to work with...");
      return null;
    }

    setIsGhostWriting(true);
    setCompletion("");

    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });

      let prompt = "";
      const isSpooky = style === "spooky";

      switch (mode) {
        case "grammar":
          prompt = `You are a strict but helpful ${isSpooky ? "Victorian Schoolteacher Ghost" : "Editor"}.
Correct the grammar and spelling of the following journal entry.
Do NOT change the tone or style, just fix the errors.
IMPORTANT: Return ONLY the corrected text. Do not add any introductory or concluding remarks.

Entry: "${text}"`;
          break;

        case "prophecy":
          prompt = `You are a ${isSpooky ? "Dark Oracle Ghost" : "Strategic Forecaster"}.
Read the following journal entry and add a short, ${isSpooky ? "cryptic, but relevant prophecy" : "insightful prediction"} 
at the end of it, predicting what might happen next based on the entry.
The prediction should be 2-3 sentences maximum and start with "${isSpooky ? "Prophecy: " : "Forecast: "}"
IMPORTANT: Return ONLY the prediction text. Do NOT include the original entry.

Entry: "${text}"`;
          break;

        case "resurrect":
          prompt = `You are a ${isSpooky ? "Necromancer Productivity Expert" : "Productivity Coach"}.
The following task has been ${isSpooky ? "dead (incomplete) for over a week" : "stagnant for a while"}: "${text}"
Suggest 3 small, actionable subtasks to ${isSpooky ? "bring it back to life" : "get it moving"}.
Format the output as a simple list of 3 bullet points (starting with -).
IMPORTANT: Return ONLY the bullet points. Do not add any introductory text.

Task: "${text}"`;
          break;

        case "financial_horror":
          prompt = `You are ${isSpooky ? "the Crypt Keeper of Capitalism" : "a No-Nonsense Financial Advisor"}.
Read the following financial summary and write a short, ${isSpooky ? 'humorous "horror story"' : "honest reality check"} (2-3 sentences) about the user's spending habits.
Focus on their biggest expense or total spending. ${isSpooky ? "Make it spooky but funny." : "Be direct and professional but slightly witty."}
${isSpooky ? 'Example: "I see a mountain of coffee cups... your wallet screams in agony."' : 'Example: "Your coffee spending is alarming. It is time to cut back."'}
IMPORTANT: Return ONLY the story/advice.

Financial Data:
${text}`;
          break;

        case "subscription_analysis":
          prompt = `You are ${isSpooky ? "a Ghost Hunter seeking Phantom Charges" : "a Subscription Auditor"}.
Analyze the following transaction list and identify potential recurring subscriptions or "phantom" costs that might be draining the user's wallet.
${isSpooky ? "Describe them as leeches or spirits feeding on gold." : "Highlight them as potential savings opportunities."}
If none are found, say so ${isSpooky ? "in a spooky way" : "professionally"}.
Limit to 2-3 sentences.

Transactions:
${text}`;
          break;

        case "budget_forecast":
          prompt = `You are ${isSpooky ? "the Oracle of Empty Wallets" : "a Financial Forecaster"}.
Based on the current spending velocity and remaining budget, predict the end-of-month outcome.
${isSpooky ? "Use doom-laden metaphors (graveyards, abysses)." : "Use clear financial terms."}
Give a specific warning or encouragement.
Limit to 2-3 sentences.

Data:
${text}`;
          break;

        case "smart_allocation":
          prompt = `You are ${isSpooky ? "a Potion Master brewing Wealth" : "a Budget Allocator"}.
Suggest how to distribute the remaining funds (or cut costs) to meet the budget.
${isSpooky ? "Use potion metaphors (ingredients, cauldrons, sacrifice)." : "Use practical allocation advice."}
Provide 3 specific, actionable tips as bullet points.

Data:
${text}`;
          break;

        case "productivity_tip":
          prompt = `You are ${isSpooky ? "a Ghostly Mentor" : "a Productivity Coach"}.
Give a short, ${isSpooky ? "spooky but motivating" : "effective"} productivity tip.
${isSpooky ? "Use metaphors about time slipping away, graveyards of unfinished tasks, or haunting deadlines." : "Focus on focus, discipline, and momentum."}
Keep it under 2 sentences.

Context: "${text}"`;
          break;

        case "general":
          prompt = `You are ${isSpooky ? "a Spirit in the Machine" : "an AI Assistant"}.
Respond to the following prompt in a ${isSpooky ? "spooky, mysterious" : "helpful, concise"} way.
Keep it brief (under 3 sentences).

Prompt: "${text}"`;
          break;

        case "ghost":
        default:
          prompt = `You are a ${isSpooky ? "Victorian Ghost haunting a journal" : "Creative Writing Assistant"}. 
                    Rewrite the following journal entry to sound ${isSpooky ? "spooky, ethereal, and slightly old-fashioned" : "more polished and expressive"}. 
                    Keep the core meaning but enhance the atmosphere.
                    IMPORTANT: Return ONLY the rewritten text.
                    Entry: "${text}"`;
          break;
      }

      const model = "gemini-flash-lite-latest";

      const response = await ai.models.generateContentStream({
        model,
        contents: prompt,
        config: {
          maxOutputTokens: 4096,
          temperature: 0.8,
        },
      });

      let fullText = "";

      for await (const chunk of response) {
        const chunkText = chunk.text || "";
        fullText += chunkText;

        if (mode === "prophecy") {
          setCompletion(text + "\n\n" + fullText);
        } else {
          setCompletion(fullText);
        }
      }

      const finalResult =
        mode === "prophecy" ? text + "\n\n" + fullText : fullText;
      return finalResult;
    } catch (error) {
      console.error("Spooky AI error:", error);
      toast.error("The spirits were disturbed...");
      setCompletion("");
      return null;
    } finally {
      setIsGhostWriting(false);
    }
  };

  const addToGrimoire = async (content: string, metadata: Json = {}) => {
    try {
      const embedding = await generateEmbedding(content);
      if (!embedding) throw new Error("Failed to generate embedding");

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("search_index").insert({
        content,
        metadata,
        embedding: JSON.stringify(embedding),
        user_id: user.id,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Grimoire error:", error);

      return false;
    }
  };

  const askTheGrimoire = async (query: string, isHalloweenMode = false) => {
    try {
      setIsGhostWriting(true);
      setCompletion("");

      const temporalIntent = extractTemporalIntent(query);
      const hasTemporalFilter = temporalIntent.type !== "none";

      const queryForEmbedding = hasTemporalFilter
        ? temporalIntent.cleanedQuery || query
        : query;

      const embedding = await generateEmbedding(queryForEmbedding);
      if (!embedding) {
        toast.error(
          isHalloweenMode
            ? "The spirits are confused..."
            : "Failed to process search query",
        );
        return null;
      }

      let documents;
      let error;

      if (
        hasTemporalFilter &&
        temporalIntent.startDate &&
        temporalIntent.endDate
      ) {
        const result = await supabase.rpc("match_documents_with_date_filter", {
          query_embedding: JSON.stringify(embedding),
          match_threshold: 0.3,
          match_count: 10,
          start_date: temporalIntent.startDate.toISOString(),
          end_date: temporalIntent.endDate.toISOString(),
        });
        documents = result.data;
        error = result.error;
      } else {
        const result = await supabase.rpc("match_documents", {
          query_embedding: JSON.stringify(embedding),
          match_threshold: 0.5,
          match_count: 5,
        });
        documents = result.data;
        error = result.error;
      }

      if (error) throw error;

      const context =
        documents
          ?.map((doc) => {
            const metadata = doc.metadata as {
              type?: string;
              title?: string;
              due_date?: string;
              entry_date?: string;
            };
            const title = metadata?.title || "";
            const type = metadata?.type || "";
            const dueDate = metadata?.due_date
              ? new Date(metadata.due_date).toLocaleDateString()
              : "";
            const entryDate = metadata?.entry_date
              ? new Date(metadata.entry_date).toLocaleDateString()
              : "";

            let header = "";
            if (type === "task" && title) {
              header = `[Task: ${title}${dueDate ? ` (Due: ${dueDate})` : ""}]\n`;
            } else if (type === "journal" && entryDate) {
              header = `[Journal Entry: ${entryDate}]\n`;
            } else if (type === "note" && title) {
              header = `[Note: ${title}]\n`;
            }

            return header + doc.content;
          })
          .join("\n\n") || "";

      const dateContext = hasTemporalFilter
        ? `\nTemporal Context: User is asking about "${temporalIntent.type.replace("_", " ")}" (${formatDateRange(temporalIntent.startDate, temporalIntent.endDate)})`
        : "";

      const prompt = isHalloweenMode
        ? `You are a Keeper of the Grimoire (a mystical knowledge base).
User Question: "${query}"${dateContext}

Relevant Knowledge from the Grimoire:
${context || "The pages are blank for this period..."}

Instructions:
- Answer based ONLY on the knowledge above
- If documents were found, summarize them clearly
- If the Grimoire is empty for this period, say: "The Grimoire holds no records for ${temporalIntent.type === "tomorrow" ? "the morrow" : temporalIntent.type === "yesterday" ? "yesternight" : "this time"}..."
- Keep the answer slightly mysterious but helpful`
        : `You are an AI assistant helping to search through the user's journal entries and personal knowledge base.
User Question: "${query}"${dateContext}

Relevant Information:
${context || "No relevant information found for this time period."}

Instructions:
- Answer based ONLY on the information above
- If documents were found, provide a clear, organized summary
- If no information exists for the requested time period, politely explain: "I don't have any entries for ${temporalIntent.type.replace("_", " ")}. ${documents && documents.length > 0 ? "Here are your most recent entries instead." : "Your most recent entry is from a different date."}"
- Be concise and helpful`;

      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const model = "gemini-flash-lite-latest";

      const response = await ai.models.generateContentStream({
        model,
        contents: prompt,
      });

      let fullText = "";
      for await (const chunk of response) {
        const chunkText = chunk.text || "";
        fullText += chunkText;
        setCompletion(fullText);
      }

      return fullText;
    } catch (error) {
      console.error("Grimoire search error:", error);
      toast.error(
        isHalloweenMode
          ? "The spirits cannot find what you seek..."
          : "Search failed. Please try again.",
      );
      return null;
    } finally {
      setIsGhostWriting(false);
    }
  };

  const removeFromGrimoire = async (
    contentType: string,
    originalId: string,
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from("search_index")
        .delete()
        .eq("user_id", user.id)
        .contains("metadata", { type: contentType, original_id: originalId });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Failed to remove from search index:", error);
      return false;
    }
  };

  return {
    consultSpirits,
    addToGrimoire,
    askTheGrimoire,
    removeFromGrimoire,
    isGhostWriting,
    completion,
  };
};
