import { NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Soft delete: set is_deleted = true
    await db
      .update(profiles)
      .set({ isDeleted: true })
      .where(eq(profiles.id, userId));

    await authServer.signOut();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete account", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete account" },
      { status: 500 }
    );
  }
}
