import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { getDebts, createDebt } from "@/lib/db/queries";

export async function GET() {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await getDebts(session.user.id);
  return NextResponse.json(
    rows.map((d) => ({
      id: d.id,
      name: d.name,
      principal: String(d.principal),
      interestRate: d.interestRate ? String(d.interestRate) : null,
      monthlyPayment: String(d.monthlyPayment),
    }))
  );
}

export async function POST(request: NextRequest) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const name = body.name?.trim();
  const principal = body.principal;
  const monthlyPayment = body.monthlyPayment;
  if (!name || principal === undefined || monthlyPayment === undefined) {
    return NextResponse.json(
      { error: "name, principal, monthlyPayment required" },
      { status: 400 }
    );
  }

  const created = await createDebt(session.user.id, {
    name,
    principal: String(Number(principal) || 0),
    interestRate: body.interestRate ?? null,
    monthlyPayment: String(Number(monthlyPayment) || 0),
  });

  return NextResponse.json({
    id: created.id,
    name: created.name,
    principal: String(created.principal),
    interestRate: created.interestRate ? String(created.interestRate) : null,
    monthlyPayment: String(created.monthlyPayment),
  });
}
