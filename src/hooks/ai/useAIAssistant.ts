import { useState } from "react";
import { toast } from "sonner";
import { ai } from "@/lib/gemini";

export type AIIntent =
  | "create_task"
  | "create_note"
  | "create_journal"
  | "create_transaction"
  | "create_recurring"
  | "create_budget"
  | "create_category"
  | "create_financial_account"
  | "create_goal"
  | "contribute_goal"
  | "create_liability"
  | "transfer_funds"
  | "create_account"
  | "search_knowledge"
  | "general_chat"
  | "unknown";

interface TaskParams {
  title: string;
  description?: string;
  due_date?: string;
  priority?: "low" | "medium" | "high";
}

interface TransactionParams {
  amount: number;
  description: string;
  category?: string;
  type: "expense" | "income";
}

interface NoteParams {
  content: string;
}

type AIParams =
  | TaskParams
  | TransactionParams
  | NoteParams
  | Record<string, unknown>;

interface AIResponse {
  intent: AIIntent;
  params: AIParams;
  confirmationMessage: string;
  originalQuery: string;
}

export const useAIAssistant = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const parseMentions = (text: string): AIIntent | null => {
    const lowerText = text.toLowerCase();
    if (lowerText.startsWith("@task")) return "create_task";
    if (lowerText.startsWith("@note")) return "create_note";
    if (lowerText.startsWith("@journal")) return "create_journal";
    if (lowerText.startsWith("@transaction")) return "create_transaction";
    if (lowerText.startsWith("@recurring")) return "create_recurring";
    if (lowerText.startsWith("@budget")) return "create_budget";
    if (lowerText.startsWith("@category")) return "create_category";
    if (lowerText.startsWith("@goal")) {
      if (
        lowerText.includes("add") ||
        lowerText.includes("contribute") ||
        lowerText.includes("deposit")
      ) {
        return "contribute_goal";
      }
      return "create_goal";
    }
    if (lowerText.startsWith("@contribute") || lowerText.startsWith("@deposit"))
      return "contribute_goal";
    if (lowerText.startsWith("@liability") || lowerText.startsWith("@debt"))
      return "create_liability";
    if (lowerText.startsWith("@transfer")) return "transfer_funds";
    if (lowerText.startsWith("@account") || lowerText.startsWith("@credential"))
      return "create_account";
    // @finance is smart - detects account creation vs transaction
    if (lowerText.startsWith("@finance")) {
      if (lowerText.includes("account") || lowerText.includes("balance")) {
        return "create_financial_account";
      }
      return "create_transaction";
    }
    return null;
  };

  const processQuery = async (query: string): Promise<AIResponse | null> => {
    setIsProcessing(true);
    try {
      // 1. Check for explicit mentions
      let intent = parseMentions(query);
      let cleanQuery = query;

      if (intent) {
        // Remove the mention from the query
        cleanQuery = query.replace(/^@\w+\s*/, "");
      }

      // 2. If no mention, ask Gemini to classify intent
      if (!intent) {
        const intentPrompt = `Classify the user's intent from this text: "${query}"
Possible intents:
- create_task (e.g., "remind me to...", "add task...", "buy milk")
- create_note (e.g., "note that...", "save idea...", "remember to")
- create_journal (e.g., "dear diary...", "today I...", "I felt...")
- create_transaction (e.g., "spent $50...", "bought pizza...", "paid rent")
- create_recurring (e.g., "monthly subscription", "recurring payment", "auto-pay rent")
- create_budget (e.g., "create budget", "set budget for groceries", "monthly budget")
- create_category (e.g., "add category", "new expense category", "create category for...")
- create_goal (e.g., "save for vacation", "goal to buy laptop", "emergency fund target")
- contribute_goal (e.g., "add 5000 to vacation goal", "contribute to emergency fund", "deposit 2000 to laptop goal")
- create_liability (e.g., "track loan", "add mortgage", "credit card debt")
- transfer_funds (e.g., "transfer money", "move funds", "transfer $100 from...")
- create_account (e.g., "save my Netflix login", "store my GitHub credentials", "add account for...")
- search_knowledge (e.g., "what did I do...", "search for...", "find...", "show me...", "when did I...", "list my...", "do I have...", "where is...")
- general_chat (e.g., "hello", "tell me a joke", "how are you", "what is the capital of...")

Return ONLY the intent name.`;

        const result = await ai.models.generateContent({
          model: "gemini-flash-lite-latest",
          contents: intentPrompt,
        });

        const text = result.text?.trim().toLowerCase();
        if (
          text &&
          [
            "create_task",
            "create_note",
            "create_journal",
            "create_transaction",
            "create_recurring",
            "create_budget",
            "create_category",
            "create_goal",
            "contribute_goal",
            "create_liability",
            "create_financial_account",
            "transfer_funds",
            "create_account",
            "search_knowledge",
            "general_chat",
          ].includes(text)
        ) {
          intent = text as AIIntent;
        } else {
          intent = "general_chat";
        }
      }

      // 3. Extract parameters based on intent
      let params: AIParams = {};
      let confirmationMessage = "";

      if (intent === "create_task") {
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        // Default due date: 7 days from now
        const defaultDueDate = new Date(today);
        defaultDueDate.setDate(defaultDueDate.getDate() + 7);
        const defaultDueDateStr = defaultDueDate.toISOString().split("T")[0];

        const paramPrompt = `Extract task parameters from: "${cleanQuery}"

Return ONLY valid JSON in this exact format:
{ "title": string, "description": string, "priority": "low"|"medium"|"high" }

Do NOT include a due_date field. Just extract the title and priority.
If no description provided, generate a brief helpful one. Return valid JSON only.`;
        const result = await ai.models.generateContent({
          model: "gemini-flash-lite-latest",
          contents: paramPrompt,
        });
        const jsonText = result.text?.replace(/```json|```/g, "").trim();
        try {
          const parsedParams = JSON.parse(jsonText || "{}") as TaskParams;

          // Always set due date to 7 days from now
          parsedParams.due_date = defaultDueDateStr;

          // Generate description if not provided
          if (
            !parsedParams.description ||
            parsedParams.description.trim() === ""
          ) {
            const descPrompt = `Generate a brief, helpful description (1-2 sentences) for this task: "${parsedParams.title}"`;
            const descResult = await ai.models.generateContent({
              model: "gemini-flash-lite-latest",
              contents: descPrompt,
            });
            parsedParams.description = descResult.text?.trim() || "";
          }

          params = parsedParams;
          confirmationMessage = `I'll create a task: "${parsedParams.title}"${parsedParams.due_date ? ` due ${parsedParams.due_date}` : ""}.`;
        } catch (e) {
          console.error("Failed to parse JSON params", e);
          params = { title: cleanQuery };
          confirmationMessage = `I'll create a task: "${cleanQuery}".`;
        }
      } else if (intent === "create_note") {
        params = { content: cleanQuery };
        confirmationMessage = "I'll save this note.";
      } else if (intent === "create_journal") {
        params = { content: cleanQuery };
        confirmationMessage = "I'll add this to your journal.";
      } else if (intent === "create_transaction") {
        const paramPrompt = `Extract transaction parameters from: "${cleanQuery}"
Return JSON: { "amount": number, "description": string, "category": string (guess one), "type": "expense"|"income" }`;
        const result = await ai.models.generateContent({
          model: "gemini-flash-lite-latest",
          contents: paramPrompt,
        });
        const jsonText = result.text?.replace(/```json|```/g, "").trim();
        try {
          const parsedParams = JSON.parse(
            jsonText || "{}",
          ) as TransactionParams;
          params = parsedParams;
          confirmationMessage = `I'll track a ${parsedParams.type}: ${parsedParams.description} ($${parsedParams.amount}).`;
        } catch (e) {
          params = { description: cleanQuery };
          confirmationMessage =
            "I couldn't understand the transaction details.";
        }
      } else if (intent === "create_budget") {
        const paramPrompt = `Extract budget parameters from: "${cleanQuery}"
Return JSON: { "name": string, "amount": number, "period": "weekly"|"monthly"|"yearly" }
If period not mentioned, use "monthly". Example: "set 500 for haircut" -> {"name": "haircut", "amount": 500, "period": "monthly"}`;
        const result = await ai.models.generateContent({
          model: "gemini-flash-lite-latest",
          contents: paramPrompt,
        });
        const jsonText = result.text?.replace(/```json|```/g, "").trim();
        try {
          const parsedParams = JSON.parse(jsonText || "{}");
          params = parsedParams;
          confirmationMessage = `I'll create a ${parsedParams.period} budget: ${parsedParams.name} ($${parsedParams.amount}).`;
        } catch (e) {
          params = {};
          confirmationMessage = "I'll help you create a budget.";
        }
      } else if (intent === "create_recurring") {
        const paramPrompt = `Extract recurring payment parameters from: "${cleanQuery}"
Return JSON: { "description": string, "amount": number, "frequency": "daily"|"weekly"|"monthly"|"yearly", "type": "expense"|"income" }`;
        const result = await ai.models.generateContent({
          model: "gemini-flash-lite-latest",
          contents: paramPrompt,
        });
        const jsonText = result.text?.replace(/```json|```/g, "").trim();
        try {
          const parsedParams = JSON.parse(jsonText || "{}");
          params = parsedParams;
          confirmationMessage = `I'll set up a ${parsedParams.frequency} recurring ${parsedParams.type}: ${parsedParams.description} ($${parsedParams.amount}).`;
        } catch (e) {
          params = {};
          confirmationMessage = "I'll help you set up a recurring payment.";
        }
      } else if (intent === "create_category") {
        const paramPrompt = `Extract category parameters from: "${cleanQuery}"
Return JSON: { "name": string, "type": "expense"|"income" }`;
        const result = await ai.models.generateContent({
          model: "gemini-flash-lite-latest",
          contents: paramPrompt,
        });
        const jsonText = result.text?.replace(/```json|```/g, "").trim();
        try {
          const parsedParams = JSON.parse(jsonText || "{}");
          params = parsedParams;
          confirmationMessage = `I'll create a ${parsedParams.type} category: ${parsedParams.name}.`;
        } catch (e) {
          params = {};
          confirmationMessage = "I'll help you create a category.";
        }
      } else if (intent === "create_financial_account") {
        const paramPrompt = `Extract financial account parameters from: "${cleanQuery}"
Return JSON: { "name": string, "type": "cash"|"bank"|"credit_card"|"digital_wallet"|"investment"|"savings", "balance": number }
Rules:
- Extract a specific account name if mentioned (e.g., "HDFC Bank", "Chase Savings", "Emergency Fund")
- If NO specific name is mentioned, return "name": null
- If type not mentioned, use "bank"
Examples:
- "create HDFC savings account with 50000" -> {"name": "HDFC Savings", "type": "savings", "balance": 50000}
- "create account with 50000 balance" -> {"name": null, "type": "bank", "balance": 50000}`;
        const result = await ai.models.generateContent({
          model: "gemini-flash-lite-latest",
          contents: paramPrompt,
        });
        const jsonText = result.text?.replace(/```json|```/g, "").trim();
        try {
          const parsedParams = JSON.parse(jsonText || "{}");
          params = parsedParams;

          if (
            parsedParams.name &&
            parsedParams.type &&
            parsedParams.balance !== undefined
          ) {
            confirmationMessage = `I'll create a ${parsedParams.type} account: ${parsedParams.name} with balance ${parsedParams.balance}.`;
          } else {
            confirmationMessage = "I'll help you create a financial account.";
          }
        } catch (e) {
          params = {};
          confirmationMessage = "I'll help you create a financial account.";
        }
      } else if (intent === "create_goal") {
        const paramPrompt = `Extract financial goal parameters from: "${cleanQuery}"
Return JSON: { "name": string, "target_amount": number, "current_amount": number, "target_date": string }
Rules:
- Extract goal name/purpose
- Extract target amount
- Current amount defaults to 0 if not mentioned
- Target date in YYYY-MM-DD format (estimate if vague)
Examples:
- "save 50000 for vacation by December" -> {"name": "Vacation", "target_amount": 50000, "current_amount": 0, "target_date": "2025-12-31"}
- "emergency fund goal 100000" -> {"name": "Emergency Fund", "target_amount": 100000, "current_amount": 0, "target_date": "2026-12-31"}`;
        const result = await ai.models.generateContent({
          model: "gemini-flash-lite-latest",
          contents: paramPrompt,
        });
        const jsonText = result.text?.replace(/```json|```/g, "").trim();
        try {
          const parsedParams = JSON.parse(jsonText || "{}");
          params = parsedParams;
          confirmationMessage = `I'll create a goal: ${parsedParams.name} (Target: ${parsedParams.target_amount}).`;
        } catch (e) {
          params = {};
          confirmationMessage = "I'll help you create a financial goal.";
        }
      } else if (intent === "contribute_goal") {
        const paramPrompt = `Extract goal contribution parameters from: "${cleanQuery}"
Return JSON: { "goal_name": string, "amount": number, "from_account": string }
Rules:
- Extract the goal name (partial match is ok)
- Extract the contribution amount
- Extract source account name if mentioned (optional)
Examples:
- "add 5000 to vacation goal from savings" -> {"goal_name": "vacation", "amount": 5000, "from_account": "savings"}
- "contribute 2000 to emergency fund" -> {"goal_name": "emergency", "amount": 2000, "from_account": null}
- "deposit 1000 to laptop from checking" -> {"goal_name": "laptop", "amount": 1000, "from_account": "checking"}
- "500 to vacation" -> {"goal_name": "vacation", "amount": 500, "from_account": null}`;
        const result = await ai.models.generateContent({
          model: "gemini-flash-lite-latest",
          contents: paramPrompt,
        });
        const jsonText = result.text?.replace(/```json|```/g, "").trim();
        try {
          const parsedParams = JSON.parse(jsonText || "{}");
          params = parsedParams;
          if (parsedParams.from_account) {
            confirmationMessage = `I'll add ${parsedParams.amount} to your ${parsedParams.goal_name} goal from ${parsedParams.from_account}.`;
          } else {
            confirmationMessage = `I'll add ${parsedParams.amount} to your ${parsedParams.goal_name} goal.`;
          }
        } catch (e) {
          params = {};
          confirmationMessage = "I'll help you contribute to a goal.";
        }
      } else if (intent === "create_liability") {
        const paramPrompt = `Extract liability parameters from: "${cleanQuery}"
Return JSON: { "name": string, "type": "loan"|"credit_card"|"mortgage"|"other", "amount": number, "interest_rate": number, "minimum_payment": number, "due_date": string }
Rules:
- Extract liability name
- Detect type (loan, credit card, mortgage, other)
- Extract amount owed
- Interest rate (default 0 if not mentioned)
- Minimum payment (default 0 if not mentioned)
- Due date in YYYY-MM-DD format
Examples:
- "track car loan 500000 at 8% interest" -> {"name": "Car Loan", "type": "loan", "amount": 500000, "interest_rate": 8, "minimum_payment": 0, "due_date": "2026-01-01"}
- "credit card debt 25000" -> {"name": "Credit Card", "type": "credit_card", "amount": 25000, "interest_rate": 0, "minimum_payment": 0, "due_date": "2025-12-31"}`;
        const result = await ai.models.generateContent({
          model: "gemini-flash-lite-latest",
          contents: paramPrompt,
        });
        const jsonText = result.text?.replace(/```json|```/g, "").trim();
        try {
          const parsedParams = JSON.parse(jsonText || "{}");
          params = parsedParams;
          confirmationMessage = `I'll track liability: ${parsedParams.name} (${parsedParams.type}, Amount: ${parsedParams.amount}).`;
        } catch (e) {
          params = {};
          confirmationMessage = "I'll help you track a liability.";
        }
      } else if (intent === "transfer_funds") {
        const paramPrompt = `Extract transfer parameters from: "${cleanQuery}"
Return JSON: { "amount": number, "from_account": string, "to_account": string }
Examples:
- "transfer 1000 from savings to checking" -> {"amount": 1000, "from_account": "savings", "to_account": "checking"}
- "move 500 from NIC to HDFC" -> {"amount": 500, "from_account": "NIC", "to_account": "HDFC"}`;
        const result = await ai.models.generateContent({
          model: "gemini-flash-lite-latest",
          contents: paramPrompt,
        });
        const jsonText = result.text?.replace(/```json|```/g, "").trim();
        try {
          const parsedParams = JSON.parse(jsonText || "{}");
          params = parsedParams;
          if (
            parsedParams.amount &&
            parsedParams.from_account &&
            parsedParams.to_account
          ) {
            confirmationMessage = `I'll transfer ${parsedParams.amount} from ${parsedParams.from_account} to ${parsedParams.to_account}.`;
          } else {
            confirmationMessage = "I'll help you transfer funds.";
          }
        } catch (e) {
          params = {};
          confirmationMessage = "I'll help you transfer funds.";
        }
      } else if (intent === "search_knowledge") {
        confirmationMessage = "Searching your second brain...";
      } else {
        confirmationMessage = "";
      }

      return {
        intent: intent || "unknown",
        params,
        confirmationMessage,
        originalQuery: query,
      };
    } catch (error) {
      console.error("AI processing error:", error);
      toast.error("My brain hurts... try again?");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processQuery,
    isProcessing,
  };
};
