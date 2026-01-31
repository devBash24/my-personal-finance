import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { deleteSavingsTransaction } from "@/lib/db/queries";

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

  await deleteSavingsTransaction(session.user.id, id);
  return NextResponse.json({ success: true });
}
