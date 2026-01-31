import { NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { getCategories, seedDefaultCategories } from "@/lib/db/queries";

export async function GET() {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let cats = await getCategories(session.user.id);
  if (cats.length === 0) {
    cats = await seedDefaultCategories(session.user.id);
  }
  return NextResponse.json(
    cats.map((c) => ({ id: c.id, name: c.name, type: c.type }))
  );
}
