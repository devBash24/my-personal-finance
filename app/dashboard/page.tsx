"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useDashboardOverviewAllTime } from "@/hooks/useDashboardOverview";

export default function DashboardPage() {
  const overview = useDashboardOverviewAllTime();
  const { data, isLoading, isError, isFetching, refetch } = overview;

  const stats = [
    {
      id: "income",
      label: "Total income",
      value: formatCurrency(data?.totalIncome ?? 0),
      hint: "all time",
    },
    {
      id: "expenses",
      label: "Total expenses",
      value: formatCurrency(data?.totalExpenses ?? 0),
      hint: "all time",
    },
    {
      id: "net",
      label: "Net savings",
      value: formatCurrency(data?.netSavings ?? 0),
      hint: "income minus expenses",
    },
    {
      id: "goals",
      label: "Active goals",
      value: `${data?.goals.length ?? 0}`,
      hint: "in progress",
    },
  ];

  async function handleRefresh() {
    try {
      await refetch();
      toast.success("Dashboard refreshed");
    } catch {
      toast.error("Failed to refresh overview");
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Overview
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
              className="min-h-9 touch-manipulation"
              aria-label="Refresh dashboard data"
            >
              {isFetching ? "Refreshing…" : "Refresh data"}
            </Button>
          </div>
        </div>
        {isError && (
          <p className="text-sm text-destructive">
            Unable to load your latest numbers. Try refreshing.
          </p>
        )}
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ id, label, value, hint }) => (
          <Card key={id} className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-medium">{label}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold sm:text-3xl">
                {isLoading ? "…" : value}
              </p>
              <CardDescription className="text-sm">{hint}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Goals snapshot</CardTitle>
            <CardDescription>
              Track progress across your active savings and growth targets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.goals.length ? (
              data.goals.map((goal) => {
                const progress =
                  goal.current && goal.target
                    ? Math.min(goal.current / goal.target, 1)
                    : 0;
                return (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <p className="font-semibold">{goal.title}</p>
                      <span className="text-muted-foreground">{goal.due}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {formatCurrency(goal.current ?? 0)} of{" "}
                        {formatCurrency(goal.target ?? 0)}
                      </span>
                      <span>{Math.round(progress * 100)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                No goals tracked yet. Visit the goals page to add one.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>
              Jump to the areas you care about most.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1 rounded-xl border border-border/70 bg-muted/50 p-4">
              <p className="text-sm font-medium">Goals</p>
              <p className="text-xs text-muted-foreground">
                Review priority funds and update milestones.
              </p>
            </div>
            <div className="space-y-1 rounded-xl border border-border/70 bg-muted/50 p-4">
              <p className="text-sm font-medium">Savings</p>
              <p className="text-xs text-muted-foreground">
                Allocate money toward your plans and monitor balances.
              </p>
            </div>
            <div className="space-y-1 rounded-xl border border-border/70 bg-muted/50 p-4">
              <p className="text-sm font-medium">Debts &amp; expenses</p>
              <p className="text-xs text-muted-foreground">
                Manage outstanding balances and control spending.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
