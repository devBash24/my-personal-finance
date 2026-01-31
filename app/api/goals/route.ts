import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import {
  getGoalsWithProgress,
  getSavingsAccounts,
  createGoal,
} from "@/lib/db/queries";

export async function GET() {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const [goalsWithProgress, accounts] = await Promise.all([
    getGoalsWithProgress(userId),
    getSavingsAccounts(userId),
  ]);

  return NextResponse.json({
    goals: goalsWithProgress.map((g) => ({
      id: g.id,
      name: g.name,
      targetAmount: g.targetAmount,
      targetDate: g.targetDate
        ? new Date(g.targetDate).toISOString().slice(0, 10)
        : null,
      accountIds: g.accountIds,
      progress: g.progress,
    })),
    accounts: accounts.map((a) => ({
      id: a.id,
      name: a.name,
      initialBalance: String(a.initialBalance ?? "0"),
    })),
  });
}

export async function POST(request: NextRequest) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string; targetAmount?: string; targetDate?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const name = body.name?.trim();
  const targetAmount = body.targetAmount;
  if (!name || !targetAmount) {
    return NextResponse.json(
      { error: "name and targetAmount required" },
      { status: 400 }
    );
  }

  const created = await createGoal(session.user.id, {
    name,
    targetAmount: String(Number(targetAmount) || 0),
    targetDate: body.targetDate ?? null,
  });

  return NextResponse.json({
    id: created.id,
    name: created.name,
    targetAmount: String(created.targetAmount),
    targetDate: created.targetDate
      ? new Date(created.targetDate).toISOString().slice(0, 10)
      : null,
  });
}
