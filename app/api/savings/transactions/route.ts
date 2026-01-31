import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { getOrCreateMonth, createSavingsTransaction } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    month?: number;
    year?: number;
    accountId?: string;
    amount?: string;
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
  const accountId = body.accountId;
  const amount = body.amount;

  if (
    !Number.isFinite(month) ||
    month! < 1 ||
    month! > 12 ||
    !Number.isFinite(year) ||
    !accountId ||
    amount === undefined
  ) {
    return NextResponse.json(
      { error: "month, year, accountId, amount required" },
      { status: 400 }
    );
  }

  const m = await getOrCreateMonth(session.user.id, month!, year!);
  const created = await createSavingsTransaction(session.user.id, {
    accountId,
    monthId: m.id,
    amount: String(Number(amount) || 0),
  });

  return NextResponse.json({
    id: created.id,
    accountId: created.accountId,
    amount: String(created.amount),
  });
}
