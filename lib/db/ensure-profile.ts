import { profiles, userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { authServer } from "@/lib/auth/server";
import { seedDefaultCategories } from "./queries";

export type EnsureProfileResult = { ok: true } | { deleted: true };

export async function ensureProfile(userId: string): Promise<EnsureProfileResult> {
  const [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  if (existing?.isDeleted) {
    await authServer.signOut();
    return { deleted: true };
  }

  if (!existing) {
    await db.insert(profiles).values({ id: userId }).onConflictDoNothing();
    await db
      .insert(userSettings)
      .values({ userId, theme: "light" })
      .onConflictDoNothing();
    await seedDefaultCategories(userId);
  }
  return { ok: true };
}
