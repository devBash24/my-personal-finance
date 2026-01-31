import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import {
  getOrCreateMonth,
  getPreviousMonth,
  getIncomeForMonth,
  getAdditionalIncomeForMonth,
  hasAnyIncomeForMonth,
  copyIncomeFromMonth,
  upsertIncome,
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
  const hasAny = await hasAnyIncomeForMonth(userId, m.id);
  if (!hasAny) {
    const prev = await getPreviousMonth(userId, month, year);
    if (prev.id !== m.id) {
      await copyIncomeFromMonth(userId, prev.id, m.id);
    }
  }

  const [primary, additional] = await Promise.all([
    getIncomeForMonth(userId, m.id),
    getAdditionalIncomeForMonth(userId, m.id),
  ]);

  return NextResponse.json({
    primary: primary
      ? {
          id: primary.id,
          grossIncome: String(primary.grossIncome),
          taxDeduction: String(primary.taxDeduction ?? "0"),
          nisDeduction: String(primary.nisDeduction ?? "0"),
          otherDeductions: String(primary.otherDeductions ?? "0"),
          netIncome: String(primary.netIncome),
        }
      : null,
    additional: additional.map((a) => ({
      id: a.id,
      label: a.label,
      amount: String(a.amount),
    })),
  });
}

export async function PATCH(request: NextRequest) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    month?: number;
    year?: number;
    grossIncome?: string;
    taxDeduction?: string;
    nisDeduction?: string;
    otherDeductions?: string;
    netIncome?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const month = body.month;
  const year = body.year;
  if (
    !Number.isFinite(month) ||
    month! < 1 ||
    month! > 12 ||
    !Number.isFinite(year)
  ) {
    return NextResponse.json(
      { error: "Valid month and year required" },
      { status: 400 }
    );
  }

  const grossIncome = body.grossIncome ?? "0";
  const taxDeduction = body.taxDeduction ?? "0";
  const nisDeduction = body.nisDeduction ?? "0";
  const otherDeductions = body.otherDeductions ?? "0";
  const netIncome = body.netIncome ?? "0";

  const m = await getOrCreateMonth(session.user.id, month!, year!);
  const updated = await upsertIncome(session.user.id, m.id, {
    grossIncome,
    taxDeduction,
    nisDeduction,
    otherDeductions,
    netIncome,
  });

  return NextResponse.json({
    id: updated.id,
    grossIncome: String(updated.grossIncome),
    taxDeduction: String(updated.taxDeduction ?? "0"),
    nisDeduction: String(updated.nisDeduction ?? "0"),
    otherDeductions: String(updated.otherDeductions ?? "0"),
    netIncome: String(updated.netIncome),
  });
}
