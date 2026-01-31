"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type SavingsAccountRow = {
  id: string;
  name: string;
  initialBalance: string;
  targetAmount: string | null;
};

export type SavingsTransactionRow = {
  id: string;
  accountId: string;
  accountName: string;
  amount: string;
};

type SavingsData = {
  accounts: SavingsAccountRow[];
  transactions: SavingsTransactionRow[];
};

async function fetchSavings(
  month: number,
  year: number
): Promise<SavingsData> {
  const res = await fetch(
    `/api/savings?month=${month}&year=${year}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to load savings");
  return res.json();
}

export function useSavings(month: number, year: number) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["savings", month, year],
    queryFn: () => fetchSavings(month, year),
    refetchOnWindowFocus: false,
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      initialBalance?: string;
      targetAmount?: string;
    }) => {
      const res = await fetch("/api/savings/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to create account");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      initialBalance?: string;
      targetAmount?: string;
    }) => {
      const res = await fetch(`/api/savings/accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to update account");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/savings/accounts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to delete account");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: {
      month: number;
      year: number;
      accountId: string;
      amount: string;
    }) => {
      const res = await fetch("/api/savings/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to add contribution");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["savings", variables.month, variables.year],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/savings/transactions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to delete transaction");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });

  return {
    accounts: query.data?.accounts ?? [],
    transactions: query.data?.transactions ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    createAccount: createAccountMutation.mutateAsync,
    updateAccount: updateAccountMutation.mutateAsync,
    deleteAccount: deleteAccountMutation.mutateAsync,
    createTransaction: createTransactionMutation.mutateAsync,
    deleteTransaction: deleteTransactionMutation.mutateAsync,
    isCreatingAccount: createAccountMutation.isPending,
    isUpdatingAccount: updateAccountMutation.isPending,
    isDeletingAccount: deleteAccountMutation.isPending,
    isCreatingTransaction: createTransactionMutation.isPending,
    isDeletingTransaction: deleteTransactionMutation.isPending,
  };
}
