"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useDebts } from "@/hooks/useDebts";
import type { DebtRow } from "@/hooks/useDebts";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

function parseNum(s: string): number {
  const v = parseFloat(String(s).replace(/,/g, ""));
  return Number.isNaN(v) ? 0 : v;
}

export default function DebtsPage() {
  const {
    debts,
    isLoading,
    isFetching,
    error,
    createDebt,
    updateDebt,
    deleteDebt,
    isCreating,
    isUpdating,
    isDeleting,
  } = useDebts();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");

  const saving = isCreating || isUpdating;
  const totalPrincipal = debts.reduce((s, d) => s + parseNum(d.principal), 0);
  const totalMonthly = debts.reduce(
    (s, d) => s + parseNum(d.monthlyPayment),
    0,
  );

  function openAdd() {
    setEditingId(null);
    setName("");
    setPrincipal("");
    setInterestRate("");
    setMonthlyPayment("");
    setDialogOpen(true);
  }

  function openEdit(d: DebtRow) {
    setEditingId(d.id);
    setName(d.name);
    setPrincipal(d.principal);
    setInterestRate(d.interestRate ?? "");
    setMonthlyPayment(d.monthlyPayment);
    setDialogOpen(true);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const ir = interestRate.trim() ? interestRate : null;
    try {
      if (editingId) {
        await updateDebt({
          id: editingId,
          name,
          principal,
          interestRate: ir,
          monthlyPayment,
        });
        toast.success("Debt updated");
      } else {
        await createDebt({
          name,
          principal,
          interestRate: ir ?? undefined,
          monthlyPayment,
        });
        toast.success("Debt added");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this debt?")) return;
    try {
      await deleteDebt(id);
      toast.success("Debt deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Loans &amp; credit
          </h1>
          <p className="mt-1 text-muted-foreground">
            Track loans, credit cards, and other debts.
          </p>
        </div>
        <Button
          onClick={openAdd}
          disabled={isLoading}
          className="min-h-9 touch-manipulation w-full sm:w-auto"
          aria-label="Add debt"
        >
          Add debt
        </Button>
      </header>

      {error && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load debts."}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Debts</CardTitle>
          <CardDescription>
            Total principal: {formatCurrency(totalPrincipal)} · Monthly
            payments: {formatCurrency(totalMonthly)}
            {isFetching && debts.length > 0 && (
              <span className="ml-2 text-muted-foreground">Updating…</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : debts.length === 0 ? (
            <p className="text-muted-foreground">
              No debts. Add one to get started.
            </p>
          ) : (
            <>
              <div className="space-y-2 sm:hidden">
                {debts.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-md border border-border p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{d.name}</p>
                        <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                          <p>
                            Principal:{" "}
                            <span className="text-foreground/90">
                              {d.principal}
                            </span>
                          </p>
                          <p>
                            Interest:{" "}
                            <span className="text-foreground/90">
                              {d.interestRate ?? "—"}
                            </span>
                          </p>
                          <p>
                            Monthly:{" "}
                            <span className="text-foreground/90">
                              {d.monthlyPayment}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(d)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(d.id)}
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
                      <TableHead className="text-right">Principal</TableHead>
                      <TableHead className="text-right">Interest %</TableHead>
                      <TableHead className="text-right">Monthly</TableHead>
                      <TableHead className="w-[100px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {debts.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>{d.name}</TableCell>
                        <TableCell className="text-right">
                          {d.principal}
                        </TableCell>
                        <TableCell className="text-right">
                          {d.interestRate ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {d.monthlyPayment}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(d)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(d.id)}
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
            <DialogTitle>{editingId ? "Edit debt" : "Add debt"}</DialogTitle>
            <DialogDescription>
              Name, principal, optional interest rate, and monthly payment.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="debt-name">Name</Label>
              <Input
                id="debt-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="debt-principal">Principal</Label>
                <Input
                  id="debt-principal"
                  type="text"
                  inputMode="decimal"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="debt-ir">Interest rate %</Label>
                <Input
                  id="debt-ir"
                  type="text"
                  inputMode="decimal"
                  placeholder="Optional"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-monthly">Monthly payment</Label>
              <Input
                id="debt-monthly"
                type="text"
                inputMode="decimal"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                required
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
    </div>
  );
}
