import { useState } from "react";
import { useSpookyAI } from "@/hooks/useSpookyAI";
import { Budget, BudgetTransaction } from "@/types/budget";

export const useFinancialHorror = (
  transactions: BudgetTransaction[],
  budgets: Budget[],
  currency: string,
) => {
  const { consultSpirits, isGhostWriting, completion } = useSpookyAI();
  const [horrorStory, setHorrorStory] = useState<string | null>(null);

  const analyzeFinances = async () => {
    // Calculate Stats
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const quickExpenses = transactions
      .filter((t) => !t.budget_id)
      .reduce((sum, t) => sum + t.amount, 0);

    const grandTotalSpent = totalSpent + quickExpenses;
    const remaining = totalBudget - grandTotalSpent;
    const isOverBudget = remaining < 0;

    // Filter for last 30 days for specific examples
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = transactions.filter(
      (t) => new Date(t.transaction_date) >= thirtyDaysAgo,
    );

    // Group by category
    const categoryTotals = recentTransactions.reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Find top category
    const topCategory = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1],
    )[0];

    const prompt = `
      Currency: ${currency}
      Total Budget: ${totalBudget}
      Total Spent: ${grandTotalSpent}
      Remaining: ${remaining}
      Status: ${isOverBudget ? "OVER BUDGET (Horrifying!)" : "Under Budget (Safe... for now)"}
      
      Top Expense Category (Last 30 Days): ${topCategory ? `${topCategory[0]} (${topCategory[1]})` : "None"}
      
      Recent Transactions Sample:
      ${recentTransactions
        .slice(0, 5)
        .map((t) => `- ${t.description}: ${t.amount} (${t.category})`)
        .join("\n")}
    `;

    const story = await consultSpirits(prompt, "financial_horror");
    if (story) {
      setHorrorStory(story);
    }
  };

  return {
    analyzeFinances,
    horrorStory,
    isGhostWriting,
    completion,
  };
};
