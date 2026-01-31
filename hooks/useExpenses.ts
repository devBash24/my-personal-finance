"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type ExpenseRow = {
  id: string;
  name: string;
  amount: string;
  categoryId: string;
  categoryName: string;
};

export type Category = { id: string; name: string; type: string };

async function fetchExpenses(month: number, year: number) {
  const res = await fetch(`/api/expenses?month=${month}&year=${year}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load expenses");
  const data = await res.json();
  return data.expenses as ExpenseRow[];
}

async function fetchCategories() {
  const res = await fetch("/api/expenses/categories", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load categories");
  return res.json() as Promise<Category[]>;
}

export function useExpenses(month: number, year: number) {
  const queryClient = useQueryClient();
  const expensesQuery = useQuery({
    queryKey: ["expenses", month, year],
    queryFn: () => fetchExpenses(month, year),
    refetchOnWindowFocus: false,
  });
  const categoriesQuery = useQuery({
    queryKey: ["expenses", "categories"],
    queryFn: fetchCategories,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: async (body: {
      month: number;
      year: number;
      name: string;
      amount: string;
      categoryId: string;
    }) => {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to create expense");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["expenses", variables.month, variables.year],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      amount?: string;
      categoryId?: string;
    }) => {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to update expense");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to delete expense");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });

  return {
    expenses: expensesQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    isLoading: expensesQuery.isLoading || categoriesQuery.isLoading,
    isFetching: expensesQuery.isFetching,
    error: expensesQuery.error,
    refetch: expensesQuery.refetch,
    createExpense: createMutation.mutateAsync,
    updateExpense: updateMutation.mutateAsync,
    deleteExpense: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
