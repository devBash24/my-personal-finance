import { NextRequest, NextResponse } from "next/server";
import { authServer } from "@/lib/auth/server";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { THEMES } from "@/store/useThemeStore";

function isValidTheme(theme: string): theme is (typeof THEMES)[number]["id"] {
  return THEMES.some((t) => t.id === theme);
}

function normalizeTheme(theme: string): string {
  return theme === "default" ? "light" : theme;
}

export async function GET() {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [settings] = await db
    .select({ theme: userSettings.theme })
    .from(userSettings)
    .where(eq(userSettings.userId, session.user.id))
    .limit(1);

  if (!settings) {
    return NextResponse.json({ theme: "light" });
  }

  return NextResponse.json({
    theme: normalizeTheme(settings.theme ?? "light"),
  });
}

export async function PATCH(request: NextRequest) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { theme?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const theme = body.theme;
  if (!theme || typeof theme !== "string") {
    return NextResponse.json(
      { error: "theme is required" },
      { status: 400 }
    );
  }

  if (!isValidTheme(theme)) {
    return NextResponse.json(
      { error: "Invalid theme" },
      { status: 400 }
    );
  }

  await db
    .update(userSettings)
    .set({
      theme,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(userSettings.userId, session.user.id));

  return NextResponse.json({ theme });
}
