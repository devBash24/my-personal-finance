"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMonthStore } from "@/store/useMonthStore";
import { useIncome } from "@/hooks/useIncome";
import type { AdditionalIncomeRow, PrimaryIncome } from "@/hooks/useIncome";
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

function parseNum(s: string): number {
  const v = parseFloat(String(s).replace(/,/g, ""));
  return Number.isNaN(v) ? 0 : v;
}

function formatNum(n: number): string {
  return n.toFixed(2);
}

function PrimaryIncomeForm({
  primary,
  isLoading,
  isFetching,
  onSave,
  isSaving,
}: {
  primary: PrimaryIncome | null;
  isLoading: boolean;
  isFetching: boolean;
  onSave: (data: {
    grossIncome: string;
    taxDeduction: string;
    nisDeduction: string;
    otherDeductions: string;
    netIncome: string;
  }) => Promise<void>;
  isSaving: boolean;
}) {
  const [gross, setGross] = useState(primary?.grossIncome ?? "");
  const [tax, setTax] = useState(primary?.taxDeduction ?? "0");
  const [nis, setNis] = useState(primary?.nisDeduction ?? "0");
  const [other, setOther] = useState(primary?.otherDeductions ?? "0");

  const net = formatNum(
    parseNum(gross) - parseNum(tax) - parseNum(nis) - parseNum(other)
  );

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    await onSave({
      grossIncome: gross,
      taxDeduction: tax,
      nisDeduction: nis,
      otherDeductions: other,
      netIncome: net,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Primary income</CardTitle>
        <CardDescription>
          Net = Gross − Tax − NIS − Other deductions
          {isFetching && (
            <span className="ml-2 text-muted-foreground">Updating…</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gross">Gross income</Label>
                <Input
                  id="gross"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={gross}
                  onChange={(e) => setGross(e.target.value)}
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax">Tax deduction</Label>
                <Input
                  id="tax"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nis">NIS deduction</Label>
                <Input
                  id="nis"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="other">Other deductions</Label>
                <Input
                  id="other"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 border-t pt-4">
              <p className="text-sm font-medium">
                Net income: <span className="text-primary">{net}</span>
              </p>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function IncomePage() {
  const { month, year } = useMonthStore();
  const {
    primary,
    additional,
    isLoading,
    isFetching,
    error,
    upsertIncome,
    createAdditionalIncome,
    updateAdditionalIncome,
    deleteAdditionalIncome,
    isUpserting,
    isCreatingAdditional,
    isUpdatingAdditional,
    isDeletingAdditional,
  } = useIncome(month, year);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addLabel, setAddLabel] = useState("");
  const [addAmount, setAddAmount] = useState("");

  const primaryNet = primary
    ? parseNum(primary.netIncome)
    : 0;
  const additionalTotal = additional.reduce(
    (s, a) => s + parseNum(a.amount),
    0
  );
  const totalIncome = primaryNet + additionalTotal;

  const savingAdditional = isCreatingAdditional || isUpdatingAdditional;

  async function handlePrimarySave(data: {
    grossIncome: string;
    taxDeduction: string;
    nisDeduction: string;
    otherDeductions: string;
    netIncome: string;
  }) {
    try {
      await upsertIncome({
        month,
        year,
        ...data,
      });
      toast.success("Income saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  }

  function openAddAdditional() {
    setEditingId(null);
    setAddLabel("");
    setAddAmount("");
    setAddDialogOpen(true);
  }

  function openEditAdditional(row: AdditionalIncomeRow) {
    setEditingId(row.id);
    setAddLabel(row.label);
    setAddAmount(row.amount);
    setAddDialogOpen(true);
  }

  async function handleAdditionalSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!addLabel.trim()) return;
    try {
      if (editingId) {
        await updateAdditionalIncome({
          id: editingId,
          label: addLabel.trim(),
          amount: addAmount,
        });
        toast.success("Additional income updated");
      } else {
        await createAdditionalIncome({
          month,
          year,
          label: addLabel.trim(),
          amount: addAmount,
        });
        toast.success("Additional income added");
      }
      setAddDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function handleDeleteAdditional(id: string) {
    if (!confirm("Remove this additional income?")) return;
    try {
      await deleteAdditionalIncome(id);
      toast.success("Additional income removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Income
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Income
        </h1>
        <p className="mt-1 text-muted-foreground">
          Enter gross income and deductions for the selected month. Add extra
          sources (e.g. side gig) below.
        </p>
      </header>

      {error && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load income."}
        </p>
      )}

      <PrimaryIncomeForm
        key={`${month}-${year}-${primary?.id ?? "empty"}`}
        primary={primary}
        isLoading={isLoading}
        isFetching={isFetching}
        onSave={handlePrimarySave}
        isSaving={isUpserting}
      />

      <Card>
        <CardHeader>
          <CardTitle>Additional income</CardTitle>
          <CardDescription>
            Extra jobs, bonuses, etc. Total income = primary net +{" "}
            {formatNum(additionalTotal)} ={" "}
            <span className="font-medium">{formatNum(totalIncome)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={openAddAdditional}
              disabled={isLoading}
              className="min-h-9 touch-manipulation"
              aria-label="Add additional income"
            >
              Add additional income
            </Button>
            {additional.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No additional income. Add a side gig or bonus.
              </p>
            ) : (
              <>
                <div className="sm:hidden space-y-2">
                  {additional.map((row) => (
                    <div
                      key={row.id}
                      className="rounded-md border border-border p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{row.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {row.amount}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditAdditional(row)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteAdditional(row.id)}
                            disabled={isDeletingAdditional}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Label</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[120px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {additional.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.label}</TableCell>
                          <TableCell className="text-right">
                            {row.amount}
                          </TableCell>
                          <TableCell className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditAdditional(row)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteAdditional(row.id)}
                              disabled={isDeletingAdditional}
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
          </div>
        </CardContent>
      </Card>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId
                ? "Edit additional income"
                : "Add additional income"}
            </DialogTitle>
            <DialogDescription>
              Label (e.g. Side gig) and amount.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdditionalSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-label">Label</Label>
              <Input
                id="add-label"
                value={addLabel}
                onChange={(e) => setAddLabel(e.target.value)}
                placeholder="e.g. Side gig"
                required
                disabled={savingAdditional}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-amount">Amount</Label>
              <Input
                id="add-amount"
                type="text"
                inputMode="decimal"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="0.00"
                required
                disabled={savingAdditional}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingAdditional}>
                {savingAdditional
                  ? "Saving…"
                  : editingId
                    ? "Update"
                    : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
