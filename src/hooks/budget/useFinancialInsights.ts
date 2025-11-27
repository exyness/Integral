import { useState } from "react";
import { SpookyAIMode, useSpookyAI } from "@/hooks/useSpookyAI";
import { Budget, BudgetTransaction } from "@/types/budget";

export type InsightType =
  | "horror"
  | "subscriptions"
  | "forecast"
  | "allocation";

export const useFinancialInsights = (
  transactions: BudgetTransaction[],
  budgets: Budget[],
  currency: string,
  mode: "spooky" | "normal" = "spooky",
) => {
  const { consultSpirits, isGhostWriting, completion } = useSpookyAI();
  // Load state from localStorage on mount
  const [insight, setInsight] = useState<string | null>(() => {
    return localStorage.getItem("financial_insight_result");
  });
  const [currentType, setCurrentType] = useState<InsightType>(() => {
    return (
      (localStorage.getItem("financial_insight_type") as InsightType) ||
      "horror"
    );
  });

  const generateInsight = async (type: InsightType) => {
    setCurrentType(type);
    localStorage.setItem("financial_insight_type", type);
    setInsight(null);

    // Calculate Stats
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const quickExpenses = transactions
      .filter((t) => !t.budget_id)
      .reduce((sum, t) => sum + t.amount, 0);

    const grandTotalSpent = totalSpent + quickExpenses;
    const remaining = totalBudget - grandTotalSpent;
    const isOverBudget = remaining < 0;

    // Filter for last 30 days
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

    // Prepare Data String
    const dataSummary = `
      Currency: ${currency}
      Total Budget: ${totalBudget}
      Total Spent: ${grandTotalSpent}
      Remaining: ${remaining}
      Status: ${isOverBudget ? "OVER BUDGET" : "Under Budget"}
      
      Top Expense Category (Last 30 Days): ${topCategory ? `${topCategory[0]} (${topCategory[1]})` : "None"}
      
      Recent Transactions Sample (Last 10):
      ${recentTransactions
        .slice(0, 10)
        .map((t) => `- ${t.description}: ${t.amount} (${t.category})`)
        .join("\n")}
    `;

    let aiMode: SpookyAIMode = "financial_horror";

    switch (type) {
      case "subscriptions":
        aiMode = "subscription_analysis";
        break;
      case "forecast":
        aiMode = "budget_forecast";
        break;
      case "allocation":
        aiMode = "smart_allocation";
        break;
      case "horror":
      default:
        aiMode = "financial_horror";
        break;
    }

    const result = await consultSpirits(dataSummary, aiMode, mode);
    if (result) {
      setInsight(result);
      localStorage.setItem("financial_insight_result", result);
    }
  };

  return {
    generateInsight,
    insight,
    isGhostWriting,
    completion,
    currentType,
  };
};
