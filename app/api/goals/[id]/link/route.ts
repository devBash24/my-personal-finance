import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { linkAccountToGoal } from "@/lib/db/queries";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: goalId } = await params;
  if (!goalId) {
    return NextResponse.json({ error: "Goal ID required" }, { status: 400 });
  }

  let body: { accountId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const accountId = body.accountId;
  if (!accountId) {
    return NextResponse.json(
      { error: "accountId required" },
      { status: 400 }
    );
  }

  await linkAccountToGoal(session.user.id, goalId, accountId);
  return NextResponse.json({ success: true });
}
