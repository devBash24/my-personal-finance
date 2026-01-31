import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { updateDebt, deleteDebt } from "@/lib/db/queries";

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

  let body: {
    name?: string;
    principal?: string;
    interestRate?: string | null;
    monthlyPayment?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const updated = await updateDebt(session.user.id, id, {
    name: body.name,
    principal: body.principal,
    interestRate: body.interestRate,
    monthlyPayment: body.monthlyPayment,
  });
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    principal: String(updated.principal),
    interestRate: updated.interestRate ? String(updated.interestRate) : null,
    monthlyPayment: String(updated.monthlyPayment),
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

  await deleteDebt(session.user.id, id);
  return NextResponse.json({ success: true });
}
