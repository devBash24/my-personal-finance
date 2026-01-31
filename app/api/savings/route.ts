import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import {
  getOrCreateMonth,
  getSavingsAccounts,
  getSavingsTransactionsForMonth,
} from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get("month") ?? "", 10);
  const year = parseInt(searchParams.get("year") ?? "", 10);
  if (
    !Number.isFinite(month) ||
    month < 1 ||
    month > 12 ||
    !Number.isFinite(year)
  ) {
    return NextResponse.json(
      { error: "Valid month (1-12) and year required" },
      { status: 400 }
    );
  }

  const userId = session.user.id;
  const m = await getOrCreateMonth(userId, month, year);
  const [accounts, transactions] = await Promise.all([
    getSavingsAccounts(userId),
    getSavingsTransactionsForMonth(userId, m.id),
  ]);

  return NextResponse.json({
    accounts: accounts.map((a) => ({
      id: a.id,
      name: a.name,
      initialBalance: String(a.initialBalance ?? "0"),
      targetAmount: a.targetAmount ? String(a.targetAmount) : null,
    })),
    transactions: transactions.map((t) => ({
      id: t.id,
      accountId: t.accountId,
      accountName: t.accountName,
      amount: String(t.amount),
    })),
  });
}
