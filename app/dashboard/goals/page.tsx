"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useGoals } from "@/hooks/useGoals";
import type { GoalRow, AccountRow } from "@/hooks/useGoals";
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

function parseNum(s: string): number {
  const v = parseFloat(String(s).replace(/,/g, ""));
  return Number.isNaN(v) ? 0 : v;
}

function formatNum(n: number): string {
  return n.toFixed(2);
}

function monthlyNeeded(
  target: number,
  progress: number,
  targetDate: Date | null
): number | null {
  if (!targetDate || target <= progress) return null;
  const now = new Date();
  const end = new Date(targetDate);
  if (end <= now) return null;
  const monthsLeft =
    (end.getFullYear() - now.getFullYear()) * 12 +
    (end.getMonth() - now.getMonth()) +
    (end.getDate() >= now.getDate() ? 0 : -1);
  if (monthsLeft <= 0) return null;
  return (target - progress) / monthsLeft;
}

export default function GoalsPage() {
  const {
    goals,
    accounts,
    isLoading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    linkAccount,
    unlinkAccount,
    isCreating,
    isUpdating,
    isDeleting,
  } = useGoals();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [linkDialogGoalId, setLinkDialogGoalId] = useState<string | null>(null);

  const saving = isCreating || isUpdating;

  function openAdd() {
    setEditingId(null);
    setName("");
    setTargetAmount("");
    setTargetDate("");
    setDialogOpen(true);
  }

  function openEdit(g: GoalRow) {
    setEditingId(g.id);
    setName(g.name);
    setTargetAmount(g.targetAmount);
    setTargetDate(g.targetDate ?? "");
    setDialogOpen(true);
  }

  async function handleGoalSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    try {
      if (editingId) {
        await updateGoal({
          id: editingId,
          name,
          targetAmount,
          targetDate: targetDate || null,
        });
        toast.success("Goal updated");
      } else {
        await createGoal({
          name,
          targetAmount,
          targetDate: targetDate || null,
        });
        toast.success("Goal added");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this goal? Account links will be removed.")) return;
    try {
      await deleteGoal(id);
      toast.success("Goal deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function toggleAccount(
    goalId: string,
    accountId: string,
    linked: boolean
  ) {
    try {
      if (linked) {
        await unlinkAccount({ goalId, accountId });
        toast.success("Account unlinked");
      } else {
        await linkAccount({ goalId, accountId });
        toast.success("Account linked");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Goals
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Savings goals
          </h1>
          <p className="mt-1 text-muted-foreground">
            Track savings goals and link accounts to measure progress.
          </p>
        </div>
        <Button
          onClick={openAdd}
          disabled={isLoading}
          className="min-h-9 touch-manipulation w-full sm:w-auto"
          aria-label="Add goal"
        >
          Add goal
        </Button>
      </header>

      {error && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load goals."}
        </p>
      )}

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={`loading-${i}`} className="border-border bg-card">
              <CardContent className="space-y-2 py-6">
                <div className="h-6 w-32 rounded bg-muted/50" />
                <div className="h-4 w-24 rounded bg-muted/60" />
                <div className="h-2 rounded bg-muted/70" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && goals.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              No goals yet. Add one and link savings accounts to track progress.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && goals.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((g) => {
            const target = parseNum(g.targetAmount);
            const pct =
              target > 0 ? Math.min(100, (g.progress / target) * 100) : 0;
            const td = g.targetDate ? new Date(g.targetDate) : null;
            const needed = monthlyNeeded(target, g.progress, td);
            return (
              <Card key={g.id} className="border-border bg-card">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{g.name}</CardTitle>
                      <CardDescription>
                        {formatNum(g.progress)} / {g.targetAmount} (
                        {formatNum(pct)}%)
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLinkDialogGoalId(g.id)}
                      >
                        Link accounts
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(g)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(g.id)}
                        disabled={isDeleting}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {g.targetDate && (
                    <p className="text-sm text-muted-foreground">
                      Target date:{" "}
                      {new Date(g.targetDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      {needed != null && (
                        <> · {formatNum(needed)}/mo needed</>
                      )}
                    </p>
                  )}
                  {g.accountIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Linked: {g.accountIds.length} account(s)
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit goal" : "Add goal"}
            </DialogTitle>
            <DialogDescription>
              Name, target amount, and optional target date.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGoalSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal-name">Name</Label>
              <Input
                id="goal-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Emergency fund"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-target">Target amount</Label>
              <Input
                id="goal-target"
                type="text"
                inputMode="decimal"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-date">Target date (optional)</Label>
              <Input
                id="goal-date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
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

      <Dialog
        open={!!linkDialogGoalId}
        onOpenChange={(open) => !open && setLinkDialogGoalId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link savings accounts</DialogTitle>
            <DialogDescription>
              Select which accounts contribute to this goal. Progress is the sum
              of their balances.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {linkDialogGoalId &&
              accounts.map((a: AccountRow) => {
                const goal = goals.find((x) => x.id === linkDialogGoalId);
                const linked = goal?.accountIds.includes(a.id) ?? false;
                return (
                  <label
                    key={a.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      checked={linked}
                      onChange={() =>
                        toggleAccount(linkDialogGoalId, a.id, linked)
                      }
                      className="rounded"
                    />
                    <span className="text-sm font-medium">{a.name}</span>
                  </label>
                );
              })}
            {accounts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No savings accounts. Add one in Savings first.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLinkDialogGoalId(null)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
