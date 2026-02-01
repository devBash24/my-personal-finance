import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import {
  getOrCreateMonth,
  getPreviousMonth,
  getMonthsForUser,
  getIncomeForMonth,
  getIncomeForMonths,
  getAdditionalIncomeForMonth,
  getAdditionalIncomeForMonths,
  getExpensesForMonth,
  getExpensesForMonthsWithCategories,
  getSavingsAccounts,
  getSavingsTransactionsForAccount,
  getGoals,
  getGoalAccounts,
  getDebts,
  getSubscriptions,
} from "@/lib/db/queries";

function toNum(v: string | number | null | undefined) {
  return Number(v ?? 0);
}

export async function GET(request: NextRequest) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get("month");
  const yearParam = searchParams.get("year");
  const allTime = !monthParam && !yearParam;

  const userId = session.user.id;
  let totalIncome = 0;
  let expenses: { amount: string | null; categoryName: string | null }[];
  let accounts: Awaited<ReturnType<typeof getSavingsAccounts>>;
  let byCategory: Record<string, number> = {};
  let prevByCategory: Record<string, number> = {};

  if (allTime) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const userMonths = await getMonthsForUser(userId, 10_000);
    const monthsUpToNow = userMonths.filter(
      (m) => m.year < currentYear || (m.year === currentYear && m.month <= currentMonth)
    );
    const monthIds = monthsUpToNow.map((m) => m.id);

    const [incomeRows, additionalIncomeRows, expensesData, accountsData] = await Promise.all([
      getIncomeForMonths(userId, monthIds),
      getAdditionalIncomeForMonths(userId, monthIds),
      getExpensesForMonthsWithCategories(userId, monthIds),
      getSavingsAccounts(userId),
    ]);
    accounts = accountsData;

    for (const row of incomeRows) totalIncome += toNum(row.netIncome);
    for (const row of additionalIncomeRows) totalIncome += toNum(row.amount);
    expenses = expensesData;

    for (const e of expenses) {
      const amt = toNum(e.amount);
      const name = e.categoryName ?? "Other";
      byCategory[name] = (byCategory[name] ?? 0) + amt;
    }
    prevByCategory = {};
  } else {
    const now = new Date();
    const month = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1;
    const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();

    if (!Number.isFinite(month) || month < 1 || month > 12 || !Number.isFinite(year)) {
      return NextResponse.json(
        { error: "Valid month (1-12) and year required" },
        { status: 400 }
      );
    }

    const m = await getOrCreateMonth(userId, month, year);
    const prevMonth = await getPreviousMonth(userId, month, year);

    const [incomeRow, additionalIncome, expensesData, prevExpenses, accountsData] = await Promise.all([
      getIncomeForMonth(userId, m.id),
      getAdditionalIncomeForMonth(userId, m.id),
      getExpensesForMonth(userId, m.id),
      getExpensesForMonth(userId, prevMonth.id),
      getSavingsAccounts(userId),
    ]);
    accounts = accountsData;

    totalIncome = incomeRow ? toNum(incomeRow.netIncome) : 0;
    for (const a of additionalIncome) totalIncome += toNum(a.amount);
    expenses = expensesData;

    for (const e of expenses) {
      const amt = toNum(e.amount);
      const name = e.categoryName ?? "Other";
      byCategory[name] = (byCategory[name] ?? 0) + amt;
    }
    for (const e of prevExpenses) {
      const amt = toNum(e.amount);
      const name = e.categoryName ?? "Other";
      prevByCategory[name] = (prevByCategory[name] ?? 0) + amt;
    }
  }

  let totalExpenses = 0;
  for (const v of Object.values(byCategory)) totalExpenses += v;

  const expenseBreakdown = Object.entries(byCategory).map(([name, value]) => {
    const prev = prevByCategory[name] ?? 0;
    const change = prev > 0 ? ((value - prev) / prev) * 100 : value > 0 ? 100 : 0;
    return {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      category: name,
      amount: value,
      change: allTime ? 0 : change,
    };
  });

  const balanceByAccount = new Map<string, number>();
  for (const a of accounts) {
    balanceByAccount.set(a.id, toNum(a.initialBalance));
  }
  for (const a of accounts) {
    const tx = await getSavingsTransactionsForAccount(userId, a.id);
    let sum = balanceByAccount.get(a.id) ?? 0;
    for (const t of tx) sum += toNum(t.amount);
    balanceByAccount.set(a.id, sum);
  }
  let totalSavings = 0;
  for (const b of balanceByAccount.values()) totalSavings += b;

  const subs = await getSubscriptions(userId);
  let subscriptionsTotal = 0;
  for (const sub of subs) {
    if (sub.isActive !== false) subscriptionsTotal += toNum(sub.amount);
  }

  const goalsList = await getGoals(userId);
  const goalsWithProgress = await Promise.all(
    goalsList.map(async (g) => {
      const accountIds = await getGoalAccounts(userId, g.id);
      let progress = 0;
      for (const aid of accountIds) {
        progress += balanceByAccount.get(aid) ?? 0;
      }
      const target = toNum(g.targetAmount);
      return {
        id: g.id,
        title: g.name,
        target,
        current: progress,
        due: g.targetDate ? new Date(g.targetDate).toLocaleDateString() : null,
      };
    })
  );

  const debtsList = await getDebts(userId);
  const debtsData = debtsList.map((d) => ({
    id: d.id,
    name: d.name,
    balance: toNum(d.principal),
    rate: toNum(d.interestRate),
  }));

  const savingsData = accounts
    .filter((a) => !a.isArchived)
    .map((a) => ({
      id: a.id,
      name: a.name,
      saved: balanceByAccount.get(a.id) ?? 0,
      target: toNum(a.targetAmount) || undefined,
    }));

  return NextResponse.json({
    totalIncome,
    totalExpenses,
    netSavings: totalIncome - totalExpenses,
    totalSavings,
    subscriptionsTotal,
    goals: goalsWithProgress,
    debts: debtsData,
    savings: savingsData,
    expenses: expenseBreakdown,
  });
}
