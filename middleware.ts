import { NextRequest, NextResponse } from "next/server";
import { neonAuthMiddleware } from "@neondatabase/auth/next/server";

const authMiddleware = neonAuthMiddleware({ loginUrl: "/" });

const PUBLIC_PATHS = [
  "/",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
  "/api/ensure-profile",
  "/api/user/theme",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => {
    if (pathname === path) return true;
    if (path === "/") return false;
    return pathname.startsWith(`${path}/`);
  });
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    /\.(ico|svg|png|jpg|jpeg|gif|webp)$/.test(pathname)
  )
    return NextResponse.next();
  return authMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
