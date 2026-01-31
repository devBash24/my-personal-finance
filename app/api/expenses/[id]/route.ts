import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { updateExpense, deleteExpense } from "@/lib/db/queries";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Expense ID required" }, { status: 400 });
  }

  let body: { name?: string; amount?: string; categoryId?: string };
  try {
    body = await _request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const updated = await updateExpense(session.user.id, id, {
    name: body.name,
    amount: body.amount,
    categoryId: body.categoryId,
  });
  if (!updated) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }
  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    amount: String(updated.amount),
    categoryId: updated.categoryId,
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
    return NextResponse.json({ error: "Expense ID required" }, { status: 400 });
  }

  await deleteExpense(session.user.id, id);
  return NextResponse.json({ success: true });
}
