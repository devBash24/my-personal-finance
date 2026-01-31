"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useDashboardChanges } from "@/hooks/useDashboardChanges";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type PeriodLimit = 6 | 12 | "all";

const PERIOD_OPTIONS: { value: PeriodLimit; label: string }[] = [
  { value: 6, label: "6 months" },
  { value: 12, label: "12 months" },
  { value: "all", label: "All time" },
];

function ChartSkeleton() {
  return (
    <div className="h-[260px] w-full animate-pulse rounded-md bg-muted/50 sm:h-[300px]" />
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<PeriodLimit>(12);
  const changes = useDashboardChanges(period);
  const data = changes.data?.data ?? [];

  const lastRow = data[data.length - 1];
  const lastMonth = lastRow?.month ?? new Date().getMonth() + 1;
  const lastYear = lastRow?.year ?? new Date().getFullYear();

  const overview = useDashboardOverview(lastMonth, lastYear);
  const expenseBreakdown = overview.data?.expenses ?? [];

  const isLoading = changes.isLoading;
  const hasData = data.length > 0;

  const chartData = data.map((row) => ({
    ...row,
    netCashFlow: row.income - row.expenses,
  }));

  const pieData = expenseBreakdown
    .filter((e) => (e.amount ?? 0) > 0)
    .map((e) => ({
      name: e.category ?? "Other",
      value: e.amount ?? 0,
    }));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Analytics
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Charts & insights
          </h1>
          <p className="mt-1 text-muted-foreground">
            Visualize income, expenses, and savings over time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((opt) => (
            <Button
              key={String(opt.value)}
              variant={period === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(opt.value)}
              disabled={isLoading}
              className="min-h-9 touch-manipulation"
              aria-label={`View ${opt.label}`}
              aria-pressed={period === opt.value}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </header>

      {changes.error && (
        <p className="text-sm text-destructive">
          {changes.error instanceof Error
            ? changes.error.message
            : "Failed to load analytics data."}
        </p>
      )}

      {!hasData && !isLoading && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              No data yet. Add income and expenses to see charts.
            </p>
          </CardContent>
        </Card>
      )}

      {hasData && (
        <div className="grid gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Income vs expenses</CardTitle>
              <CardDescription>
                Monthly income and expense totals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <div className="h-[260px] w-full min-w-0 sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="label"
                        className="text-[10px] sm:text-xs"
                        tick={{ fill: "var(--muted-foreground)" }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        className="text-[10px] sm:text-xs"
                        tick={{ fill: "var(--muted-foreground)" }}
                        tickFormatter={(v) =>
                          Math.abs(v) >= 1000
                            ? `${v < 0 ? "-" : ""}$${Math.abs(v / 1000).toFixed(1)}k`
                            : formatCurrency(v)
                        }
                        width={36}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)",
                          fontSize: "12px",
                        }}
                        labelStyle={{ color: "var(--foreground)" }}
                        formatter={(value: number, name: string) => [
                          formatCurrency(value),
                          name,
                        ]}
                        labelFormatter={(label) => label}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar
                      dataKey="income"
                      name="Income"
                      fill={CHART_COLORS[0]}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expenses"
                      name="Expenses"
                      fill={CHART_COLORS[1]}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Net cash flow</CardTitle>
              <CardDescription>
                Income minus expenses per month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <div className="h-[260px] w-full min-w-0 sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="label"
                        className="text-[10px] sm:text-xs"
                        tick={{ fill: "var(--muted-foreground)" }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        className="text-[10px] sm:text-xs"
                        tick={{ fill: "var(--muted-foreground)" }}
                        tickFormatter={(v) =>
                          Math.abs(v) >= 1000
                            ? `${v < 0 ? "-" : ""}$${Math.abs(v / 1000).toFixed(1)}k`
                            : formatCurrency(v)
                        }
                        width={36}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => [formatCurrency(value), "Net"]}
                        labelFormatter={(label) => label}
                      />
                      <Area
                      type="monotone"
                      dataKey="netCashFlow"
                      name="Net cash flow"
                      stroke={CHART_COLORS[2]}
                      fill={CHART_COLORS[2]}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Savings over time</CardTitle>
              <CardDescription>
                Monthly savings contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <div className="h-[260px] w-full min-w-0 sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="label"
                        className="text-[10px] sm:text-xs"
                        tick={{ fill: "var(--muted-foreground)" }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        className="text-[10px] sm:text-xs"
                        tick={{ fill: "var(--muted-foreground)" }}
                        tickFormatter={(v) =>
                          Math.abs(v) >= 1000
                            ? `${v < 0 ? "-" : ""}$${Math.abs(v / 1000).toFixed(1)}k`
                            : formatCurrency(v)
                        }
                        width={36}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => [formatCurrency(value), "Savings"]}
                        labelFormatter={(label) => label}
                      />
                      <Area
                        type="monotone"
                        dataKey="savings"
                        name="Savings"
                        stroke={CHART_COLORS[3]}
                        fill={CHART_COLORS[3]}
                        fillOpacity={0.3}
                      />
                  </AreaChart>
                </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense by category</CardTitle>
              <CardDescription>
                Breakdown for {lastRow ? `${lastRow.label}` : "latest month"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overview.isLoading ? (
                <ChartSkeleton />
              ) : pieData.length === 0 ? (
                <div className="flex h-[260px] items-center justify-center sm:h-[300px]">
                  <p className="text-sm text-muted-foreground">
                    No expense data for this month.
                  </p>
                </div>
              ) : (
                <div className="h-[260px] w-full min-w-0 sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                      >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
