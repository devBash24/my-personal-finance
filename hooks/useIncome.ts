"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type PrimaryIncome = {
  id: string;
  grossIncome: string;
  taxDeduction: string;
  nisDeduction: string;
  otherDeductions: string;
  netIncome: string;
};

export type AdditionalIncomeRow = {
  id: string;
  label: string;
  amount: string;
};

type IncomeData = {
  primary: PrimaryIncome | null;
  additional: AdditionalIncomeRow[];
};

async function fetchIncome(month: number, year: number): Promise<IncomeData> {
  const res = await fetch(`/api/income?month=${month}&year=${year}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load income");
  return res.json();
}

export function useIncome(month: number, year: number) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["income", month, year],
    queryFn: () => fetchIncome(month, year),
    refetchOnWindowFocus: false,
  });

  const upsertMutation = useMutation({
    mutationFn: async (data: {
      month: number;
      year: number;
      grossIncome: string;
      taxDeduction: string;
      nisDeduction: string;
      otherDeductions: string;
      netIncome: string;
    }) => {
      const res = await fetch("/api/income", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to save income");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["income", variables.month, variables.year],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });

  const createAdditionalMutation = useMutation({
    mutationFn: async (data: {
      month: number;
      year: number;
      label: string;
      amount: string;
    }) => {
      const res = await fetch("/api/income/additional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to add additional income");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["income", variables.month, variables.year],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });

  const updateAdditionalMutation = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: string; label?: string; amount?: string }) => {
      const res = await fetch(`/api/income/additional/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to update additional income");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });

  const deleteAdditionalMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/income/additional/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to delete additional income");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });

  return {
    data: query.data,
    primary: query.data?.primary ?? null,
    additional: query.data?.additional ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    upsertIncome: upsertMutation.mutateAsync,
    createAdditionalIncome: createAdditionalMutation.mutateAsync,
    updateAdditionalIncome: updateAdditionalMutation.mutateAsync,
    deleteAdditionalIncome: deleteAdditionalMutation.mutateAsync,
    isUpserting: upsertMutation.isPending,
    isCreatingAdditional: createAdditionalMutation.isPending,
    isUpdatingAdditional: updateAdditionalMutation.isPending,
    isDeletingAdditional: deleteAdditionalMutation.isPending,
  };
}
