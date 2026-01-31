"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMonthStore } from "@/store/useMonthStore";
import { useExpenses } from "@/hooks/useExpenses";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { ExpenseRow } from "@/hooks/useExpenses";

export default function ExpensesPage() {
  const { month, year } = useMonthStore();
  const overview = useDashboardOverview(month, year);
  const {
    expenses,
    categories,
    isLoading,
    isFetching,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    isCreating,
    isUpdating,
    isDeleting,
  } = useExpenses(month, year);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const saving = isCreating || isUpdating;
  const expenseBreakdown = overview.data?.expenses ?? [];
  const total = expenses.reduce(
    (s, e) => s + parseFloat(String(e.amount) || "0"),
    0
  );

  function openAdd() {
    setEditingId(null);
    setName("");
    setAmount("");
    setCategoryId(categories[0]?.id ?? "");
    setDialogOpen(true);
  }

  function openEdit(row: ExpenseRow) {
    setEditingId(row.id);
    setName(row.name);
    setAmount(row.amount);
    setCategoryId(row.categoryId);
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) return;
    try {
      if (editingId) {
        await updateExpense({ id: editingId, name, amount, categoryId });
        toast.success("Expense updated");
      } else {
        await createExpense({
          month,
          year,
          name: name.trim(),
          amount: String(Number(amount) || 0),
          categoryId,
        });
        toast.success("Expense added");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this expense?")) return;
    try {
      await deleteExpense(id);
      toast.success("Expense deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Expenses
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Monthly spending
          </h1>
        </div>
        <Button
          onClick={openAdd}
          disabled={isLoading}
          className="min-h-9 touch-manipulation w-full sm:w-auto"
          aria-label="Add expense"
        >
          Add expense
        </Button>
      </header>

      {error && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load expenses."}
        </p>
      )}

      {expenseBreakdown.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {expenseBreakdown.map((item) => {
            const change = item.change ?? 0;
            const changeLabel =
              change > 0
                ? `+${change.toFixed(1)}% vs last month`
                : `${change.toFixed(1)}% vs last month`;
            const changeClass =
              change > 0 ? "text-green-600 dark:text-green-400" : change < 0 ? "text-destructive" : "text-muted-foreground";
            return (
              <Card key={item.id} className="border-border bg-card">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-lg font-semibold">
                    {item.category}
                  </CardTitle>
                  <CardDescription>
                    {formatCurrency(item.amount ?? 0)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className={changeClass}>{changeLabel}</p>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.min(
                          100,
                          ((item.amount ?? 0) / (overview.data?.totalExpenses || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          <CardDescription>
            Total: {formatCurrency(total)} · {expenses.length} items
            {isFetching && (
              <span className="ml-2 text-muted-foreground">Updating…</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : expenses.length === 0 ? (
            <p className="text-muted-foreground">
              No expenses yet. Add one to get started.
            </p>
          ) : (
            <>
              <div className="sm:hidden space-y-2">
                {expenses.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-md border border-border p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{row.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {row.categoryName}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-medium">{row.amount}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(row)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(row.id)}
                        disabled={isDeleting}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-[120px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.categoryName}</TableCell>
                        <TableCell className="text-right">{row.amount}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(row)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(row.id)}
                            disabled={isDeleting}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit expense" : "Add expense"}
            </DialogTitle>
            <DialogDescription>
              Enter name, amount, and category.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exp-name">Name</Label>
              <Input
                id="exp-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-amount">Amount</Label>
              <Input
                id="exp-amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
