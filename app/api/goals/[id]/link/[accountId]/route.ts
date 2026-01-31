import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { unlinkAccountFromGoal } from "@/lib/db/queries";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; accountId: string }> }
) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: goalId, accountId } = await params;
  if (!goalId || !accountId) {
    return NextResponse.json(
      { error: "Goal ID and account ID required" },
      { status: 400 }
    );
  }

  await unlinkAccountFromGoal(session.user.id, goalId, accountId);
  return NextResponse.json({ success: true });
}
