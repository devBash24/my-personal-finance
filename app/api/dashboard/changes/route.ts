import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import {
  getMonthsForUser,
  getIncomeForMonths,
  getAdditionalIncomeForMonths,
  getExpensesForMonths,
  getSavingsTransactionsForMonth,
  getSubscriptions,
} from "@/lib/db/queries";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function toNum(v: string | number | null | undefined) {
  return Number(v ?? 0);
}

export async function GET(request: NextRequest) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam === "all" ? 120 : Math.min(12, parseInt(limitParam ?? "12", 10) || 12);

  const userId = session.user.id;
  const monthsList = await getMonthsForUser(userId, limit);
  const monthIds = monthsList.map((m) => m.id);

  const [incomeForMonths, additionalForMonths, expensesForMonths, subscriptions] =
    await Promise.all([
      getIncomeForMonths(userId, monthIds),
      getAdditionalIncomeForMonths(userId, monthIds),
      getExpensesForMonths(userId, monthIds),
      getSubscriptions(userId),
    ]);

  const incomeByMonth = new Map<string, number>();
  const expensesByMonth = new Map<string, number>();
  const savingsByMonth = new Map<string, number>();

  for (const row of incomeForMonths) {
    const prev = incomeByMonth.get(row.monthId) ?? 0;
    incomeByMonth.set(row.monthId, prev + toNum(row.netIncome));
  }
  for (const row of additionalForMonths) {
    const prev = incomeByMonth.get(row.monthId) ?? 0;
    incomeByMonth.set(row.monthId, prev + toNum(row.amount));
  }
  for (const row of expensesForMonths) {
    const prev = expensesByMonth.get(row.monthId) ?? 0;
    expensesByMonth.set(row.monthId, prev + toNum(row.amount));
  }

  for (const mo of monthsList) {
    const tx = await getSavingsTransactionsForMonth(userId, mo.id);
    let total = 0;
    for (const t of tx) total += toNum(t.amount);
    savingsByMonth.set(mo.id, total);
  }

  let subsTotal = 0;
  for (const sub of subscriptions) {
    if (sub.isActive !== false) subsTotal += toNum(sub.amount);
  }

  const reversed = [...monthsList].reverse();
  const rows = reversed.map((mo, i) => {
    const income = incomeByMonth.get(mo.id) ?? 0;
    const expenses = expensesByMonth.get(mo.id) ?? 0;
    const savings = savingsByMonth.get(mo.id) ?? 0;
    const prev = reversed[i + 1];
    const prevIncome = prev ? (incomeByMonth.get(prev.id) ?? 0) : null;
    const prevExpenses = prev ? (expensesByMonth.get(prev.id) ?? 0) : null;
    const prevSavings = prev ? (savingsByMonth.get(prev.id) ?? 0) : null;

    return {
      id: mo.id,
      label: `${MONTH_NAMES[mo.month - 1]} ${mo.year}`,
      month: mo.month,
      year: mo.year,
      income,
      expenses,
      savings,
      subscriptions: subsTotal,
      deltaIncome: prevIncome != null ? income - prevIncome : null,
      deltaExpenses: prevExpenses != null ? expenses - prevExpenses : null,
      deltaSavings: prevSavings != null ? savings - prevSavings : null,
    };
  });

  return NextResponse.json({ data: rows });
}
