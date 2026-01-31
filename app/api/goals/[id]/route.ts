import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { updateGoal, deleteGoal } from "@/lib/db/queries";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
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

  const updated = await updateGoal(session.user.id, id, {
    name: body.name,
    targetAmount: body.targetAmount,
    targetDate: body.targetDate,
  });
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    targetAmount: String(updated.targetAmount),
    targetDate: updated.targetDate
      ? new Date(updated.targetDate).toISOString().slice(0, 10)
      : null,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  await deleteGoal(session.user.id, id);
  return NextResponse.json({ success: true });
}
