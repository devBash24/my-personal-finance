"use client";

import { useQuery } from "@tanstack/react-query";

export type DashboardOverview = {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  totalSavings?: number;
  subscriptionsTotal?: number;
  goals: Array<{
    id: string;
    title?: string;
    target?: number;
    current?: number;
    due?: string | null;
  }>;
  debts: Array<{
    id: string;
    name?: string;
    balance?: number;
    rate?: number;
    progress?: number;
  }>;
  savings: Array<{
    id: string;
    name?: string;
    saved?: number;
    target?: number;
  }>;
  expenses: Array<{
    id: string;
    category?: string;
    amount?: number;
    change?: number;
  }>;
};

async function fetchOverview(month: number, year: number): Promise<DashboardOverview> {
  const res = await fetch(
    `/api/dashboard/overview?month=${month}&year=${year}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("Failed to load dashboard overview");
  }
  return res.json();
}

export function useDashboardOverview(month: number, year: number) {
  return useQuery<DashboardOverview>({
    queryKey: ["dashboard", "overview", month, year],
    queryFn: () => fetchOverview(month, year),
    refetchOnWindowFocus: false,
  });
}
