import { NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/db/ensure-profile";

export async function GET() {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await ensureProfile(session.user.id);
  if ("deleted" in result) {
    return NextResponse.json(
      { error: "Account has been deleted" },
      { status: 403 }
    );
  }
  return NextResponse.json({ ok: true });
}
