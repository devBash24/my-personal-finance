"use client";

import { useQuery } from "@tanstack/react-query";

export type ChangesRow = {
  id: string;
  label: string;
  month: number;
  year: number;
  income: number;
  expenses: number;
  savings: number;
  subscriptions: number;
  deltaIncome: number | null;
  deltaExpenses: number | null;
  deltaSavings: number | null;
};

type ChangesData = {
  data: ChangesRow[];
};

async function fetchChanges(
  limit: 6 | 12 | "all"
): Promise<ChangesData> {
  const res = await fetch(
    `/api/dashboard/changes?limit=${limit}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to load dashboard changes");
  return res.json();
}

export function useDashboardChanges(limit: 6 | 12 | "all" = 12) {
  return useQuery<ChangesData>({
    queryKey: ["dashboard", "changes", limit],
    queryFn: () => fetchChanges(limit),
    refetchOnWindowFocus: false,
  });
}
