import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Account,
  AccountUsageLog,
  CreateAccountData,
  LogUsageData,
  UpdateAccountData,
} from "@/types/account";

export const useAccounts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading: loading } = useQuery({
    queryKey: ["accounts", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching accounts:", error);
        throw error;
      }

      const accountsWithCalculatedUsage = await Promise.all(
        (data || []).map(async (account) => {
          if (!account.is_active) {
            return account as Account;
          }

          if (account.reset_period === "never") {
            return account as Account;
          }

          const now = new Date();
          let resetStartDate: Date;

          switch (account.reset_period) {
            case "daily":
              resetStartDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
              );
              break;
            case "weekly": {
              const dayOfWeek = now.getDay();
              resetStartDate = new Date(now);
              resetStartDate.setDate(now.getDate() - dayOfWeek);
              resetStartDate.setHours(0, 0, 0, 0);
              break;
            }
            case "monthly":
              resetStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
              break;
            case "yearly":
              resetStartDate = new Date(now.getFullYear(), 0, 1);
              break;
            default:
              return account as Account;
          }

          let resetEndDate: Date;
          switch (account.reset_period) {
            case "daily":
              resetEndDate = new Date(resetStartDate);
              resetEndDate.setDate(resetEndDate.getDate() + 1);
              break;
            case "weekly":
              resetEndDate = new Date(resetStartDate);
              resetEndDate.setDate(resetEndDate.getDate() + 7);
              break;
            case "monthly":
              resetEndDate = new Date(
                resetStartDate.getFullYear(),
                resetStartDate.getMonth() + 1,
                1,
              );
              break;
            case "yearly":
              resetEndDate = new Date(resetStartDate.getFullYear() + 1, 0, 1);
              break;
            default:
              resetEndDate = new Date();
          }

          const { data: logs, error: logsError } = await supabase
            .from("account_usage_logs")
            .select("amount")
            .eq("account_id", account.id)
            .gte("timestamp", resetStartDate.toISOString())
            .lt("timestamp", resetEndDate.toISOString());

          if (logsError) {
            console.error(
              `Error fetching usage logs for account ${account.id}:`,
              logsError,
            );
            return account as Account;
          }

          const currentPeriodUsage =
            logs?.reduce((sum, log) => sum + log.amount, 0) || 0;

          return {
            ...account,
            current_usage: currentPeriodUsage,
          } as Account;
        }),
      );

      return accountsWithCalculatedUsage;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const { data: usageLogs = [] } = useQuery({
    queryKey: ["usageLogs", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("account_usage_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Error fetching usage logs:", error);
        throw error;
      }

      return data as AccountUsageLog[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const createAccountMutation = useMutation({
    mutationFn: async (accountData: CreateAccountData) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("accounts")
        .insert({
          ...accountData,
          user_id: user.id,
          current_usage: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts", user?.id] });
      toast.success("Account created successfully");
    },
    onError: (error) => {
      console.error("Error creating account:", error);
      toast.error("Failed to create account");
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({
      accountId,
      updates,
    }: {
      accountId: string;
      updates: UpdateAccountData;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("accounts")
        .update(updates)
        .eq("id", accountId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts", user?.id] });
      toast.success("Account updated successfully");
    },
    onError: (error) => {
      console.error("Error updating account:", error);
      toast.error("Failed to update account");
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (accountId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", accountId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts", user?.id] });
      toast.success("Account deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    },
  });

  const logUsageMutation = useMutation({
    mutationFn: async (usageData: LogUsageData) => {
      if (!user) throw new Error("User not authenticated");

      const { error: logError } = await supabase
        .from("account_usage_logs")
        .insert({
          ...usageData,
          user_id: user.id,
        });

      if (logError) throw logError;

      // Update account usage
      const { data: accountData, error: fetchError } = await supabase
        .from("accounts")
        .select("current_usage")
        .eq("id", usageData.account_id)
        .eq("user_id", user.id)
        .single();

      if (fetchError) throw fetchError;

      const newUsage = (accountData.current_usage || 0) + usageData.amount;
      const { error: updateError } = await supabase
        .from("accounts")
        .update({ current_usage: newUsage })
        .eq("id", usageData.account_id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["usageLogs", user?.id] });
      // We don't show a toast here because the modal usually handles success feedback
      // or we can add it here if needed. The original code had toast.error but not always success.
      // Actually original code had toast.error on failure.
    },
    onError: (error) => {
      console.error("Error logging usage:", error);
      toast.error("Failed to log usage");
    },
  });

  const updateUsageLogMutation = useMutation({
    mutationFn: async ({
      logId,
      updates,
    }: {
      logId: string;
      updates: Partial<AccountUsageLog>;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("account_usage_logs")
        .update(updates)
        .eq("id", logId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["usageLogs", user?.id] });
      toast.success("Usage log updated successfully");
    },
    onError: (error) => {
      console.error("Error updating usage log:", error);
      toast.error("Failed to update usage log");
    },
  });

  const deleteUsageLogMutation = useMutation({
    mutationFn: async (logId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("account_usage_logs")
        .delete()
        .eq("id", logId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["usageLogs", user?.id] });
      toast.success("Usage log deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting usage log:", error);
      toast.error("Failed to delete usage log");
    },
  });

  const getAccountByTitle = (title: string) => {
    return accounts.find((account) => account.title === title);
  };

  const getAccountsByPlatform = (platform: string) => {
    return accounts.filter((account) => account.platform === platform);
  };

  const getActiveAccounts = () => {
    return accounts.filter((account) => account.is_active);
  };

  const getAccountUsagePercentage = (account: Account) => {
    if (!account.usage_limit || account.usage_limit <= 0) return 0;
    return (account.current_usage / account.usage_limit) * 100;
  };

  return {
    accounts,
    usageLogs,
    loading,
    fetchAccounts: () =>
      queryClient.invalidateQueries({ queryKey: ["accounts", user?.id] }),
    refreshAccounts: () =>
      queryClient.invalidateQueries({ queryKey: ["accounts", user?.id] }),
    createAccount: (data: CreateAccountData) =>
      createAccountMutation.mutateAsync(data),
    updateAccount: (accountId: string, updates: UpdateAccountData) =>
      updateAccountMutation.mutateAsync({ accountId, updates }),
    deleteAccount: (accountId: string) =>
      deleteAccountMutation.mutateAsync(accountId),
    logUsage: (data: LogUsageData) => logUsageMutation.mutateAsync(data),
    updateUsageLog: (logId: string, updates: Partial<AccountUsageLog>) =>
      updateUsageLogMutation.mutateAsync({ logId, updates }),
    deleteUsageLog: (logId: string) =>
      deleteUsageLogMutation.mutateAsync(logId),
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["usageLogs", user?.id] });
    },
    getAccountByTitle,
    getAccountsByPlatform,
    getActiveAccounts,
    getAccountUsagePercentage,
  };
};
