import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { createSavingsAccount } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    name?: string;
    initialBalance?: string;
    targetAmount?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json(
      { error: "name required" },
      { status: 400 }
    );
  }

  const created = await createSavingsAccount(session.user.id, {
    name,
    initialBalance: body.initialBalance ?? "0",
    targetAmount: body.targetAmount,
  });

  return NextResponse.json({
    id: created.id,
    name: created.name,
    initialBalance: String(created.initialBalance ?? "0"),
    targetAmount: created.targetAmount ? String(created.targetAmount) : null,
  });
}
