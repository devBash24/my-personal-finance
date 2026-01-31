"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMonthStore } from "@/store/useMonthStore";
import { useSavings } from "@/hooks/useSavings";
import type { SavingsAccountRow } from "@/hooks/useSavings";
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

function parseNum(s: string): number {
  const v = parseFloat(String(s).replace(/,/g, ""));
  return Number.isNaN(v) ? 0 : v;
}

export default function SavingsPage() {
  const { month, year } = useMonthStore();
  const {
    accounts,
    transactions,
    isLoading,
    isFetching,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    createTransaction,
    deleteTransaction,
    isCreatingAccount,
    isUpdatingAccount,
    isDeletingAccount,
    isCreatingTransaction,
    isDeletingTransaction,
  } = useSavings(month, year);

  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [accountName, setAccountName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [txAccountId, setTxAccountId] = useState("");
  const [txAmount, setTxAmount] = useState("");

  const balanceByAccount = new Map<string, number>();
  for (const a of accounts) {
    balanceByAccount.set(a.id, parseNum(a.initialBalance));
  }
  for (const t of transactions) {
    const cur = balanceByAccount.get(t.accountId) ?? 0;
    balanceByAccount.set(t.accountId, cur + parseNum(t.amount));
  }
  const totalBalance = [...balanceByAccount.values()].reduce(
    (s, b) => s + b,
    0
  );

  const savingAccount = isCreatingAccount || isUpdatingAccount;

  function openAddAccount() {
    setEditingAccountId(null);
    setAccountName("");
    setInitialBalance("0");
    setAccountDialogOpen(true);
  }

  function openEditAccount(a: SavingsAccountRow) {
    setEditingAccountId(a.id);
    setAccountName(a.name);
    setInitialBalance(a.initialBalance ?? "0");
    setAccountDialogOpen(true);
  }

  async function handleAccountSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    try {
      if (editingAccountId) {
        await updateAccount({
          id: editingAccountId,
          name: accountName,
          initialBalance,
        });
        toast.success("Account updated");
      } else {
        await createAccount({ name: accountName, initialBalance });
        toast.success("Account added");
      }
      setAccountDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function handleDeleteAccount(id: string) {
    if (
      !confirm(
        "Delete this account? All transactions for it will also be removed."
      )
    )
      return;
    try {
      await deleteAccount(id);
      toast.success("Account deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  function openAddTransaction() {
    setTxAccountId(accounts[0]?.id ?? "");
    setTxAmount("");
    setTxDialogOpen(true);
  }

  async function handleTxSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!txAccountId) return;
    try {
      await createTransaction({
        month,
        year,
        accountId: txAccountId,
        amount: txAmount,
      });
      toast.success("Contribution added");
      setTxDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function handleDeleteTx(id: string) {
    if (!confirm("Delete this transaction?")) return;
    try {
      await deleteTransaction(id);
      toast.success("Transaction deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Savings
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Savings buckets
          </h1>
          <p className="mt-1 text-muted-foreground">
            Savings accounts and monthly contributions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={openAddAccount}
            disabled={isLoading}
            className="min-h-9 touch-manipulation"
            aria-label="Add savings account"
          >
            Add account
          </Button>
          <Button
            onClick={openAddTransaction}
            disabled={isLoading || accounts.length === 0}
            className="min-h-9 touch-manipulation"
            aria-label="Add contribution"
          >
            Add contribution
          </Button>
        </div>
      </header>

      {error && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load savings."}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
            <CardDescription>
              Total balance: {totalBalance.toFixed(2)}
              {isFetching && accounts.length > 0 && (
                <span className="ml-2 text-muted-foreground">Updating…</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : accounts.length === 0 ? (
              <p className="text-muted-foreground">
                No accounts. Add one to get started.
              </p>
            ) : (
              <ul className="space-y-2">
                {accounts.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                  >
                    <div>
                      <p className="font-medium">{a.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Balance: {(balanceByAccount.get(a.id) ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditAccount(a)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteAccount(a.id)}
                        disabled={isDeletingAccount}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contributions this month</CardTitle>
            <CardDescription>
              {transactions.length} transaction(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : transactions.length === 0 ? (
              <p className="text-muted-foreground">
                No contributions for this month.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.accountName}</TableCell>
                      <TableCell className="text-right">{t.amount}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteTx(t.id)}
                          disabled={isDeletingTransaction}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAccountId ? "Edit account" : "Add account"}
            </DialogTitle>
            <DialogDescription>Name and initial balance.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAccountSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="acc-name">Name</Label>
              <Input
                id="acc-name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acc-balance">Initial balance</Label>
              <Input
                id="acc-balance"
                type="text"
                inputMode="decimal"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAccountDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingAccount}>
                {savingAccount
                  ? "Saving…"
                  : editingAccountId
                    ? "Update"
                    : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={txDialogOpen} onOpenChange={setTxDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add contribution</DialogTitle>
            <DialogDescription>
              Account and amount for this month.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTxSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Account</Label>
              <Select value={txAccountId} onValueChange={setTxAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-amount">Amount</Label>
              <Input
                id="tx-amount"
                type="text"
                inputMode="decimal"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setTxDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingTransaction}>
                {isCreatingTransaction ? "Saving…" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
