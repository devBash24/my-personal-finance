"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type GoalRow = {
  id: string;
  name: string;
  targetAmount: string;
  targetDate: string | null;
  accountIds: string[];
  progress: number;
};

export type AccountRow = {
  id: string;
  name: string;
  initialBalance: string;
};

type GoalsData = {
  goals: GoalRow[];
  accounts: AccountRow[];
};

async function fetchGoals(): Promise<GoalsData> {
  const res = await fetch("/api/goals", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load goals");
  return res.json();
}

export function useGoals() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["goals"],
    queryFn: fetchGoals,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      targetAmount: string;
      targetDate?: string | null;
    }) => {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to create goal");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
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
      targetAmount?: string;
      targetDate?: string | null;
    }) => {
      const res = await fetch(`/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to update goal");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to delete goal");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });

  const linkMutation = useMutation({
    mutationFn: async ({
      goalId,
      accountId,
    }: {
      goalId: string;
      accountId: string;
    }) => {
      const res = await fetch(`/api/goals/${goalId}/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to link account");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: async ({
      goalId,
      accountId,
    }: {
      goalId: string;
      accountId: string;
    }) => {
      const res = await fetch(`/api/goals/${goalId}/link/${accountId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to unlink account");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });

  return {
    goals: query.data?.goals ?? [],
    accounts: query.data?.accounts ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    createGoal: createMutation.mutateAsync,
    updateGoal: updateMutation.mutateAsync,
    deleteGoal: deleteMutation.mutateAsync,
    linkAccount: linkMutation.mutateAsync,
    unlinkAccount: unlinkMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
