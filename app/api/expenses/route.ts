import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import {
  getOrCreateMonth,
  getExpensesForMonth,
  createExpense,
} from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get("month") ?? "", 10);
  const year = parseInt(searchParams.get("year") ?? "", 10);
  if (!Number.isFinite(month) || month < 1 || month > 12 || !Number.isFinite(year)) {
    return NextResponse.json(
      { error: "Valid month (1-12) and year required" },
      { status: 400 }
    );
  }

  const m = await getOrCreateMonth(session.user.id, month, year);
  const rows = await getExpensesForMonth(session.user.id, m.id);
  return NextResponse.json({
    expenses: rows.map((r) => ({
      id: r.id,
      name: r.name,
      amount: String(r.amount),
      categoryId: r.categoryId,
      categoryName: r.categoryName,
    })),
  });
}

export async function POST(request: NextRequest) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { month?: number; year?: number; name?: string; amount?: string; categoryId?: string };
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
  const name = body.name;
  const amount = body.amount;
  const categoryId = body.categoryId;

  if (
    !Number.isFinite(month) ||
    month! < 1 ||
    month! > 12 ||
    !Number.isFinite(year) ||
    !name ||
    typeof name !== "string" ||
    !amount ||
    typeof amount !== "string" ||
    !categoryId ||
    typeof categoryId !== "string"
  ) {
    return NextResponse.json(
      { error: "month, year, name, amount, categoryId required" },
      { status: 400 }
    );
  }

  const m = await getOrCreateMonth(session.user.id, month!, year!);
  const created = await createExpense(session.user.id, m.id, {
    name: name.trim(),
    amount: String(Number(amount) || 0),
    categoryId,
  });
  return NextResponse.json({
    id: created.id,
    name: created.name,
    amount: String(created.amount),
    categoryId: created.categoryId,
  });
}
